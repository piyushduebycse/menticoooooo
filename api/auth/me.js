import { verifyAuthUser } from '../_lib/server-auth.js';

/**
 * GET /api/auth/me
 * Protected endpoint to verify client Firebase ID token server-side.
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

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
