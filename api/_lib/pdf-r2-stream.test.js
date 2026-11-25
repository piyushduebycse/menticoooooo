import test, { before, after } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import handler, { handlePdfStream as streamPdf } from '../pdf/[bookId].js';
import { resolveBook } from './r2-client.js';

let fixtureDirectory;
let fixturePath;
before(() => {
  fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'mentico-pdf-test-'));
  fixturePath = path.join(fixtureDirectory, 'synthetic.pdf');
  const fixture = Buffer.alloc(11 * 1024 * 1024, 32);
  fixture.write('%PDF-1.7\n');
  fs.writeFileSync(fixturePath, fixture);
});
after(() => fs.rmSync(fixtureDirectory, { recursive: true, force: true }));
function handlePdfStream(req, res, options = {}) {
  return streamPdf(req, res, { ...options, resolvePublication: (id) => {
    const book = resolveBook(id);
    return book ? { ...book, localFallback: fixturePath, privateFallback: fixturePath } : null;
  } });
}

function createMockResponse() {
  const res = new EventEmitter();
  res.statusCode = 200;
  res.headers = {};
  res.body = null;
  res.chunks = [];
  res.writableEnded = false;

  res.status = function (code) {
    res.statusCode = code;
    return res;
  };

  res.setHeader = function (name, value) {
    res.headers[name.toLowerCase()] = String(value);
    return res;
  };

  res.getHeader = function (name) {
    return res.headers[name.toLowerCase()];
  };

  res.json = function (data) {
    res.body = data;
    res.setHeader('content-type', 'application/json');
    res.writableEnded = true;
    res.emit('finish');
    return res;
  };

  res.write = function (chunk) {
    res.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return true;
  };

  res.end = function (chunk) {
    if (chunk) {
      res.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    res.writableEnded = true;
    res.emit('finish');
    return res;
  };

  return res;
}

test('Allowlist: resolves known book IDs and blocks unknown ones', () => {
  assert.notEqual(resolveBook('social-freedom'), null);
  assert.equal(resolveBook('social-freedom').r2Key, 'Mentico Super Course.pdf');
  assert.notEqual(resolveBook('blueprint'), null);
  assert.equal(resolveBook('unknown-book'), null);
  assert.equal(resolveBook(''), null);
});

test('Case A: Logged-out user (no Authorization header) receives 401', async () => {
  const req = {
    method: 'GET',
    headers: {},
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /Unauthorized/);
});

test('Case D: Invalid token or unavailable auth fails closed', async () => {
  const req = {
    method: 'GET',
    headers: { authorization: 'Bearer expired_or_tampered_token' },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  await handler(req, res);

  assert.ok([401, 503].includes(res.statusCode));
  assert.equal(res.body.success, false);
});

test('Case B: Logged-in user without an active purchase receives 403 Forbidden', async () => {
  const req = {
    method: 'GET',
    headers: { authorization: 'Bearer valid_token' },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  // Mock authenticated user WITHOUT purchase
  const mockAuthVerifier = async () => ({
    uid: 'unpaid_student_123',
    email: 'unpaid@example.com',
    hasPurchased: false,
  });

  await handlePdfStream(req, res, { authVerifier: mockAuthVerifier });

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'entitlement/purchase-required');
});

test('Case G: HTTP HEAD request returns 200 OK with correct Accept-Ranges and Content-Length', async () => {
  const req = {
    method: 'HEAD',
    headers: { authorization: 'Bearer valid_token' },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  const mockAuthVerifier = async () => ({
    uid: 'paid_student_123',
    email: 'paid@example.com',
    hasPurchased: true,
  });

  await handlePdfStream(req, res, { authVerifier: mockAuthVerifier });

  assert.equal(res.statusCode, 200);
  assert.equal(res.getHeader('accept-ranges'), 'bytes');
  assert.equal(res.getHeader('content-type'), 'application/pdf');
  assert.match(res.getHeader('cache-control'), /no-store/);
  assert.ok(Number(res.getHeader('content-length')) > 1000000);
});

test('Case E: Valid HTTP Range request returns 206 Partial Content with Content-Range', async () => {
  const req = {
    method: 'GET',
    headers: {
      authorization: 'Bearer valid_token',
      range: 'bytes=0-65535', // 64 KB chunk for initial page
    },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  const mockAuthVerifier = async () => ({
    uid: 'paid_student_123',
    email: 'paid@example.com',
    hasPurchased: true,
  });

  await new Promise((resolve) => {
    res.on('finish', resolve);
    handlePdfStream(req, res, { authVerifier: mockAuthVerifier });
  });

  assert.equal(res.statusCode, 206);
  assert.equal(res.getHeader('accept-ranges'), 'bytes');
  assert.match(res.getHeader('content-range'), /^bytes 0-65535\/\d+$/);
  assert.equal(res.getHeader('content-length'), '65536');
  assert.equal(res.getHeader('content-type'), 'application/pdf');
  assert.match(res.getHeader('cache-control'), /no-store/);

  const receivedData = Buffer.concat(res.chunks);
  assert.equal(receivedData.length, 65536);
  // Verify the file format signature '%PDF-'
  assert.equal(receivedData.subarray(0, 5).toString('ascii'), '%PDF-');
});

test('Case F: Invalid Range request (out of bounds) returns 416 Range Not Satisfiable', async () => {
  const req = {
    method: 'GET',
    headers: {
      authorization: 'Bearer valid_token',
      range: 'bytes=999999999-999999999', // out of bounds range
    },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  const mockAuthVerifier = async () => ({
    uid: 'paid_student_123',
    email: 'paid@example.com',
    hasPurchased: true,
  });

  await handlePdfStream(req, res, { authVerifier: mockAuthVerifier });

  assert.equal(res.statusCode, 416);
  assert.match(res.getHeader('content-range'), /^bytes \*\/\d+$/);
  assert.equal(res.body.success, false);
});

test('Case C: Logged-in user with valid purchase receives full document stream when no range is requested', async () => {
  const req = {
    method: 'GET',
    headers: {
      authorization: 'Bearer valid_token',
    },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  const mockAuthVerifier = async () => ({
    uid: 'paid_student_123',
    email: 'paid@example.com',
    hasPurchased: true,
  });

  await new Promise((resolve) => {
    res.on('finish', resolve);
    handlePdfStream(req, res, { authVerifier: mockAuthVerifier });
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.getHeader('accept-ranges'), 'bytes');
  assert.equal(res.getHeader('content-type'), 'application/pdf');
  assert.match(res.getHeader('cache-control'), /no-store/);
  const fullData = Buffer.concat(res.chunks);
  assert.ok(fullData.length > 10000000);
});

test('Case H: Server-authorized guest receives range stream', async () => {
  process.env.RAZORPAY_KEY_SECRET = 'test-only-secret';
  const { createAccessToken } = await import('./access-token.js');
  const guestToken = createAccessToken({
    email: 'guest.purchaser@example.com',
    name: 'Rahul Guest',
    orderId: 'order_guest',
    paymentId: 'pay_live_998877',
  });

  const req = {
    method: 'GET',
    headers: {
      authorization: `Bearer ${guestToken}`,
      range: 'bytes=0-65535',
    },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  await new Promise((resolve) => {
    res.on('finish', resolve);
    handlePdfStream(req, res, { authVerifier: async () => ({ hasPurchased: true }) });
  });

  assert.equal(res.statusCode, 206);
  assert.equal(res.getHeader('accept-ranges'), 'bytes');
  const headResponse = createMockResponse();
  await handlePdfStream({ ...req, method: 'HEAD', headers: { authorization: `Bearer ${guestToken}` } }, headResponse, { authVerifier: async () => ({ hasPurchased: true }) });
  assert.equal(headResponse.statusCode, 200);
  assert.equal(res.getHeader('content-range'), `bytes 0-65535/${headResponse.getHeader('content-length')}`);
  assert.equal(res.getHeader('content-length'), '65536');
  const data = Buffer.concat(res.chunks);
  assert.equal(data.length, 65536);
});

test('paid download requests use attachment headers and keep HTTP range delivery', async () => {
  const req = { method: 'HEAD', url: '/api/pdf/social-freedom?download=1', query: { bookId: 'social-freedom', download: '1' }, headers: {} };
  const res = createMockResponse();
  await handlePdfStream(req, res, { authVerifier: async () => ({ hasPurchased: true }) });
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-disposition'], 'attachment; filename="Mentico-Social-Freedom.pdf"');
  assert.equal(res.headers['accept-ranges'], 'bytes');
});
