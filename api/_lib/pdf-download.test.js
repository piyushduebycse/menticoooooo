import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadPublication } from '../../src/services/downloadPublication.js';
test('complete downloadable Course is assembled exactly from bounded authenticated chunks',async()=>{
 const data=Buffer.alloc(1024*1024+731,65);data.write('%PDF-1.7\n');let calls=0;const progress=[];
 const blob=await downloadPublication({accessToken:'dummy-pass',onProgress:value=>progress.push(value),fetcher:async(url,options)=>{
  calls++;assert.equal(url,'/api/pdf/social-freedom?download=1');assert.equal(options.headers.Authorization,'Bearer dummy-pass');
  if(options.method==='HEAD')return new Response(null,{headers:{'Content-Length':String(data.length)}});
  const [start,end]=options.headers.Range.slice(6).split('-').map(Number);assert(end-start+1<=1024*1024);
  return new Response(data.subarray(start,end+1),{status:206,headers:{'Content-Range':`bytes ${start}-${end}/${data.length}`}});
 }});
 assert.equal(calls,3);assert.equal(blob.type,'application/pdf');assert.deepEqual(Buffer.from(await blob.arrayBuffer()),data);assert.equal(progress.at(-1),100);
});
test('download reports unpaid/unavailable access and rejects missing or incomplete range data',async()=>{
 await assert.rejects(downloadPublication({accessToken:'',fetcher:()=>assert.fail('must not fetch')}),/confirmation email/);
 for(const status of [401,403,503])await assert.rejects(downloadPublication({accessToken:'dummy',fetcher:async()=>new Response(JSON.stringify({error:'Access unavailable'}),{status})}),/Access unavailable/);
 for(const response of [new Response('bad',{status:200}),new Response('bad',{status:206,headers:{'Content-Range':'bytes 0-4/5'}})]){
  await assert.rejects(downloadPublication({accessToken:'dummy',fetcher:async(_url,options)=>options.method==='HEAD'?new Response(null,{headers:{'Content-Length':'5'}}):response}),/interrupted|incomplete/);
 }
});
test('download can be aborted and never returns a partial book',async()=>{
 const controller=new AbortController();controller.abort();await assert.rejects(downloadPublication({accessToken:'dummy',signal:controller.signal,fetcher:async(_url,options)=>{options.signal.throwIfAborted();}}),{name:'AbortError'});
});
