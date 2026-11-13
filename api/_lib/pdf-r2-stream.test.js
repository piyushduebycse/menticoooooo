import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import handler, { handlePdfStream } from '../pdf/[bookId].js';
import { resolveBook } from './r2-client.js';

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
  assert.equal(resolveBook('social-freedom').r2Key, 'PDF/DOC-20261018-WA0013_compressed-compressed.pdf');
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

test('Case D: Invalid or expired Firebase ID token is rejected with 401', async () => {
  const req = {
    method: 'GET',
    headers: { authorization: 'Bearer expired_or_tampered_token' },
    url: '/api/pdf/social-freedom',
    query: { bookId: 'social-freedom' },
  };
  const res = createMockResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 401);
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

  const receivedData = Buffer.concat(res.chunks);
  assert.equal(receivedData.length, 65536);
  // Verify PDF magic bytes '%PDF-'
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
  const fullData = Buffer.concat(res.chunks);
  assert.ok(fullData.length > 10000000);
});
