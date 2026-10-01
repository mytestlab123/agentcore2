// Real public Preview B + real private bridge. No traces, screenshots or Nova.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.argv[2] || 'playwright');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
let stage='launch', observedErrors=0, observedMethods=[], errorKinds=[];
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.platform === 'win32' ? {executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'} : {})});
  try {
    const context = await browser.newContext();
    const url='https://main.d2rar4n3w1jdwz.amplifyapp.com';
    try { await context.grantPermissions(['local-network-access'],{origin:url}); } catch {}
    const page=await context.newPage();
    const errors=[], methods=[];
    page.on('pageerror',()=>{errors.push('pageerror');observedErrors++;errorKinds.push('page exception');});
    page.on('console',m=>{if(m.type()==='error'){errors.push('consoleerror');observedErrors++;errorKinds.push(m.location().url.endsWith('/favicon.ico')?'favicon resource':m.text().includes('Failed to load resource')?'resource load':'console exception');}});
    page.on('request',r=>{if(r.url()==='http://127.0.0.1:8443/' && r.method()==='POST'){
      const body=JSON.parse(r.postData());methods.push(body.method);observedMethods.push(body.method);
    }});
    stage='initial HTTP and MOCK';const response=await page.goto(url,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    assert.equal(await page.locator('.badge').innerText(),'MOCK');
    assert.equal(await page.getByRole('textbox',{name:'Bridge URL'}).inputValue(),'http://127.0.0.1:8443');
    assert.equal(errors.length,0);
    stage='token entry';await page.getByLabel('Bridge session token').fill(input.token);
    await page.getByRole('button',{name:'Connect LAB',exact:true}).click();
    stage='authenticated LIVE connection';await page.getByText('LIVE LAB connection active.',{exact:false}).waitFor();
    await page.waitForFunction(()=>document.querySelector('.badge')?.textContent==='LIVE LAB');
    stage='live UI shell';assert((await page.locator('body').innerText()).includes('Authenticated, but no live findings'));
    assert(!(await page.locator('body').innerText()).includes('Failed to fetch'));
    assert(await page.getByRole('combobox',{name:'Fixability filter'}).isVisible());
    assert(await page.getByText('Contextual Copilot',{exact:true}).isVisible());
    assert(await page.getByRole('columnheader',{name:'Fixability',exact:true}).isVisible());
    stage='theme';await page.getByRole('button',{name:'Toggle theme'}).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    assert(await page.getByRole('button',{name:'Inspect and explain SSL control'}).isDisabled());
    stage='errors, method allowlist and storage';assert.equal(errors.length,0);
    assert.deepEqual(methods,['readiness']);
    assert.equal(await page.evaluate(()=>Object.keys(localStorage).join(',')),'preview-b-theme');
    console.log(JSON.stringify({status:'PASS',previewHTTP:200,badgeTransition:'MOCK -> LIVE LAB',
      authenticatedReadiness:true,findingState:'NO_LIVE_FINDINGS',theme:true,fixability:true,contextualShell:true,
      unexpectedBrowserErrors:0,bridgeMethods:methods,novaInvocations:0,tokenArtifacts:'none',platform:process.platform}));
  } finally { input.token='';await browser.close(); }
})().catch(()=>{console.log(JSON.stringify({status:'FAIL',stage,unexpectedBrowserErrors:observedErrors,errorKinds,bridgeMethods:observedMethods}));process.exitCode=1;});
