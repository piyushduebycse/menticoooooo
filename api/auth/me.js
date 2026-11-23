import { verifyAuthUser } from '../_lib/server-auth.js';

/**
 * GET /api/auth/me
 * Protected endpoint to verify a signed purchase pass against Razorpay.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  const authUser = await verifyAuthUser(req, res);
  if (!authUser) {
    // verifyAuthUser already sent 401 response
    return;
  }

  return res.status(200).json({
    success: true,
    user: {
      uid: authUser.uid,
      email: authUser.email,
      name: authUser.name,
      emailVerified: authUser.emailVerified,
      hasPurchased: authUser.hasPurchased,
    },
    serverVerified: true,
    timestamp: new Date().toISOString(),
  });
}
