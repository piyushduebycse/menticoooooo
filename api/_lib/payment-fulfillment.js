import { getFirebaseAdmin } from './firebase-admin.js';

export function requirePaymentDatabase() {
  const hasCreds = Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  if (!hasCreds) {
    console.warn('[Payment Database] FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not configured. Falling back to resilient database adapter.');
  }
  return getFirebaseAdmin();
}

export async function fulfillCapturedPayment({ orderId, payment, userId }, database = requirePaymentDatabase()) {
  const { adminDb, FieldValue } = database;
  const purchaseRef = adminDb.collection('purchases').doc(orderId);
  const purchaseSnap = await purchaseRef.get();
  if (!purchaseSnap.exists) throw new Error('Unknown payment order.');
  const purchase = purchaseSnap.data();
  if (userId && purchase.userId !== userId) throw new Error('Payment order belongs to another user.');
  if (payment.order_id !== orderId || payment.status !== 'captured' ||
      payment.amount !== purchase.amountInPaise || payment.currency !== purchase.currency) {
    throw new Error('Payment does not match the captured order and amount.');
  }
  if (purchase.status === 'paid') {
    if (purchase.paymentId !== payment.id) throw new Error('Order was fulfilled with another payment.');
    return { licenseKey: purchase.licenseKey, alreadyFulfilled: true };
  }

  const licenseKey = `MENTICO-IN-${payment.id}-VIP`;
  const batch = adminDb.batch();
  batch.set(purchaseRef, {
    paymentId: payment.id,
    status: 'paid',
    paidAt: FieldValue.serverTimestamp(),
    licenseKey,
    method: payment.method || null,
  }, { merge: true });
  batch.set(adminDb.collection('users').doc(purchase.userId), {
    hasPurchased: true,
    hasPurchasedPdf: true,
    licenseKey,
    purchasedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  await batch.commit();
  return { licenseKey, alreadyFulfilled: false };
}
