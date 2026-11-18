import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fulfillCapturedPayment, recordPaymentFailure, revokePaymentRefund } from './payment-fulfillment.js';
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from './razorpay-admin.js';
import { createAccessToken, verifyAccessToken } from './access-token.js';
import { PAYMENT_STATES } from './server-auth.js';

function fakeDatabase() {
  const docs = new Map([['purchases/order_1', {
    userId: 'user_1', amountInPaise: 49900, currency: 'INR', status: 'created',
  }]]);
  const adminDb = {
    collection: (name) => ({
      doc: (id) => {
        const key = `${name}/${id}`;
        return {
          key,
          get: async () => ({ exists: docs.has(key), data: () => docs.get(key) }),
          set: async (data, opts = {}) => {
            const prev = docs.get(key) || {};
            docs.set(key, opts.merge ? { ...prev, ...data } : data);
          },
        };
      },
      where: (field, op, val) => ({
        where: () => ({
          limit: () => ({
            get: async () => {
              const matched = [];
              for (const [k, v] of docs.entries()) {
                if (k.startsWith(`${name}/`) && v[field] === val) {
                  matched.push({ ref: adminDb.collection(name).doc(k.split('/')[1]), data: () => v });
                }
              }
              return { empty: matched.length === 0, docs: matched };
            },
          }),
        }),
        limit: () => ({
          get: async () => {
            const matched = [];
            for (const [k, v] of docs.entries()) {
              if (k.startsWith(`${name}/`) && v[field] === val) {
                matched.push({ ref: adminDb.collection(name).doc(k.split('/')[1]), data: () => v });
              }
            }
            return { empty: matched.length === 0, docs: matched };
          },
        }),
      }),
    }),
    batch: () => {
      const writes = [];
      return {
        set: (ref, data) => writes.push([ref.key, data]),
        commit: async () => {
          for (const [key, data] of writes) docs.set(key, { ...docs.get(key), ...data });
        },
      };
    },
  };
  return { docs, adminDb, FieldValue: { serverTimestamp: () => 'now' } };
}

test('fulfillment requires ownership, captured status, order and exact amount', async () => {
  const db = fakeDatabase();
  const payment = { id: 'pay_1', order_id: 'order_1', status: 'captured', amount: 49900, currency: 'INR' };
  await assert.rejects(fulfillCapturedPayment({ orderId: 'order_1', payment, userId: 'user_2' }, db), /another user/);
  for (const changes of [{ status: 'authorized' }, { amount: 100 }, { order_id: 'order_2' }]) {
    await assert.rejects(fulfillCapturedPayment({ orderId: 'order_1', payment: { ...payment, ...changes }, userId: 'user_1' }, db), /does not match/);
  }
  assert.equal(db.docs.has('users/user_1'), false);
  const result = await fulfillCapturedPayment({ orderId: 'order_1', payment, userId: 'user_1' }, db);
  assert.equal(result.alreadyFulfilled, false);
  assert.equal(db.docs.get('users/user_1').hasPurchased, true);
  assert.equal(db.docs.get('purchases/order_1').status, 'paid');
  assert.equal((await fulfillCapturedPayment({ orderId: 'order_1', payment, userId: 'user_1' }, db)).alreadyFulfilled, true);
  await assert.rejects(fulfillCapturedPayment({ orderId: 'order_1', payment: { ...payment, id: 'pay_2' }, userId: 'user_1' }, db), /another payment/);
});

test('failure recording marks purchase status as failed without granting user entitlement', async () => {
  const db = fakeDatabase();
  await recordPaymentFailure({ orderId: 'order_1', paymentId: 'pay_fail_1', reason: 'User cancelled or gateway failed' }, db);
  assert.equal(db.docs.get('purchases/order_1').status, 'failed');
  assert.equal(db.docs.has('users/user_1'), false);
});

test('refund processing revokes user access and marks order refunded', async () => {
  const db = fakeDatabase();
  const payment = { id: 'pay_1', order_id: 'order_1', status: 'captured', amount: 49900, currency: 'INR' };
  await fulfillCapturedPayment({ orderId: 'order_1', payment, userId: 'user_1' }, db);
  assert.equal(db.docs.get('users/user_1').hasPurchased, true);

  await revokePaymentRefund({ orderId: 'order_1', paymentId: 'pay_1', refundId: 'rfnd_1' }, db);
  assert.equal(db.docs.get('purchases/order_1').status, 'refunded');
  assert.equal(db.docs.get('users/user_1').hasPurchased, false);
  assert.equal(db.docs.get('users/user_1').status, 'refunded');
});

test('checkout and webhook signatures reject malformed values', () => {
  process.env.RAZORPAY_KEY_SECRET = 'test-secret';
  const signature = crypto.createHmac('sha256', 'test-secret').update('order_1|pay_1').digest('hex');
  assert.equal(verifyRazorpayPaymentSignature({ orderId: 'order_1', paymentId: 'pay_1', signature }), true);
  assert.equal(verifyRazorpayPaymentSignature({ orderId: 'order_1', paymentId: 'pay_1', signature: 'bad' }), false);
  const raw = Buffer.from('{"event":"payment.captured"}');
  const webhookSignature = crypto.createHmac('sha256', 'webhook-secret').update(raw).digest('hex');
  assert.equal(verifyRazorpayWebhookSignature(raw, webhookSignature, 'webhook-secret'), true);
  assert.equal(verifyRazorpayWebhookSignature(raw, 'bad', 'webhook-secret'), false);
});

test('tamper-proof Mentico Access Token validates signature and rejects forged tokens', () => {
  process.env.RAZORPAY_KEY_SECRET = 'test-secret';
  const token = createAccessToken({ email: 'student@example.com', name: 'Student', orderId: 'ord_1', paymentId: 'pay_1' });
  assert.ok(token.startsWith('mtc_'));
  const valid = verifyAccessToken(token);
  assert.equal(valid.email, 'student@example.com');
  assert.equal(valid.orderId, 'ord_1');

  // Forged token check
  assert.equal(verifyAccessToken('mtc_fake.bad_signature'), null);
  assert.equal(verifyAccessToken('plain_token'), null);
  assert.equal(verifyAccessToken(null), null);
});

test('strict payment states are clearly defined', () => {
  assert.equal(PAYMENT_STATES.CREATED, 'created');
  assert.equal(PAYMENT_STATES.PENDING, 'pending');
  assert.equal(PAYMENT_STATES.PAID, 'paid');
  assert.equal(PAYMENT_STATES.FAILED, 'failed');
  assert.equal(PAYMENT_STATES.CANCELLED, 'cancelled');
  assert.equal(PAYMENT_STATES.REFUNDED, 'refunded');
});
