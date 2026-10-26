import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fulfillCapturedPayment } from './payment-fulfillment.js';
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from './razorpay-admin.js';

function fakeDatabase() {
  const docs = new Map([['purchases/order_1', {
    userId: 'user_1', amountInPaise: 49900, currency: 'INR', status: 'created',
  }]]);
  const adminDb = {
    collection: (name) => ({ doc: (id) => {
      const key = `${name}/${id}`;
      return { key, get: async () => ({ exists: docs.has(key), data: () => docs.get(key) }) };
    } }),
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
  assert.equal((await fulfillCapturedPayment({ orderId: 'order_1', payment, userId: 'user_1' }, db)).alreadyFulfilled, true);
  await assert.rejects(fulfillCapturedPayment({ orderId: 'order_1', payment: { ...payment, id: 'pay_2' }, userId: 'user_1' }, db), /another payment/);
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
