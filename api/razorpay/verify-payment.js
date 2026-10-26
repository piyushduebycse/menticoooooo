import { verifyAuthUser } from '../_lib/server-auth.js';
import { getRazorpayClient, verifyRazorpayPaymentSignature } from '../_lib/razorpay-admin.js';
import { fulfillCapturedPayment, requirePaymentDatabase } from '../_lib/payment-fulfillment.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const authUser = await verifyAuthUser(req, res);
  if (!authUser) return;

  const { orderId, paymentId, signature } = req.body || {};
  if (typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing payment verification fields.' });
  }

  try {
    const { adminDb } = requirePaymentDatabase();
    const purchaseSnap = await adminDb.collection('purchases').doc(orderId).get();
    if (!purchaseSnap.exists || purchaseSnap.data().userId !== authUser.uid) {
      return res.status(403).json({ success: false, error: 'Payment order does not belong to this account.' });
    }
    if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }

    const payment = await getRazorpayClient().payments.fetch(paymentId);
    const result = await fulfillCapturedPayment({ orderId, payment, userId: authUser.uid });
    return res.status(200).json({
      success: true,
      verified: true,
      licenseKey: result.licenseKey,
      message: 'Payment verified. The manual is unlocked.',
    });
  } catch (err) {
    console.error('[Razorpay Verify Payment Error]:', err);
    if (err.message === 'Payment does not match the captured order and amount.') {
      return res.status(409).json({ success: false, error: 'Payment is awaiting final confirmation. Do not pay again; access will unlock when Razorpay confirms capture. Contact support with your payment ID if it remains pending.' });
    }
    return res.status(500).json({ success: false, error: 'Could not verify payment. If you were charged, please contact support with your payment ID.' });
  }
}
