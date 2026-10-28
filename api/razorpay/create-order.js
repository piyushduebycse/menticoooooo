import { verifyAuthUser } from '../_lib/server-auth.js';
import { getRazorpayClient } from '../_lib/razorpay-admin.js';
import { requirePaymentDatabase } from '../_lib/payment-fulfillment.js';

/**
 * POST /api/razorpay/create-order
 * Generates an authorized Razorpay order for Mentico Manual in INR.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Authenticate user via Firebase ID Token
  const authUser = await verifyAuthUser(req, res);
  if (!authUser) return;

  // 2. Check if user already owns the manual
  if (authUser.hasPurchased) {
    return res.status(200).json({
      success: true,
      alreadyPurchased: true,
      message: 'User has already purchased Mentico - Social Freedom manual.',
    });
  }

  // 3. Price resolution: Default ₹499 INR = 49900 paise
  const priceINR = Number(process.env.PRODUCT_PRICE_INR || 499);
  const amountInPaise = Math.round(priceINR * 100);
  if (!Number.isFinite(priceINR) || amountInPaise < 100 || !Number.isSafeInteger(amountInPaise)) {
    return res.status(500).json({ success: false, error: 'Product price is misconfigured.' });
  }
  if (req.body?.displayedAmountInPaise !== amountInPaise) {
    return res.status(409).json({ success: false, error: 'Checkout price changed. Please refresh the page before paying.' });
  }

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret || keyId.includes('YOUR_KEY_ID')) {
    return res.status(500).json({
      success: false,
      error: 'Razorpay keys not configured on server. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.',
      code: 'razorpay/not-configured',
    });
  }

  try {
    const { adminDb, FieldValue } = requirePaymentDatabase();
    const razorpay = getRazorpayClient();
    const receiptId = `rcpt_${authUser.uid.slice(0, 10)}_${Date.now()}`;

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: authUser.uid,
        userEmail: authUser.email || '',
        productName: 'Mentico - Social Freedom (PDF Field Manual)',
      },
    });

    // Save order in Firestore under 'purchases' collection with status 'created'
    await adminDb.collection('purchases').doc(order.id).set({
      orderId: order.id,
      receipt: receiptId,
      userId: authUser.uid,
      userEmail: authUser.email || '',
      amount: priceINR,
      amountInPaise,
      currency: 'INR',
      status: 'created',
      productName: 'Mentico - Social Freedom (PDF Field Manual)',
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      productName: 'Mentico - Social Freedom (PDF Manual)',
      user: {
        name: authUser.name || '',
        email: authUser.email || '',
      },
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Could not create payment order. Please try again or contact support.',
    });
  }
}
