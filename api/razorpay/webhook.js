import { verifyRazorpayWebhookSignature } from '../_lib/razorpay-admin.js';
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return res.status(503).json({ success: false, error: 'Webhook is unavailable.' });
  try {
    const chunks = [];
    if (!req.rawBody) for await (const chunk of req) chunks.push(chunk);
    const raw = req.rawBody || Buffer.concat(chunks);
    if (!verifyRazorpayWebhookSignature(raw, req.headers['x-razorpay-signature'])) {
      return res.status(400).json({ success: false, error: 'Invalid signature.' });
    }
    JSON.parse(raw.toString('utf8'));
    // Razorpay remains the durable ledger. Reads check its current captured/refund state;
    // no local grant exists for a delayed, duplicated or out-of-order webhook to corrupt.
    return res.status(200).json({ status: 'ok' });
  } catch { return res.status(400).json({ success: false, error: 'Invalid webhook payload.' }); }
}
