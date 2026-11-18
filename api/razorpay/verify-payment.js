import { verifyAuthUser } from '../_lib/server-auth.js';
import { getRazorpayClient, verifyRazorpayPaymentSignature } from '../_lib/razorpay-admin.js';
import { fulfillCapturedPayment } from '../_lib/payment-fulfillment.js';
import { createAccessToken } from '../_lib/access-token.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Support both logged-in users and guest purchasers
  let authUser = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authUser = await verifyAuthUser(req, res);
  }

  const { orderId, paymentId, signature } = req.body || {};
  if (typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing payment verification fields.' });
  }

  try {
    // 1. Verify Razorpay HMAC SHA256 Signature
    if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }

    const razorpay = getRazorpayClient();

    // 2. Fetch order from Razorpay to verify details
    const order = await razorpay.orders.fetch(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Payment order not found.' });
    }

    if (authUser && order.notes?.userId && order.notes.userId !== authUser.uid && !authUser.isGuestPass) {
      return res.status(403).json({ success: false, error: 'Payment order does not belong to this account.' });
    }

    // 3. Fetch payment from Razorpay to verify status
    let payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== orderId) {
      return res.status(400).json({ success: false, error: 'Payment does not match this order.' });
    }

    // Auto-capture if authorized
    if (payment.status === 'authorized') {
      try {
        payment = await razorpay.payments.capture(paymentId, payment.amount, payment.currency || 'INR');
      } catch (capErr) {
        console.warn('[Razorpay Auto-Capture Notice]:', capErr.message);
      }
    }

    if (payment.status !== 'captured') {
      return res.status(409).json({
        success: false,
        error: `Payment status is ${payment.status}. If your account was debited, it will unlock shortly.`,
      });
    }

    // 4. Resolve buyer identity
    const buyerEmail = (order.notes?.userEmail || payment.notes?.userEmail || payment.email || req.body?.email || authUser?.email || '').toLowerCase().trim();
    const buyerName = order.notes?.userName || payment.notes?.userName || req.body?.name || authUser?.name || '';
    const effectiveUserId = authUser?.uid || order.notes?.userId || (buyerEmail ? `guest_${buyerEmail.replace(/[^a-zA-Z0-9]/g, '_')}` : `user_${paymentId}`);

    // 5. Fulfill payment in database
    const result = await fulfillCapturedPayment({ orderId, payment, userId: effectiveUserId, order });

    // 6. Generate cryptographically signed Mentico Access Pass
    const accessToken = createAccessToken({
      email: buyerEmail,
      name: buyerName,
      orderId,
      paymentId,
      licenseKey: result.licenseKey,
    });

    return res.status(200).json({
      success: true,
      verified: true,
      licenseKey: result.licenseKey,
      accessToken,
      orderId,
      paymentId,
      email: buyerEmail,
      name: buyerName,
      hasPurchased: true,
      hasPurchasedPdf: true,
      message: 'Payment verified. The manual is unlocked.',
    });
  } catch (err) {
    console.error('[Razorpay Verify Payment Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Could not verify payment. If you were charged, please contact support with your payment ID.',
    });
  }
}
