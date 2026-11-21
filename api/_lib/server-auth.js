import { getFirebaseAdmin } from './firebase-admin.js';
import { verifyAccessToken } from './access-token.js';

export const PAYMENT_STATES = {
  CREATED: 'created', PENDING: 'pending', PAID: 'paid', FAILED: 'failed',
  CANCELLED: 'cancelled', REFUNDED: 'refunded',
};

// Entitlements are read afresh for every request, including range requests.
export function clearAuthCache() {}

export async function verifyAuthUser(req, res, { getAdmin = getFirebaseAdmin } = {}) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Bearer token required.' });
    return null;
  }
  const token = header.slice(7).trim();
  try {
    // Production cannot silently substitute an in-memory purchase store.
    if (getAdmin === getFirebaseAdmin && (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY)) {
      throw new Error('Firebase Admin payment database is not configured.');
    }
    const { adminDb, adminAuth } = getAdmin();
    if (token.startsWith('mtc_')) {
      const pass = verifyAccessToken(token);
      if (!pass) {
        res.status(401).json({ success: false, error: 'Invalid or expired access pass.' });
        return null;
      }
      const snap = await adminDb.collection('purchases').doc(pass.orderId).get();
      const purchase = snap.exists ? snap.data() : null;
      if (!purchase || purchase.status !== 'paid' || purchase.paymentId !== pass.paymentId ||
          purchase.userEmail?.toLowerCase() !== pass.email.toLowerCase()) {
        res.status(403).json({ success: false, error: 'A matching paid order is required.' });
        return null;
      }
      return { uid: purchase.userId, email: pass.email, name: pass.name,
        hasPurchased: true, hasPurchasedPdf: true, licenseKey: purchase.licenseKey, isGuestPass: true };
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token, true);
    } catch {
      res.status(401).json({ success: false, error: 'Invalid or expired Firebase ID token.' });
      return null;
    }
    const purchases = adminDb.collection('purchases');
    const owned = await purchases.where('userId', '==', decoded.uid).where('status', '==', 'paid').limit(1).get();
    let hasPurchased = !owned.empty;
    // Matching an unverified email would let someone claim a guest buyer's purchase.
    if (!hasPurchased && decoded.email_verified === true && decoded.email) {
      const byEmail = await purchases.where('userEmail', '==', decoded.email.toLowerCase()).where('status', '==', 'paid').limit(1).get();
      hasPurchased = !byEmail.empty;
    }
    return { uid: decoded.uid, email: decoded.email, emailVerified: decoded.email_verified === true,
      name: decoded.name || '', hasPurchased, decodedToken: decoded };
  } catch (err) {
    console.error('[Server Auth] Purchase verification unavailable:', err.message);
    res.status(503).json({ success: false, error: 'Purchase verification is temporarily unavailable. Please retry.' });
    return null;
  }
}
