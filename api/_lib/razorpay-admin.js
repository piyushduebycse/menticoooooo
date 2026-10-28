import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Server-only Razorpay SDK Singleton & Signature Verifiers
 * Executed solely inside Vercel Serverless Functions (/api/*).
 */
let razorpayInstance = null;

export function getRazorpayClient() {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!key_id || !key_secret) {
    throw new Error('Razorpay server credentials are not configured.');
  }

  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });

  return razorpayInstance;
}

/**
 * Verify Razorpay Checkout Signature
 * HMAC SHA256 of (order_id + "|" + payment_id) with secret
 */
export function verifyRazorpayPaymentSignature({ orderId, paymentId, signature }) {
  const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!secret) {
    throw new Error('Server RAZORPAY_KEY_SECRET is not configured.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return safeSignatureMatch(generatedSignature, signature);
}

/**
 * Verify Razorpay Webhook Signature
 */
export function verifyRazorpayWebhookSignature(rawBody, signature, secret) {
  const webhookSecret = (secret || process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  if (!webhookSecret) {
    throw new Error('Server RAZORPAY_WEBHOOK_SECRET is not configured.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return safeSignatureMatch(expectedSignature, signature);
}

function safeSignatureMatch(expected, actual) {
  if (typeof actual !== 'string' || !/^[a-f0-9]{64}$/i.test(actual)) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(actual, 'hex'));
}
