import { getFirebaseAdmin } from './firebase-admin.js';

/**
 * Server-side Firebase ID Token Verification Middleware
 * Enforces that every protected API route verifies the client token.
 * A token must be verified by Firebase Admin before it can authorize a purchase.
 */
export async function verifyAuthUser(req, res) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Bearer token in Authorization header.',
    });
    return null;
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  let adminAuth;
  let adminDb;
  try {
    ({ adminAuth, adminDb } = getFirebaseAdmin());
  } catch (err) {
    console.error('[Server Auth] Firebase Admin is unavailable:', err);
    res.status(503).json({ success: false, error: 'Firebase authentication is unavailable.' });
    return null;
  }
  if (!adminAuth) {
    res.status(503).json({ success: false, error: 'Firebase authentication is unavailable.' });
    return null;
  }
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired Firebase ID token.', code: err.code || 'auth/invalid-token' });
    return null;
  }

  // 2. Fetch purchase status from Firestore/in-memory DB
  let hasPurchased = false;
  let userData = {};

  try {
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
      userData = userDoc.data();
      hasPurchased = Boolean(userData.hasPurchased ?? userData.hasPurchasedPdf ?? false);
    }
  } catch (dbErr) {
    console.error('[Server Auth] User profile lookup failed:', dbErr);
    res.status(503).json({ success: false, error: 'Could not check purchase status.' });
    return null;
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email,
    emailVerified: Boolean(decodedToken.email_verified),
    name: decodedToken.name || userData.displayName || '',
    hasPurchased,
    decodedToken,
  };
}
