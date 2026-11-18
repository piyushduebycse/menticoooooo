import { getFirebaseAdmin } from './firebase-admin.js';
import { clearAuthCache } from './server-auth.js';

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

  if (purchase) {
    if ((payment.order_id && payment.order_id !== orderId) ||
        (payment.status && payment.status !== 'captured') ||
        (purchase.amountInPaise && payment.amount && payment.amount !== purchase.amountInPaise) ||
        (purchase.currency && payment.currency && payment.currency !== purchase.currency)) {
      throw new Error('Payment does not match the captured order and amount.');
    }
  }

  if (purchase?.status === 'paid') {
    if (purchase.paymentId && purchase.paymentId !== payment.id) {
      throw new Error('Order was fulfilled with another payment.');
    }
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

export async function recordPaymentFailure({ orderId, paymentId = null, reason = 'failed' }, database = requirePaymentDatabase()) {
  const { adminDb, FieldValue } = database;
  if (!adminDb || !orderId) return;
  try {
    const purchaseRef = adminDb.collection('purchases').doc(orderId);
    await purchaseRef.set({
      orderId,
      paymentId: paymentId || null,
      status: 'failed',
      failureReason: reason,
      failedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Payment Failure Record Notice]:', err.message);
  }
}

export async function revokePaymentRefund({ orderId = null, paymentId = null, refundId = null, reason = 'refunded' }, database = requirePaymentDatabase()) {
  const { adminDb, FieldValue } = database;
  if (!adminDb) return;
  try {
    let orderRef = null;
    let userId = null;

    if (orderId) {
      orderRef = adminDb.collection('purchases').doc(orderId);
      const snap = await orderRef.get();
      if (snap.exists) userId = snap.data()?.userId;
    } else if (paymentId) {
      const snap = await adminDb.collection('purchases').where('paymentId', '==', paymentId).limit(1).get();
      if (!snap.empty) {
        orderRef = snap.docs[0].ref;
        userId = snap.docs[0].data()?.userId;
      }
    }

    if (orderRef) {
      await orderRef.set({
        status: 'refunded',
        refundId: refundId || null,
        refundReason: reason,
        refundedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    if (userId) {
      await adminDb.collection('users').doc(userId).set({
        hasPurchased: false,
        hasPurchasedPdf: false,
        status: 'refunded',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    clearAuthCache();
  } catch (err) {
    console.warn('[Payment Refund Revocation Notice]:', err.message);
  }
}
