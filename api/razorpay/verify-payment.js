import { getRazorpayClient, verifyRazorpayPaymentSignature } from '../_lib/razorpay-admin.js';
import { getVerifiedPurchase, assertMenticoOrder, validatePurchaseIds, PurchaseError } from '../_lib/payment-fulfillment.js';
import { createAccessToken } from '../_lib/access-token.js';

export async function handleVerifyPayment(req, res, { getClient = getRazorpayClient } = {}) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  const { orderId, paymentId, signature } = req.body || {};
  try {
    validatePurchaseIds(orderId, paymentId);
    if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }
    const client = getClient();
    const [order, payment] = await Promise.all([client.orders.fetch(orderId), client.payments.fetch(paymentId)]);
    assertMenticoOrder(order);
    if (payment.order_id !== orderId || payment.amount !== order.amount || payment.currency !== order.currency) {
      throw new PurchaseError('Payment does not match this order.');
    }
    if (payment.status === 'authorized') {
      await client.payments.capture(paymentId, order.amount, order.currency);
    }
    // Re-fetch authoritative status after capture, including any refund information.
    const purchase = await getVerifiedPurchase({ orderId, paymentId }, { client });
    const accessToken = createAccessToken(purchase);
    return res.status(200).json({ success: true, verified: true, ...purchase, accessToken,
      hasPurchased: true, hasPurchasedPdf: true, message: 'Your field guide is ready.' });
  } catch (err) {
    if (!(err instanceof PurchaseError)) console.error('[Verify payment failed]', err.message);
    return res.status(err instanceof PurchaseError ? err.status : 503).json({ success: false,
      error: err instanceof PurchaseError ? err.message : 'We could not confirm your payment right now. Retry confirmation; do not pay again.' });
  }
}
export default function handler(req, res) { return handleVerifyPayment(req, res); }
