import crypto from 'node:crypto';
const PREFIX = 'mtcr_';
const WINDOW_SECONDS = 15 * 60;
function secret() {
  const value = (process.env.ACCESS_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!value) throw new Error('Recovery signing is unavailable.');
  return value;
}
export function createRecoveryToken({ email, orderId, paymentId }, now = Date.now()) {
  // Stable within a 15-minute window so mail-provider idempotency suppresses resends.
  const window = Math.floor(now / 1000 / WINDOW_SECONDS);
  const payload = Buffer.from(JSON.stringify({ purpose: 'restore-purchase', email, orderId, paymentId,
    exp: (window + 2) * WINDOW_SECONDS })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret()).update(`recovery:${payload}`).digest('hex');
  return `${PREFIX}${payload}.${signature}`;
}
export function verifyRecoveryToken(token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 2048 || !token.startsWith(PREFIX)) return null;
  const [payload, signature, extra] = token.slice(PREFIX.length).split('.');
  if (extra !== undefined || !/^[a-zA-Z0-9_-]+$/.test(payload || '') || !/^[a-f0-9]{64}$/.test(signature || '')) return null;
  try {
    const expected = crypto.createHmac('sha256', secret()).update(`recovery:${payload}`).digest();
    if (!crypto.timingSafeEqual(expected, Buffer.from(signature, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const seconds = Math.floor(now / 1000);
    if (data.purpose !== 'restore-purchase' || !Number.isFinite(data.exp) || data.exp <= seconds || data.exp > seconds + 2 * WINDOW_SECONDS ||
      !['email', 'orderId', 'paymentId'].every(key => typeof data[key] === 'string' && data[key])) return null;
    return data;
  } catch { return null; }
}
