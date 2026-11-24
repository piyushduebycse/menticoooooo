import { getProductPlan } from '../../shared/product.js';
import { getRazorpayClient } from './razorpay-admin.js';

export class PurchaseError extends Error {
  constructor(message, status = 403) { super(message); this.status = status; }
}

export function validatePurchaseIds(orderId, paymentId) {
  if (!/^order_[a-zA-Z0-9]{1,80}$/.test(orderId || '') || !/^pay_[a-zA-Z0-9]{1,80}$/.test(paymentId || '')) {
    throw new PurchaseError('Invalid payment reference.', 400);
  }
}

export function assertMenticoOrder(order) {
  const isMentico = order?.notes?.productId === 'social-freedom' ||
    order?.notes?.productName === 'Mentico - Social Freedom (PDF Field Manual)';
  if (!isMentico || order.currency !== 'INR' || !Number.isSafeInteger(order.amount) || order.amount < 100 ||
      order.partial_payment === true || typeof order.notes?.userEmail !== 'string' || !order.notes.userEmail.includes('@')) {
    throw new PurchaseError('This order does not match the Social Freedom course.');
  }
}

// Both arguments must come from Razorpay's authenticated server API, never request JSON.
export function assertPaidPurchase({ orderId, paymentId, order, payment, email }) {
  assertMenticoOrder(order);
  if (order.id !== orderId || payment?.id !== paymentId || payment.order_id !== orderId ||
      payment.amount !== order.amount || payment.currency !== order.currency) {
    throw new PurchaseError('Payment does not match the order and amount.');
  }
  if (payment.amount_refunded !== 0 || payment.refund_status !== null) {
    throw new PurchaseError('Access is unavailable for a refunded payment.');
  }
  if (payment.status !== 'captured' || payment.captured === false || order.status !== 'paid' ||
      order.amount_paid !== order.amount || order.amount_due !== 0) {
    throw new PurchaseError('Payment is awaiting confirmation. Please confirm it again shortly; do not pay again.', 409);
  }
  // Historical orders without a plan remain PDF-only, even if they cost ₹499.
  const planId = order.notes.planId || 'pdf';
  const plan = getProductPlan(planId);
  if (!plan || (order.notes.planId && order.amount !== plan.amountInPaise)) {
    throw new PurchaseError('The purchase option does not match the paid amount.');
  }
  const buyerEmail = order.notes.userEmail.trim().toLowerCase();
  if (email && buyerEmail !== email.trim().toLowerCase()) {
    throw new PurchaseError('The access pass does not match this purchase.');
  }
  return {
    orderId, paymentId, email: buyerEmail, name: order.notes.userName || '',
    amountInPaise: payment.amount, planId, hasTelegramAccess: plan.hasTelegramAccess,
    uid: order.notes.userId || `buyer_${paymentId}`,
    licenseKey: `MENTICO-IN-${paymentId.slice(4)}-VIP`,
  };
}

export async function getVerifiedPurchase({ orderId, paymentId, email }, { client = getRazorpayClient() } = {}) {
  validatePurchaseIds(orderId, paymentId);
  const [order, payment] = await Promise.all([client.orders.fetch(orderId), client.payments.fetch(paymentId)]);
  return assertPaidPurchase({ orderId, paymentId, email, order, payment });
}
