/* Read-only canonical receipt consumer. File provenance never authenticates a backend. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DefenceEvidence=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const MAX_BYTES=262144;
const bad=()=>{throw Error('INVALID_REPORTED_EVIDENCE');};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
// A deliberately small validator for the pinned v1 schema, not a new wire contract.
function validate(value,schema,root){
 if(schema.$ref)return validate(value,root.$defs[schema.$ref.split('/').pop()],root);
 const matches=s=>{try{validate(value,s,root);return true;}catch{return false;}};
 if(schema.anyOf&&!schema.anyOf.some(matches))bad();
 if(schema.oneOf&&schema.oneOf.filter(matches).length!==1)bad();
 if('const' in schema&&value!==schema.const)bad();
 if(schema.enum&&!schema.enum.includes(value))bad();
 if(schema.type){const types=Array.isArray(schema.type)?schema.type:[schema.type];if(!types.some(t=>t==='null'?value===null:t==='object'?object(value):t==='array'?Array.isArray(value):t==='integer'?Number.isSafeInteger(value):typeof value===t))bad();}
 if(typeof value==='string'){
  if(schema.maxLength!==undefined&&value.length>schema.maxLength)bad();
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))bad();
  if(schema.format==='date-time'&&(!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,19)!==value.slice(0,19)))bad();
 }
 if(typeof value==='number'&&((schema.minimum!==undefined&&value<schema.minimum)||(schema.maximum!==undefined&&value>schema.maximum)))bad();
 if(Array.isArray(value)){
  if((schema.minItems!==undefined&&value.length<schema.minItems)||(schema.maxItems!==undefined&&value.length>schema.maxItems))bad();
  if(schema.uniqueItems&&new Set(value.map(v=>JSON.stringify(v))).size!==value.length)bad();
  if(schema.items)for(const v of value)validate(v,schema.items,root);
 }
 if(object(value)){
  if(schema.required?.some(k=>!Object.hasOwn(value,k)))bad();
  for(const k of Object.keys(value)){if(schema.additionalProperties===false&&!Object.hasOwn(schema.properties||{},k))bad();if(schema.properties?.[k])validate(value[k],schema.properties[k],root);}
 }
}
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function read(input,schema,scope,parseJSON){try{
 let text;if(typeof input==='string')text=input;else if(input instanceof Uint8Array){if(input.byteLength>MAX_BYTES)bad();text=new TextDecoder('utf-8',{fatal:true}).decode(input);}else bad();
 if(!text||new TextEncoder().encode(text).length>MAX_BYTES||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\uffff]/.test(text))bad();
 const records=parseJSON(text);if(!Array.isArray(records)||records.length!==4)bad();
 const byKind={};for(const envelope of records){validate(envelope,schema,schema);if(!['Batch','Decision','Run','Evidence'].includes(envelope.kind)||byKind[envelope.kind])bad();byKind[envelope.kind]=envelope.record;}
 const {Batch:b,Decision:d,Run:r,Evidence:e}=byKind;if(!b||!d||!r||!e)bad();
 // Decode before scanning: escaped private strings must not bypass the boundary.
 const scan=v=>{if(typeof v==='string'&&(/arn:|AKIA[A-Z0-9]{16}|ASIA[A-Z0-9]{16}|https?:|-----BEGIN|@|secret|password|token|credential/i.test(v)||(!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(v)&&/\d{12}/.test(v))))bad();if(v&&typeof v==='object')Object.values(v).forEach(scan);};scan(records);
 const {scopeDigest,...unsigned}=b;
 if(scope.digest(unsigned)!==scopeDigest||b.mode==='UNKNOWN'||Date.parse(b.expiresAt)<=Date.parse(b.frozenAt))bad();
 if(d.batchId!==b.batchId||d.scopeDigest!==scopeDigest||r.batchId!==b.batchId||r.decisionId!==d.decisionId||r.mode!==b.mode||e.runId!==r.runId||e.realWrites!==r.realWrites)bad();
 if(Date.parse(d.decidedAt)<Date.parse(b.frozenAt)||Date.parse(d.decidedAt)>=Date.parse(d.expiresAt)||Date.parse(d.expiresAt)>Date.parse(b.expiresAt)||Date.parse(e.recordedAt)<Date.parse(d.decidedAt))bad();
 const key=t=>[t.resource.accountAlias,t.resource.resourceAlias,t.controlId,t.findingId].join('|');
 const sorted=[...b.targets].sort((a,z)=>key(a)<key(z)?-1:key(a)>key(z)?1:0);
 if(b.targets.some((t,i)=>key(t)!==key(sorted[i])))bad();
 const targets=new Map();for(const t of b.targets){if(targets.has(t.findingId)||t.controlId!==b.targets[0].controlId||t.capabilityId!==b.targets[0].capabilityId||t.expectedChange!==b.targets[0].expectedChange)bad();targets.set(t.findingId,t);}
 if(new Set(b.targets.map(t=>key(t).split('|').slice(0,3).join('|'))).size!==b.targets.length)bad();
 if((b.mode==='MOCK'&&b.targets.some(t=>!['mock-a','mock-b'].includes(t.resource.accountAlias)))||(b.mode!=='MOCK'&&b.targets.some(t=>t.resource.accountAlias!=='amit')))bad();
 const changes={'s3-require-tls':'DENY_INSECURE_TRANSPORT','s3-block-public-access':'ENABLE_BUCKET_PUBLIC_ACCESS_BLOCK','sg-restrict-ssh':'REMOVE_EXACT_WORLD_OPEN_SSH'};
 if(b.targets.some(t=>changes[t.capabilityId]!==t.expectedChange))bad();
 if(r.results.length!==targets.size||new Set(r.results.map(x=>x.findingId)).size!==targets.size)bad();
 let real=0,simulated=0;for(const x of r.results){const t=targets.get(x.findingId);if(!t||x.resourceAlias!==t.resource.resourceAlias)bad();real+=x.realWrites;simulated+=x.simulatedWrites;if(['NOT_RUN','BLOCKED'].includes(x.execution)&&(x.realWrites||x.simulatedWrites))bad();}
 if(real!==r.realWrites||simulated!==r.simulatedWrites||(['MOCK','LAB_READ'].includes(b.mode)&&real!==0)||(b.mode!=='MOCK'&&simulated!==0))bad();
 if((d.choice==='REJECT'||['NOT_RUN','REJECTED','BLOCKED'].includes(r.status))&&(real||simulated||r.results.some(x=>x.execution==='SUCCEEDED')))bad();
 if(d.choice==='REJECT'&&!['REJECTED','BLOCKED','NOT_RUN'].includes(r.status))bad();
 if(r.status==='VERIFIED'&&(d.choice!=='APPROVE_ONCE'||r.results.some(x=>x.execution!=='SUCCEEDED'||x.providerReadback!=='MATCH'||x.compliance!=='COMPLIANT'||x.freshness!=='FRESH'||!x.receiptId)))bad();
 return freeze({provenance:'IMPORTED_ASSERTION',originAcceptance:'NOT_VERIFIED',localRealWrites:0,batch:b,decision:d,run:r,evidence:e});
}catch{bad();}}
return Object.freeze({read,MAX_BYTES});
});
