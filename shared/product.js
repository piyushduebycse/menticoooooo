// One authoritative price for browser displays and Razorpay order creation.
// Stored in source so stale hosting/build environment variables cannot disagree.
export const PRODUCT_PRICE_INR = 1;
export const PRODUCT_AMOUNT_IN_PAISE = PRODUCT_PRICE_INR * 100;
export const PRODUCT_CURRENCY = 'INR';
