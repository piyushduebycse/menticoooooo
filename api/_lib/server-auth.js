import { verifyAccessToken } from './access-token.js';
import { getVerifiedPurchase, PurchaseError } from './payment-fulfillment.js';

// No purchase/profile cache: refunds are checked against Razorpay for each request.
export async function verifyAuthUser(req, res, { verifyPurchase = getVerifiedPurchase } = {}) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: A purchase access pass is required.' });
    return null;
  }
  if (!(process.env.ACCESS_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET)?.trim()) {
    res.status(503).json({ success: false, error: 'Purchase verification is temporarily unavailable.' });
    return null;
  }
  const pass = verifyAccessToken(header.slice(7).trim());
  if (!pass) {
    res.status(401).json({ success: false, error: 'Invalid or expired purchase pass.', code: 'auth/invalid-pass' });
    return null;
  }
  try {
    const purchase = await verifyPurchase({ orderId: pass.orderId, paymentId: pass.paymentId, email: pass.email });
    return { ...purchase, emailVerified: false, hasPurchased: true, hasPurchasedPdf: true, isGuestPass: true };
  } catch (err) {
    if (!(err instanceof PurchaseError)) console.error('[Purchase verification unavailable]', err.message);
    res.status(err instanceof PurchaseError ? err.status : 503).json({
      success: false,
      error: err instanceof PurchaseError ? err.message : 'We could not confirm your purchase right now. Please retry shortly.',
    });
    return null;
  }
}
