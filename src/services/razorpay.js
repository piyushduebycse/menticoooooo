/**
 * Razorpay Checkout SDK Loader & Trigger Helper
 */

let scriptPromise = null;

export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay Checkout script.');
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

/**
 * Open Razorpay Checkout Modal
 *
 * @param {Object} params
 * @param {Object} params.order - The order object from /api/razorpay/create-order
 * @param {Object} params.user - Current logged-in user profile
 * @param {Function} params.onSuccess - Callback on payment success (receives response)
 * @param {Function} params.onFailure - Callback on payment failure / cancellation
 */
export async function openRazorpayCheckout({ order, user, onSuccess, onFailure }) {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay payment gateway could not be loaded. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Mentico',
      description: order.productName || 'Mentico - Social Freedom (PDF Manual)',
      image: '/mentico-badge-logo.png',
      order_id: order.orderId,
      prefill: {
        name: user?.displayName || user?.name || '',
        email: user?.email || '',
        contact: user?.phoneNumber || '',
      },
      notes: {
        manual: 'Social Freedom Blueprint',
      },
      theme: {
        color: '#E53E3E', // Mentico Red
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (onFailure) onFailure(new Error('Checkout closed before completion.'));
          resolve({ dismissed: true });
        },
      },
      handler: async (response) => {
        try {
          if (onSuccess) {
            await onSuccess(response);
          }
          resolve({ success: true, response });
        } catch (err) {
          if (onFailure) onFailure(err);
          reject(err);
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response) {
      const errorMsg = response.error?.description || 'Payment failed.';
      if (onFailure) onFailure(new Error(errorMsg));
      reject(new Error(errorMsg));
    });

    rzp.open();
  });
}
