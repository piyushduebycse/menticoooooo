import { S3Client } from '@aws-sdk/client-s3';

let r2ClientInstance = null;
let r2EuClientInstance = null;

/**
 * Cloudflare R2 Client Configuration
 * S3-compatible credentials stored in server-side environment variables.
 * Never exposed to frontend code.
 */
export function getR2Config({ forceEu = false } = {}) {
  let rawAccountId = process.env.R2_ACCOUNT_ID || '';
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
  const bucketName = (process.env.R2_BUCKET_NAME || 'mentico-pdf').trim();
  const region = (process.env.R2_REGION || 'auto').trim();
  let rawEndpoint = (process.env.R2_ENDPOINT || '').trim();

  // If accountId contains a URL (e.g. from copy-pasting the bucket URL), extract pure 32-char hex ID
  let accountId = rawAccountId.trim();
  let isEuBucket = forceEu;
  if (accountId.includes('cloudflarestorage.com')) {
    if (accountId.includes('.eu.')) isEuBucket = true;
    const match = accountId.match(/([a-f0-9]{32})/i);
    if (match) {
      accountId = match[1];
    }
  }

  // Sanitize endpoint if bucket name or trailing slash was appended
  let endpoint = rawEndpoint;
  if (endpoint) {
    endpoint = endpoint.replace(/\/+$/, '');
    endpoint = endpoint.replace(new RegExp(`/${bucketName}$`), '');
    if (endpoint.includes('.eu.')) isEuBucket = true;
  } else if (accountId) {
    endpoint = isEuBucket
      ? `https://${accountId}.eu.r2.cloudflarestorage.com`
      : `https://${accountId}.r2.cloudflarestorage.com`;
  }

  // The mentico-pdf bucket in account 8daa192dd6d5599045cddd3dddca4833 is located in Cloudflare EU jurisdiction
  if (bucketName === 'mentico-pdf' || accountId.includes('8daa192dd6d5599045cddd3dddca4833') || forceEu) {
    isEuBucket = true;
  }

  // Ensure EU jurisdiction endpoint contains .eu. to prevent 403 AccessDenied
  if (isEuBucket && endpoint && !endpoint.includes('.eu.')) {
    endpoint = endpoint.replace('.r2.cloudflarestorage.com', '.eu.r2.cloudflarestorage.com');
  }

  const isConfigured = Boolean(accessKeyId && secretAccessKey && endpoint);

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    region,
    endpoint,
    isEu: Boolean(endpoint && endpoint.includes('.eu.')),
    isConfigured,
  };
}

/**
 * Returns a cached S3Client configured for Cloudflare R2.
 */
export function getR2Client({ forceEu = false } = {}) {
  if (forceEu) {
    if (r2EuClientInstance) return r2EuClientInstance;
    const config = getR2Config({ forceEu: true });
    if (!config.isConfigured) return null;
    r2EuClientInstance = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    r2EuClientInstance.isEu = true;
    return r2EuClientInstance;
  }

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
  r2ClientInstance.isEu = config.isEu;

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
