import { track } from '@vercel/analytics';

/**
 * Safely track custom business events in Vercel Web Analytics
 * Works seamlessly in production without breaking in local dev / test environments.
 */
export function trackEvent(name, properties = {}) {
  try {
    track(name, properties);
  } catch (err) {
    console.warn('[Analytics] Track event notice:', err.message);
  }
}

/**
 * Track when a user initiates checkout
 */
export function trackCheckoutInitiated({ price, userId, userEmail }) {
  trackEvent('checkout_initiated', {
    price,
    currency: 'INR',
    userId: userId || 'anonymous',
    hasEmail: Boolean(userEmail),
  });
}

/**
 * Track successful payment completion
 */
export function trackPurchaseSuccess({ orderId, amount, paymentId }) {
  trackEvent('purchase_success', {
    orderId,
    amount,
    currency: 'INR',
    paymentId: paymentId || 'n/a',
  });
}

/**
 * Track when student accesses or views the manual
 */
export function trackManualAccess({ page = 1 } = {}) {
  trackEvent('manual_viewed', { page });
}
