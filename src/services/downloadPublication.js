const DOWNLOAD_URL = '/api/pdf/social-freedom?download=1';
async function downloadError(response) {
  const data = await response.json().catch(() => ({}));
  return new Error(data.error || (response.status === 401 || response.status === 403
    ? 'Please reopen the purchase link in your confirmation email, or contact support with your payment ID.'
    : 'Your download is temporarily unavailable. Please retry; you do not need to pay again.'));
}
export async function downloadPublication({ accessToken, onProgress = () => {}, signal, fetcher = fetch }) {
  if (!accessToken) throw new Error('Open the purchase link in your confirmation email to download your field guide.');
  const headers = { Authorization: `Bearer ${accessToken}` };
  const metadata = await fetcher(DOWNLOAD_URL, { method: 'HEAD', headers, signal });
  if (!metadata.ok) throw await downloadError(metadata);
  const size = Number(metadata.headers.get('Content-Length'));
  if (!Number.isSafeInteger(size) || size < 1 || size > 100 * 1024 * 1024) throw new Error('We could not prepare the Course. Please retry or contact support.');
  // Small range requests avoid serverless response-size limits for the complete book.
  const chunks = [], chunkSize = 1024 * 1024;
  onProgress(0);
  for (let start = 0; start < size; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, size - 1);
    const response = await fetcher(DOWNLOAD_URL, { headers: { ...headers, Range: `bytes=${start}-${end}` }, signal });
    if (!response.ok) throw await downloadError(response);
    if (response.status !== 206 || response.headers.get('Content-Range') !== `bytes ${start}-${end}/${size}`) throw new Error('The Course download was interrupted. Please retry.');
    const chunk = await response.arrayBuffer();
    if (chunk.byteLength !== end - start + 1) throw new Error('The Course download was incomplete. Please retry.');
    chunks.push(chunk);
    onProgress(Math.round((end + 1) / size * 100));
  }
  return new Blob(chunks, { type: 'application/pdf' });
}
