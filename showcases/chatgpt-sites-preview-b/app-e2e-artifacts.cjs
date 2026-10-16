// Bounded test-only loader shared by the Node VM and the focused browser smoke.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const intake=require('../../contracts/defence-factory/intake.cjs');
const reader=require('../../contracts/defence-factory/evidence.cjs');
const schema=require('../../contracts/defence-factory/v1.schema.json');
const scope=require('../../contracts/defence-factory/scope.cjs');

function load(directory){
 const scratch=fs.realpathSync(path.join(os.homedir(),'.AGENTS-temp')),
  root=fs.realpathSync(directory),allowed=scratch+path.sep;
 assert(root.startsWith(allowed),'Application E2E artifacts must be under ~/.AGENTS-temp');
 const safeFile=(name,suffix,limit)=>{
  assert.equal(typeof name,'string');assert.match(name,/^[a-z0-9][a-z0-9._-]{0,127}$/);assert(name.endsWith(suffix));
  const real=fs.realpathSync(path.join(root,name));assert.equal(path.dirname(real),root,'Artifact file must stay inside its input directory');
  const stat=fs.statSync(real);assert(stat.isFile());assert(stat.size<=limit,`Artifact exceeds ${limit} byte bound`);return fs.readFileSync(real);
 };
 const summaryBytes=safeFile('app-e2e-summary.json','.json',65536),summary=intake.parseJSON(new TextDecoder('utf-8',{fatal:true}).decode(summaryBytes));
 const requiredSummaryKeys=['approval','actualAwsCalls','cases','provider','schemaVersion'];
 const allowedSummaryKeys=[...requiredSummaryKeys,'reportedAttemptCountsAreActualAwsCalls','sourceRevision'];
 assert(requiredSummaryKeys.every(key=>Object.hasOwn(summary,key)),'Artifact summary is missing required contract fields');
 assert(Object.keys(summary).every(key=>allowedSummaryKeys.includes(key)),'Artifact summary contains unsupported fields');
 assert.equal(summary.schemaVersion,'awsops-canary-e2e/1');assert.equal(summary.approval,'TEST_SIMULATION');assert.equal(summary.provider,'FAKE_SDK');assert.equal(summary.actualAwsCalls,0);
 assert.equal(summary.reportedAttemptCountsAreActualAwsCalls,false,'Reported mutation attempts must be distinct from actual AWS calls');
 if(Object.hasOwn(summary,'sourceRevision'))assert.match(summary.sourceRevision,/^[a-f0-9]{40}$/);
 assert(Array.isArray(summary.cases)&&summary.cases.length>=3&&summary.cases.length<=32);
 const cases=new Map();let totalBytes=summaryBytes.length;
 for(const item of summary.cases){
  assert.deepEqual(Object.keys(item).sort(),['audit','name','receipt'].sort());assert.match(item.name,/^[a-z][a-z0-9-]{0,31}$/);assert(!cases.has(item.name));
  let auditName=null,packet=null,text=null,receiptName=null,receiptBytes=null;
  if(item.audit!==null){auditName=item.audit;const audit=safeFile(auditName,'.audit.json',262144);totalBytes+=audit.length;intake.parseJSON(new TextDecoder('utf-8',{fatal:true}).decode(audit));}
  if(item.receipt!==null){receiptName=item.receipt;receiptBytes=safeFile(receiptName,'.receipt.json',262144);totalBytes+=receiptBytes.length;text=new TextDecoder('utf-8',{fatal:true}).decode(receiptBytes);packet=reader.read(receiptBytes,schema,scope,intake.parseJSON);}
  if(['success','uncertain-policy','reject'].includes(item.name))assert(packet,`Required application case ${item.name} needs a canonical receipt`);
  cases.set(item.name,{packet,text,receiptName,receiptBytes,auditName});
 }
 assert(totalBytes<=2097152,'Application E2E artifact set exceeds 2 MiB');
 for(const name of ['success','uncertain-policy','reject'])assert(cases.has(name),`Missing required application case ${name}`);
 for(const name of ['success','uncertain-policy','reject']){
  const {packet}=cases.get(name),r=packet.run,d=packet.decision,e=packet.evidence,attempts=r.realWrites+r.simulatedWrites;
  assert.equal(packet.provenance,'IMPORTED_ASSERTION');assert.equal(packet.originAcceptance,'NOT_VERIFIED');assert.equal(packet.localRealWrites,0);
  assert.equal(e.provenance,'SYNTHETIC');assert.equal(e.limitation,'SYNTHETIC_ONLY');
  assert(r.results.length>0);assert(r.results.every(x=>['providerReadback','compliance','freshness'].every(k=>typeof x[k]==='string')));
  if(name==='success'){assert.equal(d.choice,'APPROVE_ONCE');assert.equal(attempts,4);assert.equal(summary.actualAwsCalls,0);assert(r.results.some(x=>x.execution==='SUCCEEDED'));assert(r.results.every(x=>x.providerReadback==='MATCH'&&x.compliance==='UNKNOWN'&&x.freshness==='NOT_VERIFIED'));}
  if(name==='uncertain-policy'){assert.equal(d.choice,'APPROVE_ONCE');assert.equal(attempts,4);assert.equal(summary.actualAwsCalls,0);assert(r.results.some(x=>x.execution==='UNKNOWN'));assert(r.results.every(x=>x.providerReadback==='MATCH'&&x.compliance==='UNKNOWN'&&x.freshness==='NOT_VERIFIED'));}
  if(name==='reject'){assert.equal(d.choice,'REJECT');assert.equal(attempts,0);assert(r.results.every(x=>x.execution==='NOT_RUN'));}
 }
 return {summary,cases};
}
module.exports=Object.freeze({load});
