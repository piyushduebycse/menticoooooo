import { verifyRecoveryToken } from '../_lib/recovery-token.js';
import { getVerifiedPurchase, PurchaseError } from '../_lib/payment-fulfillment.js';
import { createAccessToken } from '../_lib/access-token.js';
export async function handleRestore(req, res, { verifyPurchase = getVerifiedPurchase } = {}) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, error: 'Method not allowed.' }); }
  const pass = verifyRecoveryToken(req.body?.token);
  if (!pass) return res.status(400).json({ success: false, error: 'This recovery link is invalid or expired. Request a fresh link below.' });
  try {
    // Recheck refunds even if the payment was valid when the email was sent.
    const purchase = await verifyPurchase({ orderId: pass.orderId, paymentId: pass.paymentId, email: pass.email });
    return res.status(200).json({ success: true, ...purchase, accessToken: createAccessToken(purchase), hasPurchased: true, hasPurchasedPdf: true });
  } catch (err) {
    return res.status(err instanceof PurchaseError ? err.status : 503).json({ success: false,
      error: err instanceof PurchaseError ? 'This purchase is not currently eligible for access. Contact support if you need help.' : 'We could not confirm your purchase. Keep this link and retry shortly; please do not pay again.' });
  }
}
export default function handler(req, res) { return handleRestore(req, res); }
