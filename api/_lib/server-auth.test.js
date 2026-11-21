import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAuthUser } from './server-auth.js';
import { createAccessToken } from './access-token.js';

function response() { return { status(code) { this.code = code; return this; }, json(body) { this.body = body; } }; }
const purchase = { status: 'paid', paymentId: 'pay_1', userEmail: 'buyer@example.com', userId: 'guest_buyer' };
function admin(record, fail = false) {
  return () => ({ adminDb: { collection: () => ({ doc: () => ({ get: async () => {
    if (fail) throw new Error('database unavailable');
    return { exists: !!record, data: () => record };
  } }) }) } });
}
test('guest access requires matching paid order and fails closed on missing/revoked records or DB errors', async () => {
  process.env.RAZORPAY_KEY_SECRET = 'test-only-secret';
  const token = createAccessToken({ email: 'buyer@example.com', orderId: 'order_1', paymentId: 'pay_1' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  for (const record of [null, { ...purchase, status: 'created' }, { ...purchase, status: 'refunded' },
    { ...purchase, paymentId: 'pay_other' }, { ...purchase, userEmail: 'other@example.com' }]) {
    const res = response();
    assert.equal(await verifyAuthUser(req, res, { getAdmin: admin(record) }), null);
    assert.equal(res.code, 403);
  }
  const errorResponse = response();
  assert.equal(await verifyAuthUser(req, errorResponse, { getAdmin: admin(null, true) }), null);
  assert.equal(errorResponse.code, 503);
  assert.equal((await verifyAuthUser(req, response(), { getAdmin: admin(purchase) })).hasPurchased, true);
});
test('profile flags and unverified email do not grant PDF access', async () => {
  let emailLookups = 0;
  const getAdmin = () => ({
    adminAuth: { verifyIdToken: async () => ({ uid: 'unpaid', email: 'buyer@example.com', email_verified: false }) },
    adminDb: { collection: () => ({ where: (field) => {
      if (field === 'userEmail') emailLookups++;
      return { where: () => ({ limit: () => ({ get: async () => ({ empty: true }) }) }) };
    } }) },
  });
  const result = await verifyAuthUser({ headers: { authorization: 'Bearer firebase-test-token' } }, response(), { getAdmin });
  assert.equal(result.hasPurchased, false);
  assert.equal(emailLookups, 0);
});
test('guest signature verification has no built-in default secret', async () => {
  const { verifyAccessToken } = await import('./access-token.js');
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.ACCESS_TOKEN_SECRET;
  assert.equal(verifyAccessToken('mtc_e30.bad'), null);
});
test('client cannot lower the checkout price', async () => {
  const { default: createOrder } = await import('../razorpay/create-order.js');
  const res = response();
  await createOrder({ method: 'POST', headers: {}, body: {
    email: 'test@example.com', name: 'Test Buyer', displayedAmountInPaise: 1,
  } }, res);
  assert.equal(res.code, 409);
});
