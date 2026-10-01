// Deterministic browser diagnostics; requests are intercepted, never forwarded.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const [status,expected] of [[401,'Authentication rejected'],[403,'Origin or host rejected'],[503,'Runtime preflight or server request failed'],[0,'Bridge unreachable or blocked by the browser']]){
  const page=await browser.newPage();
  await page.route('http://127.0.0.1:8443/**',async route=>{
   if(status===0)return route.abort();
   return route.fulfill({status:route.request().method()==='OPTIONS'?204:status,headers:{
    'Access-Control-Allow-Origin':'http://127.0.0.1:8011','Access-Control-Allow-Headers':'authorization,content-type',
    'Access-Control-Allow-Methods':'POST','Content-Type':'application/json'},body:route.request().method()==='OPTIONS'?'':JSON.stringify({error:'private/internal/path and raw server stack must not render'})});
  });
  await page.goto('http://127.0.0.1:8011',{waitUntil:'networkidle'});
  await page.getByLabel('Bridge session token').fill('synthetic-diagnostics-only');
  await page.getByRole('button',{name:'Connect LAB',exact:true}).click();
  await page.getByText(expected,{exact:false}).waitFor();
  const text=await page.locator('body').innerText();
  assert(!text.includes('Failed to fetch')&&!text.includes('private/internal/path'));
  assert.equal(await page.locator('.badge').innerText(),'MOCK');
  await page.close();
 }
 console.log(JSON.stringify({status:'PASS',diagnostics:['unreachable','authentication','origin/host','runtime preflight/server'],rawServerDetails:false,awsCalls:0}));
}finally{await browser.close();}})().catch(()=>{console.error('DIAGNOSTICS_FAILED');process.exitCode=1});
