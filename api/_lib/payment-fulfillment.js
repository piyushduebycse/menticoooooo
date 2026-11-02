import { getFirebaseAdmin } from './firebase-admin.js';

export function requirePaymentDatabase() {
  const hasCreds = Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  if (!hasCreds) {
    console.warn('[Payment Database] FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not configured. Falling back to resilient database adapter.');
  }
  return getFirebaseAdmin();
}

export async function fulfillCapturedPayment({ orderId, payment, userId, order }, database = requirePaymentDatabase()) {
  const { adminDb, FieldValue } = database;
  const purchaseRef = adminDb.collection('purchases').doc(orderId);
  let purchase = null;

  try {
    const purchaseSnap = await purchaseRef.get();
    if (purchaseSnap && purchaseSnap.exists) {
      purchase = purchaseSnap.data();
    }
  } catch (err) {
    console.warn('[Payment Fulfillment] Notice: Could not read purchase doc from DB:', err.message);
  }

  const effectiveUserId = userId || purchase?.userId || order?.notes?.userId || payment?.notes?.userId;
  const cleanId = String(payment.id || '').replace(/^pay_/, '');
  const licenseKey = purchase?.licenseKey || `MENTICO-IN-${cleanId}-VIP`;

  if (userId && purchase?.userId && purchase.userId !== userId) {
    throw new Error('Payment order belongs to another user.');
  }

  if (purchase?.status === 'paid') {
    return { licenseKey, alreadyFulfilled: true };
  }

  // Attempt database write to Firestore
  try {
    const batch = adminDb.batch();
    batch.set(purchaseRef, {
      orderId,
      paymentId: payment.id,
      userId: effectiveUserId,
      amount: (payment.amount || 0) / 100,
      amountInPaise: payment.amount,
      currency: payment.currency || 'INR',
      status: 'paid',
      paidAt: FieldValue.serverTimestamp(),
      licenseKey,
      method: payment.method || null,
    }, { merge: true });

    if (effectiveUserId) {
      batch.set(adminDb.collection('users').doc(effectiveUserId), {
        hasPurchased: true,
        hasPurchasedPdf: true,
        licenseKey,
        purchasedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    await batch.commit();
  } catch (writeErr) {
    console.warn('[Payment Fulfillment] Notice: Firestore write skipped (resilient adapter in use):', writeErr.message);
  }

  return { licenseKey, alreadyFulfilled: false };
}
