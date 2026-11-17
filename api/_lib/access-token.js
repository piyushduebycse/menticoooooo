import crypto from 'node:crypto';

function getSigningSecret() {
  return (
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.JWT_SECRET ||
    'mentico-protected-vault-secret-key-2026'
  ).trim();
}

/**
 * Creates a tamper-proof signed Access Token for a verified purchaser.
 * Token format: mtc_<base64Payload>.<hexSignature>
 */
export function createAccessToken({ email, name = '', orderId = '', paymentId = '', licenseKey = '' }) {
  const secret = getSigningSecret();
  const cleanId = String(paymentId || '').replace(/^pay_/, '');
  const payload = {
    email: (email || '').toLowerCase().trim(),
    name: name || '',
    orderId: orderId || '',
    paymentId: paymentId || '',
    licenseKey: licenseKey || (cleanId ? `MENTICO-IN-${cleanId}-VIP` : 'MENTICO-IN-VIP-PASS'),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 3600 * 5, // 5 years lifetime access
  };

  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(b64Payload).digest('hex');

  return `mtc_${b64Payload}.${signature}`;
}

/**
 * Verifies the tamper-proof signed Access Token.
 * Returns decoded payload if valid, null otherwise.
 */
export function verifyAccessToken(token) {
  if (typeof token !== 'string' || !token.startsWith('mtc_')) {
    return null;
  }

  const parts = token.slice(4).split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [b64Payload, signature] = parts;
  const secret = getSigningSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(b64Payload).digest('hex');

  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSignature, 'hex');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const raw = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const data = JSON.parse(raw);
    if (!data.email) return null;
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

