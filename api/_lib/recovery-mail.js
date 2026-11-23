import crypto from 'node:crypto';
export function isRecoveryMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RECOVERY_FROM_EMAIL?.trim());
}
export async function sendRecoveryEmail({ email, token }, { fetcher = fetch } = {}) {
  if (!isRecoveryMailConfigured()) throw new Error('Recovery email is unavailable.');
  // A fixed origin prevents Host-header poisoning; fragment keeps tokens out of request URLs.
  const link = `https://www.mentico.co.in/restore#token=${encodeURIComponent(token)}`;
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`, 'Content-Type': 'application/json',
      'Idempotency-Key': `restore-${crypto.createHash('sha256').update(token).digest('hex')}` },
    body: JSON.stringify({ from: process.env.RECOVERY_FROM_EMAIL.trim(), to: [email],
      subject: 'Restore your Mentico reading access',
      text: `Your Social Freedom field guide is waiting.\n\nOpen this link to restore your purchase on this browser:\n${link}\n\nThis private link expires within 30 minutes. Do not forward it. If you did not request it, you can ignore this email.\n\nMentico` }),
  });
  if (!response.ok) throw new Error('Recovery email delivery failed.');
}
