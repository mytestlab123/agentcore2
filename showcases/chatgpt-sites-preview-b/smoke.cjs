// Repeatable localhost-only E2E for the accepted Site export. Test tooling only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {join} = path;
const {chromium} = require(process.argv[2] || '../../tools/browser/node_modules/playwright-core');
const loadAppE2EArtifacts = require('./app-e2e-artifacts.cjs').load;
const appJourney = process.env.SHOWCASE_JOURNEY === 'app-receipts';
const storyJourney = process.env.SHOWCASE_JOURNEY === 'stories';
const privateJourney = appJourney || storyJourney;
const defaultArtifacts = privateJourney
  ? join(os.homedir(),'.AGENTS-temp','manager','home-migration-20261016','core2-app-e2e-browser')
  : join(__dirname,'../../artifacts/showcase');
const artifacts = process.env.SHOWCASE_ARTIFACTS || defaultArtifacts;
if(privateJourney){
  const scratchPath=path.resolve(os.homedir(),'.AGENTS-temp'),scratch=fs.realpathSync(scratchPath)+path.sep,target=path.resolve(artifacts);
  assert(target.startsWith(scratchPath+path.sep),'Browser evidence path must be under ~/.AGENTS-temp');
  let ancestor=target;
  while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);
  assert(fs.realpathSync(ancestor)===scratch.slice(0,-1)||fs.realpathSync(ancestor).startsWith(scratch),'Browser evidence parent must resolve under ~/.AGENTS-temp');
  fs.mkdirSync(artifacts,{recursive:true});
  assert(fs.realpathSync(artifacts).startsWith(scratch),'Browser evidence must stay under ~/.AGENTS-temp');
}

