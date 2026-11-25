import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecoveryToken, verifyRecoveryToken } from './recovery-token.js';
import { createAccessToken, verifyAccessToken } from './access-token.js';
import { handleRequestRecovery } from '../purchase/request-recovery.js';
import { handleRestore } from '../purchase/restore.js';
import { sendRecoveryEmail } from './recovery-mail.js';
import { PurchaseError } from './payment-fulfillment.js';
const purchase = { email: 'buyer@example.com', orderId: 'order_test1', paymentId: 'pay_test1', name: 'Buyer' };
const order = { id: purchase.orderId, amount: 100, currency: 'INR', status: 'paid', amount_paid: 100, amount_due: 0, notes: { productId: 'social-freedom', userEmail: purchase.email, userName: purchase.name } };
const payment = { id: purchase.paymentId, order_id: purchase.orderId, amount: 100, currency: 'INR', status: 'captured', captured: true, amount_refunded: 0, refund_status: null };
const response = () => ({ headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code;return this; }, json(body) { this.body=body;return this; } });
const req = body => ({method:'POST',body});
const client = (p=payment,o=order) => ({ payments: {fetch:async()=>p}, orders:{fetch:async()=>o} });
function setup() { process.env.RAZORPAY_KEY_SECRET = 'fixture-secret-only'; }
test('recovery tokens expire, resist tampering, and cannot be used as Course access passes',()=>{
 setup(); const now=Date.now(); const token=createRecoveryToken(purchase,now); assert.equal(verifyRecoveryToken(token,now).email,purchase.email);
 assert.equal(createRecoveryToken(purchase,now),token);
 for(const invalid of [token+'bad',token.replace('mtcr_','mtc_'),'garbage',createAccessToken(purchase)]) assert.equal(verifyRecoveryToken(invalid,now),null);
 assert.equal(verifyAccessToken(token),null);assert.equal(verifyRecoveryToken(token,now+31*60*1000),null);
 assert.equal(verifyRecoveryToken(token,now-31*60*1000),null);
 const expired=verifyRecoveryToken(token,now).exp*1000;assert.equal(verifyRecoveryToken(token,expired),null);
});
test('request never returns a pass and sends only to provider-confirmed purchase email, including old ₹1 orders',async()=>{
 setup();const sent=[];const res=response();await handleRequestRecovery(req({email:' BUYER@example.com ',paymentId:purchase.paymentId}),res,{configured:()=>true,getClient:()=>client(),sendEmail:async message=>sent.push(message)});
 assert.equal(res.code,200);assert.equal(res.headers['Cache-Control'],'private, no-store');assert.equal(sent.length,1);assert.equal(sent[0].email,purchase.email);assert.equal(verifyRecoveryToken(sent[0].token).paymentId,purchase.paymentId);assert.equal(res.body.accessToken,undefined);assert.equal(res.body.token,undefined);
});
test('wrong email, missing/foreign/unpaid/refunded purchases have identical responses and send no emails',async()=>{
 setup(); const cases=[{email:'other@example.com'},{p:{...payment,amount_refunded:1,refund_status:'partial'}},{p:{...payment,status:'authorized'}},{p:{...payment,order_id:null}},{o:{...order,notes:{...order.notes,productId:'other'}}},{p:{...payment,amount:1}}];
 let expected;for(const scenario of cases){const res=response();await handleRequestRecovery(req({email:scenario.email||purchase.email,paymentId:purchase.paymentId}),res,{configured:()=>true,getClient:()=>client(scenario.p,scenario.o),sendEmail:async()=>assert.fail('must not send')});assert.equal(res.code,200);expected ||= res.body;assert.deepEqual(res.body,expected);}
 const res=response();await handleRequestRecovery(req(purchase),res,{configured:()=>true,getClient:()=>({payments:{fetch:async()=>{throw {statusCode:400};}}})});assert.deepEqual(res.body,expected);
});
test('configuration/delivery/provider failures grant no access; malformed requests and wrong methods are rejected',async()=>{
 setup();for(const deps of [{configured:()=>false},{configured:()=>true,getClient:()=>{throw Error('offline');}},{configured:()=>true,getClient:()=>client(),sendEmail:async()=>{throw Error('mail offline');}}]){const res=response();await handleRequestRecovery(req(purchase),res,deps);assert.equal(res.code,503);assert.equal(res.body.accessToken,undefined);}
 const res=response();await handleRequestRecovery(req({email:purchase.email,paymentId:'bad'}),res);assert.equal(res.code,400);
 const method=response();await handleRequestRecovery({method:'GET'},method);assert.equal(method.code,405);
});
test('recovery exchange requires emailed proof then checks provider again and issues normal access pass',async()=>{
 setup();const token=createRecoveryToken(purchase);const res=response();let checks=0;await handleRestore(req({token}),res,{verifyPurchase:async value=>{checks++;assert.deepEqual(value,{email:purchase.email,orderId:purchase.orderId,paymentId:purchase.paymentId});return purchase;}});
 assert.equal(checks,1);assert.equal(res.code,200);assert.equal(verifyAccessToken(res.body.accessToken).email,purchase.email);
 for(const body of [{},purchase,{token:createAccessToken(purchase)},{token:token+'bad'}]){const r=response();await handleRestore(req(body),r,{verifyPurchase:async()=>assert.fail('must not verify')});assert.equal(r.code,400);}
 for(const [error,status] of [[new PurchaseError('refunded'),403],[new Error('outage'),503]]){const r=response();await handleRestore(req({token}),r,{verifyPurchase:async()=>{throw error;}});assert.equal(r.code,status);assert.equal(r.body.accessToken,undefined);}
});
test('recovery mail uses a fixed HTTPS origin, private fragment, and stable idempotency key',async()=>{
 setup();process.env.RESEND_API_KEY='dummy-mail-key';process.env.RECOVERY_FROM_EMAIL='Mentico <access@mentico.co.in>';const token=createRecoveryToken(purchase);const calls=[];
 const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true};};await sendRecoveryEmail({email:purchase.email,token},{fetcher});await sendRecoveryEmail({email:purchase.email,token},{fetcher});
 assert.equal(calls[0].url,'https://api.resend.com/emails');const body=JSON.parse(calls[0].options.body);assert.deepEqual(body.to,[purchase.email]);assert.match(body.text,/https:\/\/www\.mentico\.co\.in\/restore#token=mtcr_/);assert.equal(calls[0].options.headers['Idempotency-Key'],calls[1].options.headers['Idempotency-Key']);
 await assert.rejects(sendRecoveryEmail({email:purchase.email,token},{fetcher:async()=>({ok:false})}));
});
