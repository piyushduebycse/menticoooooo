export const PRODUCT_TESTING_PRICE_ENABLED = false;
export const PRODUCT_ORIGINAL_PRICE_INR = 799;
export const PRODUCT_SALE_PRICE_INR = 299;
export const PRODUCT_PRICE_INR = PRODUCT_TESTING_PRICE_ENABLED ? 1 : PRODUCT_SALE_PRICE_INR;
export const PRODUCT_AMOUNT_IN_PAISE = PRODUCT_PRICE_INR * 100;
export const PRODUCT_CURRENCY = 'INR';
export const PRODUCT_PLANS = Object.freeze({
  pdf: Object.freeze({ id: 'pdf', name: 'The Field Guide', originalPriceInr: PRODUCT_ORIGINAL_PRICE_INR, priceInr: PRODUCT_PRICE_INR, amountInPaise: PRODUCT_AMOUNT_IN_PAISE, hasTelegramAccess: false }),
  pdf_mentor: Object.freeze({ id: 'pdf_mentor', name: 'Field Guide + Community', originalPriceInr: 1499, priceInr: 499, amountInPaise: 49900, hasTelegramAccess: true }),
});
export function getProductPlan(id = 'pdf') {
  return typeof id === 'string' && Object.hasOwn(PRODUCT_PLANS, id) ? PRODUCT_PLANS[id] : null;
}
