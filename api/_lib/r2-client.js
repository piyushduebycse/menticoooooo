import { S3Client } from '@aws-sdk/client-s3';

let r2ClientInstance = null;

/**
 * Cloudflare R2 Client Configuration
 * S3-compatible credentials stored in server-side environment variables.
 * Never exposed to frontend code.
 */
export function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
  const bucketName = process.env.R2_BUCKET_NAME || 'mentico-pdf';
  const region = process.env.R2_REGION || 'auto';
  
  // Endpoint can be set directly or constructed from Cloudflare Account ID
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  const isConfigured = Boolean(accessKeyId && secretAccessKey && endpoint);

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    region,
    endpoint,
    isConfigured,
  };
}

/**
 * Returns a cached S3Client configured for Cloudflare R2.
 */
export function getR2Client() {
  if (r2ClientInstance) return r2ClientInstance;

  const config = getR2Config();
  if (!config.isConfigured) {
    return null;
  }

  r2ClientInstance = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return r2ClientInstance;
}

/**
 * Server-controlled allowlist for publications.
 * Strictly prevents arbitrary storage keys from being passed by clients.
 */
export const BOOK_ALLOWLIST = {
  'social-freedom': {
    bookId: 'social-freedom',
    title: 'Mentico Social Freedom',
    r2Bucket: process.env.R2_BUCKET_NAME || 'mentico-pdf',
    r2Key: 'PDF/DOC-20261018-WA0013_compressed-compressed.pdf',
    localFallback: 'DOC-20261018-WA0013_compressed-compressed.pdf',
    publicFallback: 'public/Mentico_Mastery_Blueprint.pdf',
  },
  'blueprint': {
    bookId: 'blueprint',
    title: 'Mentico Mastery Blueprint',
    r2Bucket: process.env.R2_BUCKET_NAME || 'mentico-pdf',
    r2Key: 'PDF/DOC-20261018-WA0013_compressed-compressed.pdf',
    localFallback: 'DOC-20261018-WA0013_compressed-compressed.pdf',
    publicFallback: 'public/Mentico_Mastery_Blueprint.pdf',
  },
  'mentico-mastery-blueprint': {
    bookId: 'mentico-mastery-blueprint',
    title: 'Mentico Mastery Blueprint',
    r2Bucket: process.env.R2_BUCKET_NAME || 'mentico-pdf',
    r2Key: 'PDF/DOC-20261018-WA0013_compressed-compressed.pdf',
    localFallback: 'DOC-20261018-WA0013_compressed-compressed.pdf',
    publicFallback: 'public/Mentico_Mastery_Blueprint.pdf',
  },
};

/**
 * Resolves a book ID against the server-controlled allowlist.
 */
export function resolveBook(bookId) {
  if (!bookId || typeof bookId !== 'string') return null;
  const cleanId = bookId.trim().toLowerCase();
  return BOOK_ALLOWLIST[cleanId] || null;
}
