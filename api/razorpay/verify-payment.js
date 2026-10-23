import { verifyAuthUser } from '../_lib/server-auth.js';
import { verifyRazorpayPaymentSignature } from '../_lib/razorpay-admin.js';
import { getFirebaseAdmin } from '../_lib/firebase-admin.js';

/**
 * POST /api/razorpay/verify-payment
 * Cryptographically verifies Razorpay payment signature & unlocks PDF access in Firestore.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Authenticate user
  const authUser = await verifyAuthUser(req, res);
  if (!authUser) return;

  const { orderId, paymentId, signature } = req.body || {};

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({
      success: false,
      error: 'Missing required payment verification fields (orderId, paymentId, signature).',
    });
  }

  // 2. Cryptographic signature verification
  let isValid = false;
  try {
    isValid = verifyRazorpayPaymentSignature({ orderId, paymentId, signature });
  } catch (err) {
    console.error('[Signature Verification Error]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Server error during signature verification. Verify RAZORPAY_KEY_SECRET is configured.',
    });
  }

  if (!isValid) {
    console.error(`[Fraud Warning] Invalid Razorpay signature for user ${authUser.uid}, order ${orderId}`);
    return res.status(400).json({
      success: false,
      error: 'Payment verification failed: Invalid cryptographic signature.',
    });
  }

  // 3. Atomically grant manual license in Firestore
  const { adminDb, FieldValue } = getFirebaseAdmin();
  const licenseKey = `MENTICO-IN-${Math.floor(1000 + Math.random() * 9000)}-VIP`;

  try {
    const batch = adminDb.batch();

    // A) Update purchase transaction record
    const purchaseRef = adminDb.collection('purchases').doc(orderId);
    batch.set(
      purchaseRef,
      {
        orderId,
        paymentId,
        signature,
        userId: authUser.uid,
        userEmail: authUser.email || '',
        status: 'paid',
        paidAt: FieldValue.serverTimestamp(),
        licenseKey,
      },
      { merge: true }
    );

    // B) Grant hasPurchased to user document
    const userRef = adminDb.collection('users').doc(authUser.uid);
    batch.set(
      userRef,
      {
        hasPurchased: true,
        hasPurchasedPdf: true,
        licenseKey,
        purchasedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();

    return res.status(200).json({
      success: true,
      verified: true,
      licenseKey,
      message: 'Payment verified successfully. Social Freedom manual unlocked.',
    });
  } catch (dbErr) {
    console.error('[Firestore Commit Error]:', dbErr);
    return res.status(500).json({
      success: false,
      error: 'Payment verified with Razorpay, but database grant failed. Please contact support@mentico.in.',
    });
  }
}
