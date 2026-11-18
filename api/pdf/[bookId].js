import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { verifyAuthUser } from '../_lib/server-auth.js';
import { getR2Client, getR2Config, resolveBook } from '../_lib/r2-client.js';

// In-memory cache for R2 object metadata (file size)
// Avoids redundant HeadObjectCommand round-trips to Cloudflare R2 on every byte-range chunk
const R2_METADATA_CACHE = new Map();
const R2_METADATA_TTL_MS = 60 * 60 * 1000; // 1 hour

export function clearMetadataCache() {
  R2_METADATA_CACHE.clear();
}

/**
 * Vercel Serverless Function: GET & HEAD /api/pdf/[bookId]
 * Streams protected PDFs from Cloudflare R2 using HTTP 206 Partial Content range requests.
 * 
 * Strict Enforcement:
 * 1. Firebase ID Token Verification (via Firebase Admin Auth)
 * 2. Purchase Verification (Firebase Realtime Database & Cloud Firestore)
 * 3. Server-Controlled Book Allowlist (prevents arbitrary storage key access)
 * 4. Byte-Range Streaming (Fast first-page display without full download)
 */
export async function handlePdfStream(req, res, { authVerifier = verifyAuthUser } = {}) {
  // 1. CORS & Preflight handling
  const origin = req.headers?.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 2. Validate HTTP method
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use GET or HEAD.' });
  }

  // 3. Authenticate user and verify purchase
  const authUser = await authVerifier(req, res);
  if (!authUser) {
    // authVerifier already sent 401 response
    return;
  }

  if (!authUser.hasPurchased) {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: A verified purchase is required to view this publication.',
      code: 'entitlement/purchase-required',
    });
  }

  // 4. Resolve Book via Server-side Allowlist
  const rawBookId = req.query?.bookId || req.url.split('?')[0].split('/').pop();
  const book = resolveBook(rawBookId);

  if (!book) {
    return res.status(404).json({
      success: false,
      error: `Publication '${rawBookId}' was not found.`,
      code: 'catalog/not-found',
    });
  }

  const rangeHeader = req.headers.range || req.headers.Range;

  // 5. Cloudflare R2 Delivery (Primary Production Pipeline)
  let activeClient = getR2Client();

  if (activeClient) {
    try {
      async function sendR2WithRetry(command) {
        try {
          return await activeClient.send(command);
        } catch (err) {
          if ((err.name === 'AccessDenied' || err['$metadata']?.httpStatusCode === 403) && !activeClient.isEu) {
            const euClient = getR2Client({ forceEu: true });
            if (euClient) {
              activeClient = euClient;
              return await euClient.send(command);
            }
          }
          throw err;
        }
      }

      function pipeBodyToResponse(body, targetRes) {
        if (!body) return targetRes.end();
        if (typeof body.pipe === 'function') {
          body.pipe(targetRes);
          targetRes.on('close', () => {
            if (typeof body.destroy === 'function') {
              try { body.destroy(); } catch {}
            }
          });
        } else if (typeof body.transformToByteArray === 'function') {
          body.transformToByteArray().then((bytes) => {
            targetRes.end(Buffer.from(bytes));
          }).catch(() => targetRes.end());
        } else {
          targetRes.end();
        }
      }

      const cacheKey = `${book.r2Bucket}/${book.r2Key}`;
      let totalSize;
      const cached = R2_METADATA_CACHE.get(cacheKey);

      if (cached && Date.now() < cached.expiresAt) {
        totalSize = cached.totalSize;
      } else {
        // Fetch object metadata from Cloudflare R2
        const headCmd = new HeadObjectCommand({
          Bucket: book.r2Bucket,
          Key: book.r2Key,
        });

        const headResult = await sendR2WithRetry(headCmd);
        totalSize = Number(headResult.ContentLength);
        if (totalSize && totalSize > 0) {
          R2_METADATA_CACHE.set(cacheKey, { totalSize, expiresAt: Date.now() + R2_METADATA_TTL_MS });
        }
      }

      // Handle HEAD request
      if (req.method === 'HEAD') {
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', totalSize);
        res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');
        res.setHeader('Content-Disposition', `inline; filename="${book.bookId}.pdf"`);
        return res.status(200).end();
      }

      // Handle Range Request (HTTP 206 Partial Content)
      if (rangeHeader) {
        const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
        if (!match) {
          res.setHeader('Content-Range', `bytes */${totalSize}`);
          return res.status(416).json({ success: false, error: 'Malformed Range header' });
        }

        let start = match[1] ? parseInt(match[1], 10) : 0;
        let end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

        if (isNaN(start) || start < 0 || start >= totalSize || end < start) {
          res.setHeader('Content-Range', `bytes */${totalSize}`);
          return res.status(416).json({ success: false, error: 'Requested range not satisfiable' });
        }

        end = Math.min(end, totalSize - 1);
        const chunkSize = end - start + 1;

        const getCmd = new GetObjectCommand({
          Bucket: book.r2Bucket,
          Key: book.r2Key,
          Range: `bytes=${start}-${end}`,
        });

        const r2Response = await sendR2WithRetry(getCmd);

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', chunkSize);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');
        res.setHeader('Content-Disposition', `inline; filename="${book.bookId}.pdf"`);

        // Stream range data directly to response
        pipeBodyToResponse(r2Response.Body, res);
        return;
      }

      // Handle Full Document Request (HTTP 200 OK)
      const getCmd = new GetObjectCommand({
        Bucket: book.r2Bucket,
        Key: book.r2Key,
      });

      const r2Response = await sendR2WithRetry(getCmd);

      res.status(200);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', totalSize);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');
      res.setHeader('Content-Disposition', `inline; filename="${book.bookId}.pdf"`);

      pipeBodyToResponse(r2Response.Body, res);
      return;
    } catch (r2Err) {
      console.error('[R2 Storage Error]:', r2Err);
      const fallbackUrl = 'https://pdfhost.io/v/W3mz6aNyZq_Mentico_Social_Freedom';
      res.setHeader('X-Mentico-Fallback-Url', fallbackUrl);
      if (req.headers?.accept?.includes('text/html')) {
        if (typeof res.redirect === 'function') {
          return res.redirect(307, fallbackUrl);
        }
        res.setHeader('Location', fallbackUrl);
        return res.status(307).end();
      }
      if (r2Err.name === 'NoSuchKey' || r2Err.$metadata?.httpStatusCode === 404) {
        return res.status(404).json({ success: false, error: 'PDF file was not found in R2 storage.', fallbackUrl });
      }
      return res.status(500).json({ success: false, error: 'Failed to stream document from Cloudflare R2.', fallbackUrl });
    }
  }

  // 6. Local Development Fallback (when R2 environment variables are not yet configured)
  const localCandidates = [
    path.resolve(process.cwd(), book.localFallback),
    path.resolve(process.cwd(), book.publicFallback),
  ];

  let resolvedLocalPath = null;
  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      resolvedLocalPath = candidate;
      break;
    }
  }

  if (!resolvedLocalPath) {
    const fallbackUrl = 'https://pdfhost.io/v/W3mz6aNyZq_Mentico_Social_Freedom';
    res.setHeader('X-Mentico-Fallback-Url', fallbackUrl);
    if (req.headers?.accept?.includes('text/html')) {
      if (typeof res.redirect === 'function') {
        return res.redirect(307, fallbackUrl);
      }
      res.setHeader('Location', fallbackUrl);
      return res.status(307).end();
    }
    return res.status(500).json({
      success: false,
      error: 'Cloudflare R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT) are not configured, and local PDF fallback was not found.',
      fallbackUrl,
    });
  }

  try {
    const stat = fs.statSync(resolvedLocalPath);
    const totalSize = stat.size;

    if (req.method === 'HEAD') {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', totalSize);
      res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');
      return res.status(200).end();
    }

    if (rangeHeader) {
      const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      if (!match) {
        res.setHeader('Content-Range', `bytes */${totalSize}`);
        return res.status(416).json({ success: false, error: 'Malformed Range header' });
      }

      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

      if (isNaN(start) || start < 0 || start >= totalSize || end < start) {
        res.setHeader('Content-Range', `bytes */${totalSize}`);
        return res.status(416).json({ success: false, error: 'Requested range not satisfiable' });
      }

      end = Math.min(end, totalSize - 1);
      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');

      const stream = fs.createReadStream(resolvedLocalPath, { start, end });
      stream.pipe(res);

      res.on('close', () => {
        stream.destroy();
      });

      return;
    }

    res.status(200);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', totalSize);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'private, no-transform, max-age=3600');

    const stream = fs.createReadStream(resolvedLocalPath);
    stream.pipe(res);

    res.on('close', () => {
      stream.destroy();
    });
  } catch (fsErr) {
    console.error('[Local PDF Stream Error]:', fsErr);
    return res.status(500).json({ success: false, error: 'Failed to stream local PDF file.' });
  }
}

export default async function handler(req, res) {
  return handlePdfStream(req, res);
}
