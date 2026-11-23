import crypto from 'node:crypto';
import { PRODUCT_AMOUNT_IN_PAISE, PRODUCT_CURRENCY } from '../../shared/product.js';
import { getRazorpayClient } from '../_lib/razorpay-admin.js';

export async function handleCreateOrder(req, res, { getClient = getRazorpayClient } = {}) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  const { name, email, phone, displayedAmountInPaise } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || name.length > 120 ||
      typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please enter your name and a valid email address.' });
  }
  if (displayedAmountInPaise != null && displayedAmountInPaise !== PRODUCT_AMOUNT_IN_PAISE) {
    return res.status(409).json({ success: false, error: 'The price has changed. Please refresh before paying.' });
  }
  try {
    const client = getClient();
    const order = await client.orders.create({
      amount: PRODUCT_AMOUNT_IN_PAISE, currency: PRODUCT_CURRENCY,
      receipt: `mtc_${crypto.randomBytes(12).toString('hex')}`,
      partial_payment: false,
      notes: {
        productId: 'social-freedom', productName: 'Mentico - Social Freedom (PDF Field Manual)',
        userName: name.trim(), userEmail: email.trim().toLowerCase(),
        userPhone: typeof phone === 'string' ? phone.trim().slice(0, 30) : '',
      },
    });
    return res.status(200).json({ success: true, orderId: order.id, amount: order.amount,
      currency: order.currency, keyId: client.key_id, productName: 'Social Freedom by Mentico' });
  } catch (err) {
    console.error('[Create order failed]', err.message);
    return res.status(503).json({ success: false, error: 'Checkout is temporarily unavailable. Please retry shortly.' });
  }
}
export default function handler(req, res) { return handleCreateOrder(req, res); }
