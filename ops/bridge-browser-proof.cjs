// Native Windows Chromium proof through the encrypted SSH local forward.
// Token comes only from stdin; never arguments, storage, traces or screenshots.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.argv[2] || process.env.PLAYWRIGHT_MODULE || 'playwright');
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
(async () => {
  assert.equal(process.platform, 'win32');
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  try {
    const context = await browser.newContext();
    try { await context.grantPermissions(['local-network-access'], { origin: input.url }); } catch { /* Browser versions differ. No security flags are disabled. */ }
    const page = await context.newPage();
    const response = await page.goto(input.url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.equal(await page.getByRole('textbox', { name: 'Bridge URL' }).inputValue(), 'http://127.0.0.1:8443');
    // Authentication/read-only runtime evidence only. No deleted-canary RPC,
    // model inference, remediation, or backend switch is performed.
    const result = await page.evaluate(async token => {
      const r = await fetch('http://127.0.0.1:8443', { method: 'POST', headers: {
        'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ method: 'evidence' }) });
      const data = await r.json();
      return { status: r.status, region: data.region, modelId: data.modelId, hasRuntime: !!data.runtimeArn, hasSession: !!data.sessionId, error: data.error };
    }, input.token);
    assert.equal(result.status, 200);
    assert.equal(result.region, 'ap-southeast-1');
    assert.equal(result.modelId, 'apac.amazon.nova-lite-v1:0');
    assert(result.hasRuntime && result.hasSession);
    console.log(JSON.stringify({ status: 'PASS', platform: process.platform, browser: 'native Windows Chrome',
      previewHTTP: 200, authenticatedBridgeHTTP: result.status, browserBridgeURL: 'http://127.0.0.1:8443',
      transport: 'Windows SSH local forward to Dell loopback :8703', modelInvocations: 0,
      remediationCalls: 0, tokenArtifacts: 'none' }));
  } finally { input.token = ''; await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
