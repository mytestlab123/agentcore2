// Repeatable offline E2E for the accepted Site export. Test tooling only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {pathToFileURL} = require('node:url');
const {join} = require('node:path');
const {chromium} = require(process.argv[2] || 'playwright');

(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.SHOWCASE_BROWSER ? {executablePath:process.env.SHOWCASE_BROWSER} : {})});
  try {
    const context = await browser.newContext({offline:true,viewport:{width:1440,height:1000}});
    const page = await context.newPage(),errors=[],network=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
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
    await page.goto(pathToFileURL(join(__dirname,'index.html')).href);
    assert.equal(await page.title(),'Preview B · Contextual Copilot v1.2');
    assert.equal(await page.locator('.badge').innerText(),'SHOWCASE / MOCK');
    assert.equal(await text('total'),'49,476');
    assert.equal(await page.locator('#findings tr').count(),25);
    assert.equal(await page.getByLabel('Account filter').locator('option').count(),59);
    assert.deepEqual(await page.locator('#model option').allTextContents(),[
      'Nova Micro — Economy — 1.0x','Nova Lite — Default — 1.7x','Nova 2 Lite — Enhanced — 8.7x']);
    assert.match(await page.locator('.model-control').innerText(),/Input Cost Index/);
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
    await page.getByLabel('Outcome filter',{exact:true}).selectOption('BLOCKED');
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
    await page.setViewportSize({width:390,height:844});
    assert(await button('Commands Ctrl K').isVisible());
    await page.getByRole('tab',{name:'Context',exact:true}).click();
    assert(await button('Explain').isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await command('ssh',/^Security Groups · internet-open SSH/);
    assert.equal(await page.getByLabel('Resource filter').inputValue(),'Security Group');
    assert.equal(await page.getByLabel('Control filter').inputValue(),'sg-ssh');
    assert.deepEqual(network,[]); assert.deepEqual(errors,[]);
    console.log(JSON.stringify({status:'PASS',release:'v1.2.0',mode:'SHOWCASE / MOCK',
      offlineFileRender:true,desktopViewport:[1440,1000],mobileViewport:[390,844],
      accounts:58,baselineRecords:49476,pageSize:25,rejectSimulatedWrites:0,
      approveSimulatedWrites:1000,partialBlocked:58,partialSimulatedWrites:942,
      completeTargetDownloads:true,consumedDecisions:true,replayNoAdditionalWrites:true,
      filterChangeCancels:true,manualFixDisabled:true,evidenceSteps:5,
      networkRequests:network.length,browserErrors:errors.length,realWrites:0,modelCalls:0},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
