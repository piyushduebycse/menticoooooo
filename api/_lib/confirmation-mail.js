export const CONFIRMATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Mentico</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f5f4;font-family:Arial,Helvetica,sans-serif;color:#111827;">

<div style="display:none;max-height:0;overflow:hidden;">
  Payment confirmed. Your course is just one click away.
</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f4;">
<tr>
<td align="center" style="padding:24px 12px;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">

  <!-- Brand Header -->
  <tr>
    <td align="center" style="background:#101713;padding:36px 24px;">
      <div style="font-size:38px;font-weight:800;letter-spacing:-2px;color:#ffffff;">
        mentico.
      </div>
      <p style="font-size:10px;letter-spacing:2px;color:#a3bbab;margin:10px 0 0;">
        YOUR JOURNEY TO BETTER LEARNING
      </p>
    </td>
  </tr>

  <!-- Welcome Section -->
  <tr>
    <td style="padding:32px 26px;">

      <div style="text-align:center;">
        <div style="display:inline-block;background:#e7f5eb;color:#237b45;border-radius:50%;width:58px;height:58px;line-height:58px;font-size:30px;">
          &#10003;
        </div>

        <p style="font-size:11px;font-weight:bold;letter-spacing:2px;color:#237b45;margin-top:18px;">
          PAYMENT SUCCESSFUL
        </p>

        <h1 style="font-size:30px;letter-spacing:-1px;margin:12px 0;color:#111827;">
          Welcome to Mentico!
        </h1>

        <p style="color:#64748b;font-size:15px;">
          Your next chapter starts here.
        </p>
      </div>

      <p style="font-size:16px;font-weight:bold;margin-top:30px;">
        Hey {{{STUDENT_NAME}}}, &#128075;
      </p>

      <p style="font-size:15px;line-height:1.8;color:#4b5563;">
        Congratulations on taking the next step in your
        learning journey! Your purchase of the
        <strong>Social Freedom Field Guide</strong> is confirmed,
        and your course is ready to explore.
      </p>

      <!-- Course Access -->
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f6f2;border:1px solid #dcebe1;border-radius:12px;margin-top:26px;">
        <tr>
          <td style="padding:24px;">

            <h2 style="margin:0;font-size:21px;color:#111827;">
              Social Freedom Field Guide
            </h2>

            <p style="color:#64748b;font-size:13px;margin:8px 0 24px;">
              Downloadable PDF &bull; Lifetime access
            </p>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" bgcolor="#17643b" style="border-radius:8px;">
                  <a href="https://www.mentico.co.in/library?openPdf=true&amp;token={{{ACCESS_TOKEN}}}"
                     style="display:block;padding:17px 20px;color:#ffffff;text-decoration:none;font-size:17px;font-weight:bold;border-radius:8px;">
                    Download Your PDF &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:12px;color:#64748b;text-align:center;line-height:1.6;margin-bottom:0;">
              No manual login required.<br>
              Works on mobile and desktop.
            </p>

          </td>
        </tr>
      </table>

      <!-- Purchase Details -->
      <h2 style="font-size:19px;margin-top:32px;">
        Your Purchase Details
      </h2>

      <table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;font-size:13px;">

        <tr>
          <td style="color:#64748b;border-bottom:1px solid #e5e7eb;">
            Product
          </td>
          <td align="right" style="font-weight:bold;border-bottom:1px solid #e5e7eb;">
            Social Freedom Field Guide
          </td>
        </tr>

        <tr>
          <td style="color:#64748b;border-bottom:1px solid #e5e7eb;">
            Payment Status
          </td>
          <td align="right" style="color:#237b45;font-weight:bold;border-bottom:1px solid #e5e7eb;">
            Successful
          </td>
        </tr>

        <tr>
          <td style="color:#64748b;border-bottom:1px solid #e5e7eb;">
            License Key
          </td>
          <td align="right" style="font-family:monospace;font-weight:bold;word-break:break-all;border-bottom:1px solid #e5e7eb;">
            {{{LICENSE_KEY}}}
          </td>
        </tr>

        <tr>
          <td style="color:#64748b;border-bottom:1px solid #e5e7eb;">
            Payment ID
          </td>
          <td align="right" style="font-family:monospace;word-break:break-all;border-bottom:1px solid #e5e7eb;">
            {{{PAYMENT_ID}}}
          </td>
        </tr>

        <tr>
          <td style="font-size:16px;font-weight:bold;">
            Total Paid
          </td>
          <td align="right" style="font-size:25px;font-weight:bold;color:#17643b;">
            &#8377;{{{AMOUNT_PAID}}}
          </td>
        </tr>

      </table>

      <p style="font-size:12px;color:#64748b;">
        Please retain this email as your purchase receipt.
      </p>

      <!-- Security Notice -->
      <div style="background:#fff8eb;border:1px solid #f3ddb0;border-radius:8px;padding:16px;margin-top:24px;">
        <p style="margin:0;font-size:12px;line-height:1.7;color:#854d0e;">
          <strong>Keep your access secure.</strong><br>
          Your access link and license key are personal
          to you. Please do not share them with others.
        </p>
      </div>

      <!-- Support Section -->
      <h3 style="font-size:17px;margin-top:30px;">
        Need a little help?
      </h3>

      <p style="font-size:14px;line-height:1.7;color:#64748b;">
        We're here to support your learning journey.
        If you have any questions or face issues accessing
        your course, simply reply to this email or contact us at
        <a href="mailto:margmanpath@gmail.com" style="color:#17643b;font-weight:bold;">
          margmanpath@gmail.com
        </a>.
      </p>

      <p style="font-size:15px;line-height:1.8;margin-top:26px;">
        Happy learning,<br>
        <strong>Team Mentico</strong>
      </p>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td align="center" style="background:#101713;padding:28px 20px;">

      <p style="font-size:18px;font-weight:bold;color:#ffffff;margin:0 0 12px;">
        Learn better. Grow further.
      </p>

      <a href="https://www.mentico.co.in" style="color:#a3bbab;font-size:13px;text-decoration:none;">
        www.mentico.co.in
      </a>

      <p style="font-size:11px;line-height:1.8;color:#a3bbab;border-top:1px solid #354039;padding-top:20px;margin-top:24px;">
        &copy; 2026 Mentico. All rights reserved.<br>
        You received this email because you successfully
        purchased the Social Freedom Field Guide.
      </p>

    </td>
  </tr>

