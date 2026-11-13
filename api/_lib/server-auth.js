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
  let adminRtdb;
  try {
    ({ adminAuth, adminDb, adminRtdb } = getFirebaseAdmin());
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

  // 2. Fetch purchase status from Firebase Realtime Database and/or Firestore
  let hasPurchased = false;
  let userData = {};

  // Check Firebase Realtime Database
  if (adminRtdb) {
    try {
      const userSnap = await adminRtdb.ref(`users/${decodedToken.uid}`).once('value');
      if (userSnap.exists()) {
        const val = userSnap.val() || {};
        userData = { ...val };
        if (val.hasPurchased || val.hasPurchasedPdf) {
          hasPurchased = true;
        }
      }
      if (!hasPurchased) {
        const purchaseSnap = await adminRtdb.ref(`purchases/${decodedToken.uid}`).once('value');
        if (purchaseSnap.exists()) {
          const pVal = purchaseSnap.val() || {};
          if (pVal.hasPurchased || pVal.hasPurchasedPdf || pVal.status === 'paid' || pVal.active) {
            hasPurchased = true;
          }
        }
      }
    } catch (rtdbErr) {
      console.warn('[Server Auth] RTDB lookup notice:', rtdbErr.message);
    }
  }

  // Check Cloud Firestore (existing project database)
  if (!hasPurchased && adminDb) {
    try {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const fData = userDoc.data() || {};
        userData = { ...userData, ...fData };
        if (fData.hasPurchased || fData.hasPurchasedPdf) {
          hasPurchased = true;
        }
      }
    } catch (dbErr) {
      console.warn('[Server Auth] Firestore user profile lookup notice:', dbErr.message);
    }
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
