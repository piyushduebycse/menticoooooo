import { verifyRazorpayWebhookSignature } from '../_lib/razorpay-admin.js';
import { fulfillCapturedPayment } from '../_lib/payment-fulfillment.js';

// Vercel must leave the request bytes intact for Razorpay's HMAC check.
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ success: false, error: 'Webhook is not configured.' });

  try {
    const rawBody = req.rawBody || await readRawBody(req);
    if (!verifyRazorpayWebhookSignature(rawBody, req.headers['x-razorpay-signature'], secret)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment?.order_id || !payment?.id) {
        return res.status(400).json({ success: false, error: 'Payment details are missing.' });
      }
      await fulfillCapturedPayment({ orderId: payment.order_id, payment });
    }
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Razorpay Webhook Error]:', err);
    return res.status(500).json({ success: false, error: 'Webhook could not be processed.' });
  }
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}
