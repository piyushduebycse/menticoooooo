export const PENDING_PAYMENT_KEY = 'mentico_pending_payment';
export function readPendingPayment() {
  try {
    const value = JSON.parse(localStorage.getItem(PENDING_PAYMENT_KEY) || 'null');
    return value && ['orderId', 'paymentId', 'signature'].every(key => typeof value[key] === 'string') ? value : null;
  } catch { return null; }
}
export async function confirmPayment(receipt) {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(receipt),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment confirmation is unavailable. Retry confirmation; do not pay again.');
  }
  return data;
}