</table>
</td>
</tr>
</table>

</body>
</html>`;

export function renderConfirmationEmail({ name, paymentId, licenseKey, accessToken, amountInPaise, telegramInviteUrl, hasTelegramAccess }) {
  const amountPaid = (amountInPaise / 100).toFixed(2);
  const safeName = (name || 'Student').trim();
  const safePaymentId = (paymentId || '').trim();
  const safeLicenseKey = (licenseKey || '').trim();
  const safeToken = encodeURIComponent((accessToken || '').trim());

  const telegramSection = hasTelegramAccess && telegramInviteUrl
    ? `<table role="presentation" width="100%" style="margin-top:24px;background:#faf3e9;border:1px solid #dfcbb8;border-radius:12px"><tr><td style="padding:24px"><h2 style="margin-top:0;color:#4e2313">Your Private Community &amp; Support is included</h2><p>Join the Mentico community for updates and guidance from the Mentico mentor, subject to availability.</p><p><a href="${telegramInviteUrl}" style="font-weight:bold;color:#4e2313">Join Mentico on Telegram →</a></p><p style="word-break:break-all">Copy and paste this link into Telegram: ${telegramInviteUrl}</p><p style="font-size:12px">Please keep this members-only link private.</p></td></tr></table>` : '';
  return CONFIRMATION_EMAIL_TEMPLATE.replace('<!-- Course Access -->', telegramSection + '<!-- Course Access -->')
    .replace('{{{AMOUNT_PAID}}}', amountPaid)
    .replace('{{{STUDENT_NAME}}}', safeName)
    .replace('{{{PAYMENT_ID}}}', safePaymentId)
    .replace('{{{LICENSE_KEY}}}', safeLicenseKey)
    .replace('{{{ACCESS_TOKEN}}}', safeToken);
}

export function isConfirmationMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendConfirmationEmail(
  { email, name, paymentId, licenseKey, accessToken, amountInPaise, telegramInviteUrl, hasTelegramAccess },
  { fetcher = fetch } = {}
) {
  if (!isConfirmationMailConfigured()) {
    throw new Error('Resend API key is not configured.');
  }

  const apiKey = process.env.RESEND_API_KEY.trim();
  const fromEmail = (
    process.env.CONFIRMATION_FROM_EMAIL?.trim() ||
    process.env.RECOVERY_FROM_EMAIL?.trim() ||
    'Mentico <orders@mentico.co.in>'
  );

  const html = renderConfirmationEmail({ name, paymentId, licenseKey, accessToken, amountInPaise, telegramInviteUrl, hasTelegramAccess });

  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `confirm-${paymentId}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: 'Welcome to Mentico! Your Course Access Is Confirmed',
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Resend email delivery failed (${response.status}): ${errorBody}`);
  }

  return await response.json().catch(() => ({ success: true }));
}
