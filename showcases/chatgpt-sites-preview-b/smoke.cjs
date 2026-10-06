// Repeatable localhost-only E2E for the accepted Site export. Test tooling only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const {join} = require('node:path');
const {chromium} = require(process.argv[2] || '../../tools/browser/node_modules/playwright-core');

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
  const artifacts = process.env.SHOWCASE_ARTIFACTS || join(__dirname,'../../artifacts/showcase');
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
    assert.equal(await page.title(),'Preview B · Contextual Copilot v1.2');
    assert.equal(await page.locator('.badge').innerText(),'SHOWCASE / MOCK');
    // Test-only failure after a real synthetic page render; normal assertions stay mandatory.
    if(process.env.SHOWCASE_FAILURE_FIXTURE === 'capture-v1')
      throw new Error('SHOWCASE_EXPECTED_FAILURE_CAPTURE_V1');
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