(async () => {
  const html = fs.readFileSync(join(__dirname,'index.html'));
  const server = http.createServer((request,response) => {
    if (request.method !== 'GET' || request.url !== '/') {
      response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    response.end(html);
  });
  await new Promise((resolve,reject) => {
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const url = `http://127.0.0.1:${server.address().port}/`;
  let browser,context,page,tracing=false;
  const errors=[],network=[],unexpected=[];
  try {
    browser = await chromium.launch({headless:true,
      ...(process.env.SHOWCASE_BROWSER ? {executablePath:process.env.SHOWCASE_BROWSER} : {})});
    context = await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
    await context.tracing.start({screenshots:true,snapshots:true}); tracing=true;
    page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    // Only the initial main document may use HTTP. Any other request is
    // aborted before transmission and fails the check; no external services.
    await context.route('**/*',route=>{
      const request=route.request();
      if(request.url()===url && request.method()==='GET' && request.isNavigationRequest()
          && request.frame()===page.mainFrame() && network.length===0){
        network.push('local document'); return route.continue();
      }
      unexpected.push(request.resourceType()); return route.abort();
    });
    const text = id => page.locator('#'+id).innerText();
    const button = name => page.getByRole('button',{name,exact:true});
    const command = async (query,name) => {
      await button('Commands Ctrl K').click();
      await page.getByRole('textbox',{name:'Search commands',exact:true}).fill(query);
      await page.getByRole('dialog',{name:'Commands',exact:true}).getByRole('button',{name}).click();
    };
    const select1000 = async () => {
      await command('s3 bpa',/^S3 · Block Public Access/);
      await command('1000',/^Select up to 1,000 compatible findings/);
      assert.match(await text('selected-count'),/1,000 selected/);
      await button('Preview Fix').click();
      assert.match(await text('proposal-summary'),/Exact targets\s+1,000/);
    };
    const downloadJson = async name => {
      const waiting=page.waitForEvent('download',{timeout:10000});
      await button(name).click();
      const download=await waiting,path=await download.path();
      assert(path,'Expected a completed local JSON download');
      return JSON.parse(fs.readFileSync(path,'utf8'));
    };
    const response=await page.goto(url);
    assert.equal(response.status(),200);
    assert.equal(await page.title(),'Agentic Operations Lab · MOCK Showcase');
    assert.equal(await page.locator('.badge').innerText(),'SHOWCASE / MOCK');
    // Test-only failure after a real synthetic page render; normal assertions stay mandatory.
    if(process.env.SHOWCASE_FAILURE_FIXTURE === 'capture-v1')
      throw new Error('SHOWCASE_EXPECTED_FAILURE_CAPTURE_V1');
    if(appJourney){
      assert(process.env.CORE2_APP_E2E_DIR,'CORE2_APP_E2E_DIR is required for the app-receipts journey');
      const {summary,cases}=loadAppE2EArtifacts(process.env.CORE2_APP_E2E_DIR);
      await page.locator('#backend-receipts > summary').click();
      const mockBefore=await page.evaluate(()=>JSON.stringify({proposal,lastRun,datasetRevision,selected:[...selectedIds]}));
      const results=[];
      for(const name of ['success','uncertain-policy','reject']){
        const {packet,receiptName,receiptBytes}=cases.get(name),run=packet.run;
        await page.locator('#backend-clear').click();
        await page.locator('#backend-status').filter({hasText:'No reported receipt loaded'}).waitFor();
        await page.locator('#backend-file').setInputFiles({name:receiptName,mimeType:'application/json',buffer:receiptBytes});
        await page.locator('#backend-status').filter({hasText:'Reported receipt loaded'}).waitFor();
        const summaryText=(await page.locator('#backend-summary').innerText()).replace(/\s+/g,' '),rowsText=await page.locator('#backend-rows').innerText();
        assert.match(summaryText,/IMPORTED_ASSERTION/);assert.match(summaryText,/origin\/live acceptance NOT_VERIFIED/);
        assert.match(summaryText,/SYNTHETIC/);assert.match(summaryText,/SYNTHETIC_ONLY/);
        assert.match(summaryText,/Owner review status.*SYNTHETIC_TEST/);assert(summaryText.includes(packet.decision.choice));assert(summaryText.includes(run.status));
        assert.match(summaryText,/Host attestation.*NOT_AVAILABLE/);assert.match(summaryText,/Real execution gate.*OWNER_ACTION_REQUIRED/);
        assert.match(summaryText,/Reported mutation attempts/);assert.match(summaryText,/resource changes not confirmed/);
        assert.match(summaryText,/local viewer real writes 0/);
        assert.match(summaryText,new RegExp(`real ${run.realWrites} \/ simulated ${run.simulatedWrites}`));
        for(const result of run.results){
          for(const key of ['execution','providerReadback','compliance','freshness'])assert(rowsText.includes(result[key]),`Browser view omitted ${key} for ${name}`);
          assert(rowsText.includes(`${result.realWrites} / ${result.simulatedWrites}`));
        }
        assert.equal(await page.evaluate(()=>JSON.stringify({proposal,lastRun,datasetRevision,selected:[...selectedIds]})),mockBefore,'Receipt import changed local MOCK state');
        const values=run.results.map(result=>({execution:result.execution,provider:result.providerReadback,compliance:result.compliance,freshness:result.freshness,reportedRealAttempts:result.realWrites,reportedSimulatedAttempts:result.simulatedWrites}));
        results.push({case:name,reportedDecision:packet.decision.choice,reportedRunStatus:run.status,reviewStatus:'SYNTHETIC_TEST',hostAttestation:'NOT_AVAILABLE_IN_FILE_ONLY_VIEWER',realExecutionGate:'OWNER_ACTION_REQUIRED',values,actualAwsCalls:summary.actualAwsCalls,trust:packet.provenance,origin:packet.originAcceptance,localRealWrites:packet.localRealWrites,evidence:packet.evidence.provenance,limitation:packet.evidence.limitation});
        await page.screenshot({path:join(artifacts,`app-e2e-${name}.png`),fullPage:true});
      }
      await page.locator('#backend-clear').click();
      await page.locator('#backend-status').filter({hasText:'No reported receipt loaded'}).waitFor();
      assert.equal(await page.locator('#backend-rows tr').count(),0);
      await page.locator('#backend-file').setInputFiles({name:'invalid-receipt.json',mimeType:'application/json',buffer:Buffer.from('{"not":"a canonical receipt"}')});
      await page.locator('#backend-status').filter({hasText:'Receipt refused'}).waitFor();
      assert.equal(await page.locator('#backend-rows tr').count(),0);
      assert.equal(await page.evaluate(()=>JSON.stringify({proposal,lastRun,datasetRevision,selected:[...selectedIds]})),mockBefore,'Clear/refuse changed local MOCK state');
      assert.deepEqual(network,['local document']);assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);
      const receipt={status:'PASS',journey:'app-receipts',release:require('./RELEASE.json').release,browser:browser.version(),localhostDocumentRequests:network.length,unexpectedRequests:unexpected.length,pageErrors:errors.length,actualAwsCalls:summary.actualAwsCalls,clearAndInvalidRefusal:true,unchangedMockState:true,cases:results,hosted:'NOT_TESTED',liveProvider:'NOT_USED'};
      fs.writeFileSync(join(artifacts,'app-receipts-browser-evidence.json'),JSON.stringify(receipt,null,2));
      console.log(JSON.stringify(receipt));return;
    }
    if(storyJourney){
      await page.locator('#lab-nav-stories').click();
      await page.locator('#story-load').click();
      await page.locator('#story-preview').click();
      await page.locator('#story-approve').click();
      await page.waitForFunction(()=>lastRun?.state==='VERIFIED'&&!running());
      const s3={control:await page.evaluate(()=>lastRun.control),targets:await page.evaluate(()=>lastRun.targets.length),simulatedWrites:await page.evaluate(()=>lastRun.simulatedWrites),realWrites:await page.evaluate(()=>lastRun.realWrites)};
      assert.deepEqual(s3,{control:'s3-ssl',targets:1,simulatedWrites:1,realWrites:0});
      await page.locator('#story-kind').selectOption('security');
      await page.locator('#story-scenario').selectOption('normal');
      await page.locator('#story-load').click();
      assert.equal(await page.locator('#story-scope-label').innerText(),'3 EXACT GROUPS · ONE DECISION');
      assert.match(await page.locator('#story-context').innerText(),/LAB-01[\s\S]*LAB-02[\s\S]*LAB-03/);
      const group=await page.evaluate(()=>storySession.targets.map(({id,account,revision,control})=>({id,account,revision,control})));
      assert.deepEqual(group.map(t=>t.account),['LAB-01','LAB-02','LAB-03']);
      assert(group.every(t=>t.control==='sg-ssh'&&Number.isInteger(t.revision)));
      await page.locator('#story-explain').click();
      await page.locator('#story-investigate').click();
      await page.locator('#story-preview').click();
      const frozen=await page.evaluate(()=>proposal.targets.map(t=>({id:t.id,account:t.account,revision:t.revision,control:t.control})));
      assert.deepEqual(frozen,group);
      assert.equal(await page.evaluate(()=>Object.isFrozen(proposal.targets)),true);
      assert.match(await page.locator('#story-before').innerText(),/TCP 22 from 0\.0\.0\.0\/0/);
      assert.match(await page.locator('#story-after').innerText(),/Unrelated rules: retained/);
      await page.screenshot({path:join(artifacts,'grouped-ssh-story.png'),fullPage:true});
      await page.locator('#story-approve').click();
      await page.waitForFunction(()=>lastRun?.state==='VERIFIED'&&!running());
      await page.locator('#story-refresh').click();
      const ssh={control:await page.evaluate(()=>lastRun.control),decision:await page.evaluate(()=>lastRun.decision),state:await page.evaluate(()=>lastRun.state),targets:await page.evaluate(()=>lastRun.targets.length),simulatedWrites:await page.evaluate(()=>lastRun.simulatedWrites),realWrites:await page.evaluate(()=>lastRun.realWrites),provider:await page.evaluate(()=>lastRun.results.map(r=>r.providerReadback)),compliance:await page.evaluate(()=>lastRun.results.map(r=>r.complianceResult))};
      assert.equal(ssh.control,'sg-ssh');assert.equal(ssh.decision,'APPROVE ONCE');assert.equal(ssh.state,'VERIFIED');assert.equal(ssh.targets,3);assert.equal(ssh.simulatedWrites,3);assert.equal(ssh.realWrites,0);
      assert(ssh.provider.every(v=>v==='SIMULATED PARAMETERS MATCH'));assert(ssh.compliance.every(v=>v==='SIMULATED COMPLIANT'));
      await page.locator('#lab-nav-campaign').click();
      const runLabels=page.locator('#campaign-journal input[type=checkbox]');assert.equal(await runLabels.count(),2);
      await runLabels.nth(0).check();await runLabels.nth(1).check();
      const jsonWait=page.waitForEvent('download');await page.locator('#campaign-json').click();const jsonDownload=await jsonWait;
      const campaign=JSON.parse(fs.readFileSync(await jsonDownload.path(),'utf8'));
      const mdWait=page.waitForEvent('download');await page.locator('#campaign-markdown').click();const mdDownload=await mdWait;
      const markdown=fs.readFileSync(await mdDownload.path(),'utf8');
      assert.equal(campaign.schema,'agentcore2.synthetic-shift-handoff.v1');assert.equal(campaign.totals.runs,2);assert.equal(campaign.totals.targetEvaluations,4);assert.equal(campaign.totals.realWrites,0);
      assert.equal(campaign.source.release,require('./RELEASE.json').release);assert.equal(campaign.source.fingerprint,require('./RELEASE.json').guiSourceFingerprint);
      const sshRun=campaign.runs.find(r=>r.control==='sg-ssh');assert(sshRun);assert.equal(sshRun.targets.length,3);assert.equal(sshRun.simulatedWrites,3);assert.equal(sshRun.realWrites,0);
      assert(markdown.includes('3 simulated / 0 real'));assert(markdown.includes('- realWrites: 0'));
      const mockBefore=await page.evaluate(()=>JSON.stringify({proposal,lastRun,datasetRevision,selected:[...selectedIds]}));
      await page.locator('#lab-nav-review').click();
      await page.locator('#review-file').setInputFiles({name:'synthetic-campaign-handoff.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(campaign))});
      await page.locator('#review-import-status').filter({hasText:'Accepted 4 synthetic evaluations'}).waitFor();
      assert.match(await page.locator('#review-provenance').innerText(),/MOCK|synthetic|fingerprint/i);
      assert.equal(await page.evaluate(()=>JSON.stringify({proposal,lastRun,datasetRevision,selected:[...selectedIds]})),mockBefore,'Offline reopen changed the separate local MOCK executor state');
      await page.screenshot({path:join(artifacts,'campaign-offline-reopen.png'),fullPage:true});
      assert.deepEqual(network,['local document']);assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);
      const receipt={status:'PASS',journey:'four-minute-s3-plus-grouped-ssh',release:campaign.source.release,sourceFingerprint:campaign.source.fingerprint,browser:browser.version(),desktopViewport:[1440,1000],scenarios:[s3,ssh],frozenSgMembership:frozen,campaignJsonMarkdown:true,offlineReopen:{acceptedEvaluations:4,executorStateUnchanged:true},localDocumentRequests:1,unexpectedRequests:0,pageErrors:0,realWrites:0,hosted:'NOT_TESTED',realViewer:'NOT_RUN'};
      fs.writeFileSync(join(artifacts,'grouped-ssh-story-evidence.json'),JSON.stringify({receipt,campaign,markdown},null,2));
      console.log(JSON.stringify(receipt));return;
    }
    if(process.env.SHOWCASE_JOURNEY === 'defence') {
      await page.locator('#defence-intake > summary').click();
      const sampleWait=page.waitForEvent('download');await page.locator('#defence-sample').click();const sample=await sampleWait;const samplePath=await sample.path();
      await page.locator('#defence-file').setInputFiles({name:'defence-synthetic-sample.json',mimeType:'application/json',buffer:fs.readFileSync(samplePath)});await page.locator('#defence-status').filter({hasText:'staged'}).waitFor();
      assert.equal(await page.locator('#defence-rows tr').count(),2);await page.locator('#defence-filter').selectOption('s3-ssl-requests-only');await page.locator('#defence-load').click();
      await page.locator('#select-all').click();await page.locator('#lab-nav-governance').click();await page.locator('#governance-scenario').selectOption('mismatch');await page.locator('#lab-nav-copilot').click();
      await page.locator('#batch-preview').click();assert.match(await text('proposal-summary'),/Scope SHA-256/);await page.locator('#approve').click();
      await page.waitForFunction(()=>lastRun?.state==='NEEDS_REVIEW');assert.equal(await page.evaluate(()=>lastRun.realWrites),0);assert.equal(await page.evaluate(()=>lastRun.simulatedWrites),2);
      fs.mkdirSync(artifacts,{recursive:true});await page.screenshot({path:join(artifacts,'defence-outcome.png'),fullPage:true});
      const jsonWait=page.waitForEvent('download');await page.locator('#defence-json').click();const jsonDownload=await jsonWait;const packet=JSON.parse(fs.readFileSync(await jsonDownload.path(),'utf8'));
      const mdWait=page.waitForEvent('download');await page.locator('#defence-markdown').click();const mdDownload=await mdWait;const md=fs.readFileSync(await mdDownload.path(),'utf8');assert(md.includes('REAL_WRITES=0'));
      assert.equal(packet.selected.length,2);assert.equal(packet.REAL_WRITES,0);assert.equal(packet.outcome,'NEEDS_REVIEW');assert.equal(require('../../contracts/defence-factory/scope.cjs').digest(packet.frozenScope),packet.scopeDigest);assert(packet.originalInput.every(f=>f.record.compliance==='NON_COMPLIANT'));
      await page.locator('#defence-load').click();await page.locator('#select-all').click();await page.locator('#batch-preview').click();await page.locator('#reject').click();assert.equal(await page.evaluate(()=>lastRun.simulatedWrites),0);
      const epoch=await page.evaluate(()=>datasetRevision);await page.locator('#defence-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"unexpected":"private"}')});await page.locator('#defence-status').filter({hasText:'rejected'}).waitFor();assert.equal(await page.evaluate(()=>datasetRevision),epoch);
      assert.deepEqual(network,['local document']);assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);
      const receipt={status:'PASS',journey:'defence-import-group-decision-evidence',release:packet.sourceVersion,sourceFingerprint:packet.sourceFingerprint,rows:2,groupApprovals:1,rejectSimulatedWrites:0,REAL_WRITES:0,outcome:'NEEDS_REVIEW',actualJsonMarkdownDownloads:true,scopeDigestReadback:true,malformedInputUnchanged:true,localDocumentRequests:1,unexpectedRequests:0,pageErrors:0,hosted:'NOT_TESTED',realViewer:'NOT_RUN'};
      fs.writeFileSync(join(artifacts,'defence-receipt.json'),JSON.stringify(receipt,null,2));fs.writeFileSync(join(artifacts,'defence-evidence.json'),JSON.stringify(packet,null,2));fs.writeFileSync(join(artifacts,'defence-evidence.md'),md);console.log(JSON.stringify(receipt));return;
    }
    assert.equal(await text('total'),'49,476');
    assert.equal(await page.locator('#findings tr').count(),25);
    assert.equal(await page.getByLabel('Account filter').locator('option').count(),59);
    assert.deepEqual(await page.locator('#model option').allTextContents(),[
      'Nova Micro — Economy — 1.0x','Nova Lite — Default — 1.7x','Nova 2 Lite — Enhanced — 8.7x']);
    assert.match(await page.locator('.model-control').innerText(),/Input Cost Index/);
    assert.equal(await page.locator('#timeline li').count(),5);
    assert.equal(await page.locator('#timeline li p').count(),0);
    assert.match(await text('evidence-empty'),/No run recorded/);
    const filters={search:'s3',account:'LAB-01',resource:'S3',control:'s3-bpa',status:'NON_COMPLIANT',fixability:'AUTOMATED',severity:'HIGH'};
    for(const [id,value] of Object.entries(filters)){
      await button('Clear filters').click();
      for(let i=0;i<7;i++)await button('Next').click();
      assert.match(await text('page-info'),/^8 \/ /);
      if(id==='search')await page.locator('#search').fill(value);
      else await page.locator('#'+id).selectOption(value);
      assert.match(await text('page-info'),/^1 \/ /);
      assert.equal(await page.locator('#findings tr').count(),25);
    }
    assert.match(await text('selection-note'),/Retained Copilot context: .+Select a resource name to change the finding context/);
    await button('Clear filters').click();
    await button('Next').click(); assert.match(await text('count'),/26–50/);
    await button('Previous').click(); assert.match(await text('count'),/1–25/);
    await button('Sort by account').click();
    assert.match(await page.locator('#findings tr').first().innerText(),/LAB-01/);
    await page.getByLabel('Search findings',{exact:true}).fill('no-such-demo-record');
    assert.equal(await page.locator('#findings tr').count(),1); // One honest empty-state row.
    assert.match(await text('findings'),/No synthetic findings match/);
    assert.equal(await text('count'),'0 matching synthetic findings');
    assert(!(await button('Next').isEnabled()));
    await button('Clear filters').click();
    await page.getByLabel('Control filter').selectOption('s3-logging');
    await page.getByLabel('Status filter').selectOption('NON_COMPLIANT');
    await page.locator('#findings tr').first().getByRole('button').click();
    assert(!(await button('Preview Fix').isEnabled()));
    await button('Investigate').click(); assert.match(await text('reply'),/no automated proposal/);

    await button('Reset synthetic demo').click();
    await select1000();
    await page.locator('#targets-label').click();
    const snapshot=await downloadJson('Download exact target snapshot');
    assert.equal(snapshot.mode,'MOCK'); assert.equal(snapshot.targets.length,1000);
    assert.equal(new Set(snapshot.targets.map(t=>t.id)).size,1000);
    assert(snapshot.targets.every(t=>t.control==='s3-bpa'&&t.status==='NON_COMPLIANT'));
    await button('Reject').click();
    assert.match(await text('run-summary'),/REJECT · Consumed/);
    assert.match(await text('run-summary'),/Simulated writes \/ real writes\s+0 \/ 0/);
    assert.equal(await page.locator('#timeline li').count(),5);
    const rejected=await downloadJson('Download per-target evidence');
    assert.equal(rejected.outcome,'REJECTED'); assert.equal(rejected.targets.length,1000);
    assert(rejected.targets.every(t=>t.simulatedWrites===0&&t.realWrites===0&&t.currentStatus==='NON_COMPLIANT'));
    await page.getByRole('tab',{name:'Change',exact:true}).click();
    assert.match(await text('proposal-status'),/Decision consumed: REJECT/);
    assert(!(await button('Approve Once').isVisible()));

    await button('Reset synthetic demo').click(); await select1000();
    await page.getByLabel('Account filter').selectOption('LAB-01');
    assert(!(await button('Approve Once').isVisible()));
    assert.match(await text('selected-count'),/0 selected/);
    await button('Reset synthetic demo').click(); await select1000();
    await page.getByRole('combobox',{name:'Model comparison',exact:true}).selectOption('Nova 2 Lite — Enhanced — 8.7x');
    assert(await button('Approve Once').isVisible());
    await button('Approve Once').click();
    await page.waitForFunction(()=>document.querySelector('#run-summary').textContent.includes('VERIFIED'));
    const approved=await downloadJson('Download per-target evidence');
    assert.equal(approved.outcome,'VERIFIED'); assert.equal(approved.realWrites,0);
    assert.equal(approved.targets.length,1000);
    assert(approved.targets.every(t=>t.simulatedWrites===1&&t.realWrites===0&&t.currentStatus==='COMPLIANT'));
    assert.match(await text('timeline'),/Separate SIMULATED provider readback/);
    assert.match(await text('timeline'),/Separate SIMULATED compliance evaluation/);
    await page.getByRole('tab',{name:'Change',exact:true}).click();
    assert(!(await button('Approve Once').isVisible()));
    assert.match(await text('proposal-status'),/Decision consumed: APPROVE ONCE/);
    await page.getByRole('tab',{name:'Evidence',exact:true}).click();
    await button('Replay evidence stages').click();
    await page.waitForFunction(()=>document.querySelector('#replay-note').textContent.includes('complete'));
    assert.deepEqual(await downloadJson('Download per-target evidence'),approved);

    await button('Reset synthetic demo').click(); await page.locator('#learn > summary').click();
    await page.getByLabel('Simulate blocked targets: every 17th target, before any write').check();
    await select1000(); await button('Approve Once').click();
    await page.waitForFunction(()=>document.querySelector('#run-summary').textContent.includes('PARTIAL'));
    const partial=await downloadJson('Download per-target evidence');
    const blocked=partial.targets.filter(t=>t.outcome==='BLOCKED');
    assert.equal(blocked.length,58); assert(blocked.every(t=>t.simulatedWrites===0&&t.currentStatus==='NON_COMPLIANT'));
    assert.equal(partial.targets.reduce((n,t)=>n+t.simulatedWrites,0),942);
    await page.locator('#last-run details > summary').click();
    await page.locator('#outcome-filter').selectOption('BLOCKED');
    assert.match(await text('outcome-count'),/58 matching outcomes · page 1/);
    await button('Next outcomes').click(); assert.match(await text('outcome-count'),/page 2/);

    await button('Reset synthetic demo').click(); await button('Inspect').click();
    assert(await page.getByRole('dialog',{name:'Synthetic resource inspector'}).isVisible());
    await page.getByRole('dialog',{name:'Synthetic resource inspector'}).getByRole('button',{name:'Close',exact:true}).click();
    await button('Toggle theme').click(); assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    if(process.argv[3])await page.screenshot({path:process.argv[3],fullPage:true});
    await button('Toggle theme').click(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.getByRole('button',{name:'AgentCore Harness',exact:true}).click();
    assert.match(await text('architecture-detail'),/invokes no agent/);
    assert.equal(await page.getByRole('link',{name:'Open separate Amplify engineering demo'}).getAttribute('href'),
      'https://main.d2rar4n3w1jdwz.amplifyapp.com');
    await command('ssh',/^Security Groups · internet-open SSH/);
    assert.equal(await page.getByLabel('Resource filter').inputValue(),'Security Group');
    assert.equal(await page.getByLabel('Control filter').inputValue(),'sg-ssh');
    assert.deepEqual(network,['local document']); assert.deepEqual(unexpected,[]); assert.deepEqual(errors,[]);
    console.log(JSON.stringify({status:'PASS',release:'v1.2.1',mode:'SHOWCASE / MOCK',
      localhostHttpRender:true,desktopViewport:[1440,1000],
      accounts:58,baselineRecords:49476,pageSize:25,rejectSimulatedWrites:0,
      approveSimulatedWrites:1000,partialBlocked:58,partialSimulatedWrites:942,
      completeTargetDownloads:true,consumedDecisions:true,replayNoAdditionalWrites:true,
      filterChangeCancels:true,manualFixDisabled:true,evidenceSteps:5,
      p1FilterResetCount:7,namedContextGuidance:true,conciseEmptyEvidence:true,
      localDocumentRequests:network.length,unexpectedRequests:unexpected.length,browserErrors:errors.length,realWrites:0,modelCalls:0},null,2));
  } catch (error) {
    fs.mkdirSync(artifacts,{recursive:true});
    fs.writeFileSync(join(artifacts,'failure.json'),JSON.stringify({message:error.message,errors,unexpected},null,2));
    if(page) await page.screenshot({path:join(artifacts,'failure.png'),fullPage:true}).catch(()=>{});
    if(tracing) await context.tracing.stop({path:join(artifacts,'trace.zip')}).catch(()=>{});
    throw error;
  } finally {
    try { if(browser) await browser.close(); }
    finally { await new Promise(resolve=>server.close(resolve)); }
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
