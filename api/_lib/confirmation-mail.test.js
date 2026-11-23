import test from 'node:test';
import assert from 'node:assert/strict';
import {
  renderConfirmationEmail,
  isConfirmationMailConfigured,
  sendConfirmationEmail,
} from './confirmation-mail.js';
import { handleVerifyPayment } from '../razorpay/verify-payment.js';

test('renderConfirmationEmail: substitutes all variables correctly', () => {
  const html = renderConfirmationEmail({
    name: 'Aarav Patel',
    paymentId: 'pay_test_12345',
    licenseKey: 'MENTICO-IN-TEST-VIP',
    accessToken: 'mtc_test_token_abc',
  });

  assert.ok(html.includes('Hey Aarav Patel,'));
  assert.ok(html.includes('pay_test_12345'));
  assert.ok(html.includes('MENTICO-IN-TEST-VIP'));
  assert.ok(html.includes('openPdf=true&amp;token=mtc_test_token_abc'));
  assert.ok(!html.includes('{{{STUDENT_NAME}}}'));
  assert.ok(!html.includes('{{{PAYMENT_ID}}}'));
  assert.ok(!html.includes('{{{LICENSE_KEY}}}'));
  assert.ok(!html.includes('{{{ACCESS_TOKEN}}}'));
});

test('sendConfirmationEmail: uses Resend API with Idempotency-Key and correct payload', async () => {
  process.env.RESEND_API_KEY = 're_mock_test_key_123';
  process.env.CONFIRMATION_FROM_EMAIL = 'Mentico <orders@mentico.co.in>';

  let calledUrl = null;
  let calledOptions = null;

  const mockFetcher = async (url, options) => {
    calledUrl = url;
    calledOptions = options;
    return {
      ok: true,
      json: async () => ({ id: 'email_mock_resend_id' }),
    };
  };

  const res = await sendConfirmationEmail(
    {
      email: 'student@example.com',
      name: 'Rohan Sharma',
      paymentId: 'pay_test_999',
      licenseKey: 'MENTICO-IN-999-VIP',
      accessToken: 'mtc_signed_access_token_xyz',
    },
    { fetcher: mockFetcher }
  );

  assert.equal(calledUrl, 'https://api.resend.com/emails');
  assert.equal(calledOptions.method, 'POST');
  assert.equal(calledOptions.headers['Authorization'], 'Bearer re_mock_test_key_123');
  assert.equal(calledOptions.headers['Idempotency-Key'], 'confirm-pay_test_999');

  const body = JSON.parse(calledOptions.body);
  assert.equal(body.to[0], 'student@example.com');
  assert.equal(body.from, 'Mentico <orders@mentico.co.in>');
  assert.ok(body.html.includes('Hey Rohan Sharma,'));
  assert.equal(res.id, 'email_mock_resend_id');
});

test('handleVerifyPayment: dispatches confirmation email upon verified payment', async () => {
  process.env.RESEND_API_KEY = 're_mock_test_key_123';
  process.env.RAZORPAY_KEY_SECRET = 'test_secret_123';

  // Crypto signature for mock order & payment
  const crypto = await import('node:crypto');
  const orderId = 'order_test12345';
  const paymentId = 'pay_test12345';
  const signature = crypto
    .createHmac('sha256', 'test_secret_123')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const mockOrder = {
    id: orderId,
    amount: 49900,
    amount_paid: 49900,
    amount_due: 0,
    currency: 'INR',
    status: 'paid',
    notes: {
      productId: 'social-freedom',
      userEmail: 'buyer@example.com',
      userName: 'Karan Mehra',
    },
  };

  const mockPayment = {
    id: paymentId,
    order_id: orderId,
    amount: 49900,
    currency: 'INR',
    status: 'captured',
    captured: true,
    amount_refunded: 0,
    refund_status: null,
  };

  const mockClient = {
    orders: { fetch: async () => mockOrder },
    payments: { fetch: async () => mockPayment, capture: async () => mockPayment },
  };

  let sentMailArgs = null;
  const mockMailSender = async (args) => {
    sentMailArgs = args;
    return { success: true };
  };

  const req = {
    method: 'POST',
    body: { orderId, paymentId, signature },
    headers: {},
  };

  let responseStatus = null;
  let responseJson = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      responseStatus = code;
      return res;
    },
    json: (data) => {
      responseJson = data;
      return res;
    },
  };

  await handleVerifyPayment(req, res, {
    getClient: () => mockClient,
    mailSender: mockMailSender,
  });

  assert.equal(responseStatus, 200);
  assert.equal(responseJson.success, true);
  assert.equal(responseJson.emailSent, true);
  assert.equal(sentMailArgs.email, 'buyer@example.com');
  assert.equal(sentMailArgs.name, 'Karan Mehra');
  assert.equal(sentMailArgs.paymentId, 'pay_test12345');
});
