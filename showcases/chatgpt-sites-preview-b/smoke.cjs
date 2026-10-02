// One offline browser proof: no server, installed browser or model service dependency.
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {join} = require('node:path');
const {createHash} = require('node:crypto');
const {chromium} = require(process.argv[2] || 'playwright');
(async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.SHOWCASE_BROWSER ? {executablePath:process.env.SHOWCASE_BROWSER} : {})});
  try {
    const target=process.env.SHOWCASE_URL || pathToFileURL(join(__dirname,'index.html')).href;
    const hosted=/^https:\/\//.test(target);
    if(process.env.SHOWCASE_URL && !hosted)throw new Error('Hosted proof requires HTTPS');
    const context = await browser.newContext({offline:!hosted, viewport:{width:1440,height:1000}});
    const page = await context.newPage();
    if(hosted) await page.route('**/*',route=>
      route.request().url()===target && route.request().method()==='GET'
        ? route.continue() : route.abort());
    const errors=[], network=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
    const response=await page.goto(target);
    if(hosted) {
      assert.equal(response.status(),200);
      assert.equal(createHash('sha256').update(await response.body()).digest('hex'),
        '1bc76ab8f57090a3132e2371ff49973b5e37c29ea191044556ac2b930c50acbd');
    }
    assert.equal(await page.locator('.badge').innerText(),'MOCK SHOWCASE');
    assert.equal(await page.locator('#findings tr').count(),5);
    assert.equal(await page.locator('#timeline li').count(),5);
    assert.deepEqual(await page.locator('#model option').allTextContents(),[
      'Nova Micro — Economy — 1.0x','Nova Lite — Default — 1.7x','Nova 2 Lite — Enhanced — 8.7x']);
    assert.equal(await page.locator('#model').inputValue(),'Nova Lite — Default — 1.7x');
    await page.getByLabel('Status filter').selectOption('NON_COMPLIANT');
    assert.equal(await page.locator('#findings tr').count(),2);
    await page.getByLabel('Fixability filter').selectOption('AUTOMATED');
    assert.equal(await page.locator('#findings tr').count(),1);
    await page.getByLabel('Search findings').fill('not-present');
    assert.equal(await page.locator('#findings tr').count(),0);
    assert.equal(await page.locator('#count').innerText(),'No findings match these filters.');
    await page.getByRole('button',{name:'Reset synthetic demo'}).click();
    await page.getByRole('button',{name:'Assign a service owner',exact:true}).click();
    assert(await page.getByRole('button',{name:'Preview Fix',exact:true}).isDisabled());
    await page.getByRole('button',{name:'Investigate',exact:true}).click();
    assert.match(await page.locator('#reply').innerText(),/Manual review is required/);
    await page.getByRole('button',{name:'Require encrypted transport',exact:true}).click();
    await page.getByRole('button',{name:'Preview Fix',exact:true}).click();
    await page.getByRole('button',{name:'Assign a service owner',exact:true}).click();
    assert(await page.getByRole('button',{name:'Approve Once',exact:true}).isHidden());
    assert.equal(await page.locator('#result').innerText(),'');
    await page.getByRole('button',{name:'Require encrypted transport',exact:true}).click();
    await page.getByRole('button',{name:'Explain',exact:true}).click();
    assert.match(await page.locator('#reply').innerText(),/deterministic response/);
    await page.getByRole('button',{name:'Preview Fix',exact:true}).click();
    await page.getByRole('button',{name:'Reject',exact:true}).click();
    assert.equal(await page.locator('#result').innerText(),'MOCK REJECTED · 0 simulated writes · 0 real writes');
    assert.match(await page.locator('#timeline').innerText(),/original NON_COMPLIANT finding unchanged/);
    await page.getByRole('button',{name:'Reset synthetic demo'}).click();
    await page.getByRole('button',{name:'Preview Fix',exact:true}).click();
    await page.getByRole('combobox',{name:'Model comparison',exact:true}).selectOption('Nova 2 Lite — Enhanced — 8.7x');
    assert(await page.getByRole('button',{name:'Approve Once',exact:true}).isVisible());
    await page.getByRole('button',{name:'Approve Once',exact:true}).click();
    assert.equal(await page.locator('#result').innerText(),'MOCK VERIFIED · 1 simulated write · 0 real writes');
    assert.match(await page.locator('#timeline').innerText(),/separate compliance evaluation: COMPLIANT/);
    assert(await page.getByRole('button',{name:'Approve Once',exact:true}).isHidden());
    await page.evaluate(()=>document.querySelector('#approve').click());
    assert.equal(await page.locator('#result').innerText(),'MOCK VERIFIED · 1 simulated write · 0 real writes');
    assert.equal(await page.locator('#findings tr').first().locator('td').nth(2).innerText(),'COMPLIANT');
    assert.equal(await page.locator('#findings tr').first().locator('td').nth(3).innerText(),'MANUAL');
    await page.getByRole('button',{name:'Toggle theme'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    if(process.argv[3])await page.screenshot({path:process.argv[3],fullPage:true});
    await page.getByRole('button',{name:'Toggle theme'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    await page.getByRole('button',{name:'Reset synthetic demo'}).click();
    assert.equal(await page.locator('#result').innerText(),'');
    assert(await page.getByRole('button',{name:'Preview Fix',exact:true}).isEnabled());
    await page.setViewportSize({width:390,height:844});
    assert(await page.getByRole('button',{name:'Explain',exact:true}).isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.equal(await page.locator('.architecture a').getAttribute('href'),'https://main.d2rar4n3w1jdwz.amplifyapp.com');
    assert.deepEqual(network,hosted?[target]:[]); assert.deepEqual(errors,[]);
    console.log(JSON.stringify({status:'PASS',mode:'MOCK SHOWCASE',offlineFileRender:!hosted,
      filters:['status','fixability','search'],manualFixDisabled:true,contextActions:true,
      rejectSimulatedWrites:0,approveSimulatedWrites:1,oneDecisionPerProposal:true,
      selectionClearsPendingProposal:true,
      separateReadbackAndCompliance:true,evidenceSteps:5,modelLabelsAndCostIndices:true,
      modelSelectionPreservesApproval:true,theme:['dark','light'],mobileWidth:390,
      unexpectedBrowserErrors:0,networkRequests:network.length,unexpectedNetworkRequests:0,
      realWrites:0,modelCalls:0},null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
