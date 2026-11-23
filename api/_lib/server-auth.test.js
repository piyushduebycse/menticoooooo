import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyAuthUser } from './server-auth.js';
import { createAccessToken, verifyAccessToken } from './access-token.js';
import { PurchaseError } from './payment-fulfillment.js';
import webhook from '../razorpay/webhook.js';
const response=()=>({setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
test('signed pass requires fresh provider confirmation; no Firebase or profile grants',async()=>{
 process.env.RAZORPAY_KEY_SECRET='test-only-secret'; const purchase={email:'buyer@example.com',orderId:'order_test1',paymentId:'pay_test1'};
 const token=createAccessToken(purchase); const req={headers:{authorization:`Bearer ${token}`}};
 const result=await verifyAuthUser(req,response(),{verifyPurchase:async input=>{assert.deepEqual(input,purchase);return purchase;}});assert.equal(result.hasPurchased,true);
 for(const [error,code] of [[new PurchaseError('Refunded'),403],[new Error('Provider offline'),503]]){const res=response();assert.equal(await verifyAuthUser(req,res,{verifyPurchase:async()=>{throw error;}}),null);assert.equal(res.code,code);}
 for(const headers of [{},{authorization:'Bearer firebase-token'},{authorization:`Bearer ${token}corrupt`}]){const res=response();assert.equal(await verifyAuthUser({headers},res,{verifyPurchase:async()=>{throw Error('must not call');}}),null);assert.equal(res.code,401);}
});
test('no default signing secret or passes without payment references',()=>{
 process.env.RAZORPAY_KEY_SECRET='test-only-secret'; assert.equal(verifyAccessToken(createAccessToken({email:'buyer@example.com'})),null);
 delete process.env.RAZORPAY_KEY_SECRET;delete process.env.ACCESS_TOKEN_SECRET; assert.equal(verifyAccessToken('mtc_e30.bad'),null);
});
test('webhook validates raw HMAC and safely accepts duplicate events',async()=>{
 process.env.RAZORPAY_WEBHOOK_SECRET='dummy-webhook'; const rawBody=Buffer.from(JSON.stringify({event:'payment.captured'})); const signature=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
 for(let i=0;i<2;i++){const res=response();await webhook({method:'POST',rawBody,headers:{'x-razorpay-signature':signature}},res);assert.equal(res.code,200);}
 const res=response();await webhook({method:'POST',rawBody,headers:{'x-razorpay-signature':'bad'}},res);assert.equal(res.code,400);
});
