import { verifyRazorpayWebhookSignature } from '../_lib/razorpay-admin.js';
import { getFirebaseAdmin } from '../_lib/firebase-admin.js';

/**
 * POST /api/razorpay/webhook
 * Idempotent webhook handler for Razorpay payment events.
 * Guarantees license unlock even if user closes browser during UPI redirect.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Validate webhook secret & signature if configured
  if (webhookSecret && webhookSignature) {
    try {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const isValid = verifyRazorpayWebhookSignature(rawBody, webhookSignature, webhookSecret);
      if (!isValid) {
        console.warn('[Razorpay Webhook] Invalid webhook signature detected.');
        return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
      }
    } catch (err) {
      console.error('[Razorpay Webhook Signature Error]:', err.message);
      return res.status(400).json({ success: false, error: 'Signature verification error.' });
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  console.log(`[Razorpay Webhook] Received event: ${event}`);

  if (event === 'payment.captured' || event === 'order.paid') {
    const payment = payload?.payment?.entity;
    const orderId = payment?.order_id;
    const userId = payment?.notes?.userId;

    if (orderId && userId) {
      try {
        const { adminDb, FieldValue } = getFirebaseAdmin();
        const batch = adminDb.batch();

        const purchaseRef = adminDb.collection('purchases').doc(orderId);
        batch.set(
          purchaseRef,
          {
            orderId,
            paymentId: payment.id,
            status: 'paid',
            paidAt: FieldValue.serverTimestamp(),
            method: payment.method || 'upi',
          },
          { merge: true }
        );

        const userRef = adminDb.collection('users').doc(userId);
        batch.set(
          userRef,
          {
            hasPurchased: true,
            hasPurchasedPdf: true,
            purchasedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        await batch.commit();
        console.log(`[Razorpay Webhook] Successfully processed license grant for user ${userId}, order ${orderId}`);
      } catch (dbErr) {
        console.error('[Razorpay Webhook Database Error]:', dbErr);
      }
    }
  }

  // Return 200 OK to Razorpay
  return res.status(200).json({ status: 'ok' });
}
