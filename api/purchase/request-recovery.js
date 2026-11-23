import { getRazorpayClient } from '../_lib/razorpay-admin.js';
import { assertPaidPurchase, PurchaseError } from '../_lib/payment-fulfillment.js';
import { createRecoveryToken } from '../_lib/recovery-token.js';
import { isRecoveryMailConfigured, sendRecoveryEmail } from '../_lib/recovery-mail.js';
const GENERIC = 'If these details match an active purchase, a verification link will arrive in your purchase email. Check your spam folder too.';
export async function handleRequestRecovery(req, res, {
  getClient = getRazorpayClient, configured = isRecoveryMailConfigured, sendEmail = sendRecoveryEmail,
} = {}) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, error: 'Method not allowed.' }); }
  const { email, paymentId } = req.body || {};
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof paymentId !== 'string' || !/^pay_[a-zA-Z0-9]{1,80}$/.test(paymentId)) {
    return res.status(400).json({ success: false, error: 'Enter your purchase email and Razorpay payment ID (starting with pay_).' });
  }
  if (!configured()) return res.status(503).json({ success: false, error: 'Email recovery is temporarily unavailable. Contact support with your payment ID; please do not pay again.' });
  try {
    const client = getClient();
    const payment = await client.payments.fetch(paymentId);
    if (!/^order_[a-zA-Z0-9]{1,80}$/.test(payment?.order_id || '')) throw new PurchaseError('No matching purchase.');
    const order = await client.orders.fetch(payment.order_id);
    const purchase = assertPaidPurchase({ orderId: payment.order_id, paymentId, order, payment, email: email.trim().toLowerCase() });
    const token = createRecoveryToken(purchase);
    await sendEmail({ email: purchase.email, token });
    // Never return a recovery token or purchase data before email verification.
    return res.status(200).json({ success: true, message: GENERIC });
  } catch (err) {
    if (err instanceof PurchaseError || err?.statusCode === 400 || err?.statusCode === 404) {
      return res.status(200).json({ success: true, message: GENERIC });
    }
    return res.status(503).json({ success: false, error: 'Recovery is temporarily unavailable. Retry shortly or contact support; please do not pay again.' });
  }
}
export default function handler(req, res) { return handleRequestRecovery(req, res); }
