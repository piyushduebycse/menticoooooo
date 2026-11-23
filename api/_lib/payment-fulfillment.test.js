import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { assertPaidPurchase, getVerifiedPurchase } from './payment-fulfillment.js';
import { handleCreateOrder } from '../razorpay/create-order.js';
import { handleVerifyPayment } from '../razorpay/verify-payment.js';
import { verifyAccessToken } from './access-token.js';
import * as price from '../../shared/product.js';
const order = { id:'order_test1', amount:100, currency:'INR', status:'paid', amount_paid:100, amount_due:0, partial_payment:false, notes:{ productId:'social-freedom', userEmail:'buyer@example.com', userName:'Buyer' } };
const payment = { id:'pay_test1', order_id:order.id, amount:100, currency:'INR', status:'captured', captured:true, amount_refunded:0, refund_status:null };
const args = { orderId:order.id, paymentId:payment.id, order, payment };
const response = () => ({ setHeader(){}, status(code){ this.code=code; return this; }, json(body){this.body=body;return this;} });
const client = (o=order,p=payment) => ({ orders:{fetch:async()=>o},payments:{fetch:async()=>p} });
test('catalog keeps regular prices and charges the configured mode price',()=>{
 assert.equal(price.PRODUCT_ORIGINAL_PRICE_INR,799); assert.equal(price.PRODUCT_SALE_PRICE_INR,249); const expectedPrice = price.PRODUCT_TESTING_PRICE_ENABLED ? 1 : 249; assert.equal(price.PRODUCT_PRICE_INR,expectedPrice); assert.equal(price.PRODUCT_AMOUNT_IN_PAISE,expectedPrice * 100);
});
test('only matching captured, fully paid, unrefunded purchases grant access',()=>{
 assert.equal(assertPaidPurchase(args).email,'buyer@example.com');
 for(const patch of [{id:'pay_other'},{order_id:'order_other'},{amount:1},{currency:'USD'},{amount_refunded:1},{refund_status:'pending'},{refund_status:undefined},{status:'authorized'},{captured:false}]) assert.throws(()=>assertPaidPurchase({...args,payment:{...payment,...patch}}));
 for(const patch of [{id:'order_other'},{notes:{productId:'other'}},{status:'created'},{amount_paid:0},{amount_due:100},{partial_payment:true}]) assert.throws(()=>assertPaidPurchase({...args,order:{...order,...patch}}));
 assert.throws(()=>assertPaidPurchase({...args,email:'other@example.com'}));
 const legacy={...order,amount:49900,amount_paid:49900,notes:{productName:'Mentico - Social Freedom (PDF Field Manual)',userEmail:'buyer@example.com'}};
 assert.equal(assertPaidPurchase({...args,order:legacy,payment:{...payment,amount:49900}}).paymentId,payment.id);
});
test('each access reads authoritative provider state and fails closed on outage',async()=>{
 let reads=0; const c=client(); c.orders.fetch=async()=>{reads++;return order;};
 await getVerifiedPurchase(args,{client:c}); await getVerifiedPurchase(args,{client:c}); assert.equal(reads,2);
 await assert.rejects(getVerifiedPurchase(args,{client:{orders:{fetch:async()=>{throw Error('offline');}},payments:c.payments}}));
});
test('create order requires buyer identity and enforces server amount without Firebase',async()=>{
 let created; const c={key_id:'rzp_test_dummy',orders:{create:async data=>{created=data;return {id:order.id,...data};}}};
 const body={name:'Buyer',email:'BUYER@example.com',displayedAmountInPaise:price.PRODUCT_AMOUNT_IN_PAISE}; let res=response();
 await handleCreateOrder({method:'POST',body},res,{getClient:()=>c}); assert.equal(res.code,200); assert.equal(created.amount,price.PRODUCT_AMOUNT_IN_PAISE); assert.equal(created.partial_payment,false); assert.equal(created.notes.userEmail,'buyer@example.com');
 for(const [patch,code] of [[{displayedAmountInPaise:1},409],[{email:'bad'},400],[{name:''},400]]){res=response();await handleCreateOrder({method:'POST',body:{...body,...patch}},res,{getClient:()=>{throw Error('must not call');}});assert.equal(res.code,code);}
});
test('checkout validates HMAC and provider state; ignores client purchase claims',async()=>{
 process.env.RAZORPAY_KEY_SECRET='test-only-secret';
 const body={orderId:order.id,paymentId:payment.id,email:'attacker@example.com',hasPurchased:true,signature:crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${order.id}|${payment.id}`).digest('hex')};
 let res=response(); await handleVerifyPayment({method:'POST',body},res,{getClient:()=>client()}); assert.equal(res.code,200); assert.equal(verifyAccessToken(res.body.accessToken).email,'buyer@example.com');
 res=response();await handleVerifyPayment({method:'POST',body:{...body,signature:'bad'}},res,{getClient:()=>{throw Error('must not call');}});assert.equal(res.code,400);
 for(const patch of [{amount:1},{amount_refunded:100,refund_status:'full'},{status:'failed'}]){res=response();await handleVerifyPayment({method:'POST',body},res,{getClient:()=>client(order,{...payment,...patch})});assert.ok([403,409].includes(res.code));assert.equal(res.body.accessToken,undefined);}
 let captured=false; const c=client(); c.payments.fetch=async()=>captured?payment:{...payment,status:'authorized'}; c.payments.capture=async(id,amount,currency)=>{assert.equal(id,payment.id);assert.equal(amount,100);assert.equal(currency,'INR');captured=true;};
 res=response();await handleVerifyPayment({method:'POST',body},res,{getClient:()=>c});assert.equal(res.code,200);assert.equal(captured,true);
 res=response();await handleVerifyPayment({method:'POST',body},res,{getClient:()=>{throw Error('provider unavailable');}});assert.equal(res.code,503);assert.equal(res.body.accessToken,undefined);
});
