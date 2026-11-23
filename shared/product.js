// Set testing to false to charge the regular ₹299 sale price.
export const PRODUCT_TESTING_PRICE_ENABLED = true;
export const PRODUCT_ORIGINAL_PRICE_INR = 799;
export const PRODUCT_SALE_PRICE_INR = 299;
export const PRODUCT_PRICE_INR = PRODUCT_TESTING_PRICE_ENABLED ? 1 : PRODUCT_SALE_PRICE_INR;
export const PRODUCT_AMOUNT_IN_PAISE = PRODUCT_PRICE_INR * 100;
export const PRODUCT_CURRENCY = 'INR';
