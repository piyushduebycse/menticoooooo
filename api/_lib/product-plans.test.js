import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PRODUCT_PLANS, getProductPlan } from '../../shared/product.js';
import { assertPaidPurchase } from './payment-fulfillment.js';
import { purchaseBenefits } from './purchase-benefits.js';
import { handleCreateOrder } from '../razorpay/create-order.js';
import { handleVerifyPayment } from '../razorpay/verify-payment.js';
import { handleRestore } from '../purchase/restore.js';
import { createRecoveryToken } from './recovery-token.js';
import { renderConfirmationEmail } from './confirmation-mail.js';
const res=()=>({setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
const order=(planId,amount=planId==='pdf_mentor'?49900:29900)=>({id:'order_plan1',amount,amount_paid:amount,amount_due:0,status:'paid',currency:'INR',notes:{productId:'social-freedom',userEmail:'buyer@example.com',userName:'Buyer',...(planId?{planId}:{})}});
const payment=o=>({id:'pay_plan1',order_id:o.id,amount:o.amount,currency:'INR',status:'captured',captured:true,amount_refunded:0,refund_status:null});
const paid=o=>assertPaidPurchase({orderId:o.id,paymentId:'pay_plan1',order:o,payment:payment(o)});
test('catalog has ₹299 Course and ₹499 mentor plan; unknown/prototype plans are rejected',()=>{
 assert.equal(PRODUCT_PLANS.pdf.amountInPaise,29900);assert.equal(PRODUCT_PLANS.pdf_mentor.amountInPaise,49900);
 for(const id of ['__proto__','constructor','bad',null,{},1])assert.equal(getProductPlan(id),null);
});
test('server creates correct plan amount and notes, never trusting client price',async()=>{
 for(const planId of ['pdf','pdf_mentor']){let created;const r=res();await handleCreateOrder({method:'POST',body:{name:'Buyer',email:'buyer@example.com',planId,displayedAmountInPaise:PRODUCT_PLANS[planId].amountInPaise}},r,{getClient:()=>({key_id:'dummy',orders:{create:async value=>{created=value;return {id:'order_plan1',...value};}}})});assert.equal(r.code,200);assert.equal(created.amount,PRODUCT_PLANS[planId].amountInPaise);assert.equal(created.notes.planId,planId);}
 for(const [planId,amount,code] of [['pdf_mentor',29900,409],['pdf',49900,409],['bad',49900,400]]){const r=res();await handleCreateOrder({method:'POST',body:{name:'Buyer',email:'buyer@example.com',planId,displayedAmountInPaise:amount}},r,{getClient:()=>assert.fail('must not create')});assert.equal(r.code,code);}
});
test('only an explicitly tagged ₹499 mentor purchase receives the invite; old ₹499 buyers keep Course access only',()=>{
 const mentor=paid(order('pdf_mentor'));assert.match(purchaseBenefits(mentor).telegramInviteUrl,/^https:\/\/t\.me\//);
 for(const o of [order('pdf'),order(undefined,49900),order(undefined,100),order(undefined,24900)]){assert.equal(purchaseBenefits(paid(o)).telegramInviteUrl,undefined);assert.equal(paid(o).hasTelegramAccess,false);}
 for(const o of [order('pdf_mentor',29900),order('unknown',49900),order('pdf',100)])assert.throws(()=>paid(o));
});
test('checkout response and email get only server-verified benefits; client plan spoof does not upgrade',async()=>{
 process.env.RAZORPAY_KEY_SECRET='dummy-plan-secret';process.env.RESEND_API_KEY='dummy-mail-key';
 for(const planId of ['pdf','pdf_mentor']){const o=order(planId),p=payment(o);const body={orderId:o.id,paymentId:p.id,planId:'pdf_mentor',hasTelegramAccess:true,signature:crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${o.id}|${p.id}`).digest('hex')};let email;
 const r=res();await handleVerifyPayment({method:'POST',body},r,{getClient:()=>({orders:{fetch:async()=>o},payments:{fetch:async()=>p}}),mailSender:async data=>{email=data;}});
 assert.equal(r.code,200);assert.equal(r.body.hasTelegramAccess,planId==='pdf_mentor');assert.equal(Boolean(r.body.telegramInviteUrl),planId==='pdf_mentor');assert.equal(Boolean(email.telegramInviteUrl),planId==='pdf_mentor');assert.equal(email.amountInPaise,o.amount);
 const html=renderConfirmationEmail(email);assert.equal(html.includes('Join Mentico on Telegram'),planId==='pdf_mentor');assert.equal(html.includes('https://t.me/'),planId==='pdf_mentor');assert.equal(html.includes('subject to availability'),planId==='pdf_mentor');
 }
});
test('email recovery restores plan benefits from provider, not the token or browser',async()=>{
 process.env.RAZORPAY_KEY_SECRET='dummy-plan-secret';
 for(const planId of ['pdf','pdf_mentor']){const purchase=paid(order(planId));const token=createRecoveryToken(purchase);const r=res();await handleRestore({method:'POST',body:{token,hasTelegramAccess:true}},r,{verifyPurchase:async()=>purchase});assert.equal(r.code,200);assert.equal(Boolean(r.body.telegramInviteUrl),planId==='pdf_mentor');}
});
