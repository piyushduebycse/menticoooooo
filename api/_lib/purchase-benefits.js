// Server only: the public website never bundles the private invite link.
const TELEGRAM_INVITE_URL = 'https://t.me/+oSKdAgudx545YTU9';
export function purchaseBenefits(purchase) {
  const eligible = purchase?.planId === 'pdf_mentor' && purchase?.hasTelegramAccess === true;
  return { planId: purchase?.planId || 'pdf', hasTelegramAccess: eligible,
    ...(eligible ? { telegramInviteUrl: TELEGRAM_INVITE_URL } : {}) };
}
