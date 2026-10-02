// Bounded real-browser proof. No traces/videos: the private token never becomes
// an artifact. The temporary loopback bridge is stopped in finally.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const statePath = process.argv[2];
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const root = path.resolve(__dirname, '..');
const tokenPath = path.join(path.dirname(statePath), 'gui-proof-token');
const token = crypto.randomBytes(32).toString('hex');
fs.writeFileSync(tokenPath, token, { mode: 0o600, flag: 'wx' });
const bridge = spawn(process.env.HARNESS_PYTHON || 'python3', [path.join(root, 'harness/bridge.py'), '--state', statePath, '--token-file', tokenPath], { stdio: 'ignore' });
let browser;
(async () => {
  try {
    // Exercise rejection before any provider operation or model invocation.
    await new Promise(resolve => setTimeout(resolve, 500));
    const origin = state.apps.a.url;
    const anonymous = await fetch('http://127.0.0.1:8703', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'execute', args: ['untrusted-synthetic'] }) });
    const foreign = await fetch('http://127.0.0.1:8703', { method: 'POST', headers: { Origin: 'https://unregistered.invalid', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'execute', args: ['untrusted-synthetic'] }) });
    const model = await fetch('http://127.0.0.1:8703', { method: 'POST', headers: { Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'model_tool', modelId: 'unregistered-model' }) });
    if (anonymous.status !== 401 || foreign.status !== 403 || model.status !== 400) throw Error('Private operator/model guards failed');
    const guardProof = { anonymousMutation: anonymous.status, foreignOrigin: foreign.status, unregisteredModel: model.status, status: 'PASS' };
    fs.writeFileSync(path.join(path.dirname(statePath), 'bridge-guard-proof.json'), JSON.stringify(guardProof, null, 2), { mode: 0o600 });
    if (process.argv.includes('--guards-only')) { console.log(JSON.stringify(guardProof)); return; }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    try { await context.grantPermissions(['local-network-access']); } catch { /* older Chromium needs no grant */ }
    const output = [];
    for (const label of ['a', 'b', 'c']) {
      const page = await context.newPage();
      await page.goto(state.apps[label].url, { waitUntil: 'networkidle' });
      const select = page.getByRole('combobox', { name: 'Explanation model' });
      const options = await select.locator('option').allTextContents();
      if (options.length !== 3 || !options[0].includes('1.0x') || !options[1].includes('1.7x') || !options[2].includes('8.7x')) throw Error('Three-model input-cost selector is incorrect');
      if (!(await page.locator('.badge').innerText()).includes('MOCK')) throw Error('Initial mode must be MOCK');
      await page.getByPlaceholder('Private operator bridge session token').fill(token);
      await page.getByRole('button', { name: 'Connect LAB' }).click();
      await page.getByText('LIVE LAB connection active.', { exact: false }).waitFor();
      await page.waitForFunction(() => document.querySelector('.badge')?.textContent?.includes('LIVE LAB'));
      // One model proof through the actual picker/bridge, not three extra calls.
      if (label === 'a') {
        await page.getByRole('button', { name: 'Inspect and explain SSL control' }).click();
        await page.waitForFunction(() => document.querySelector('pre')?.textContent?.includes('"mode": "LIVE_LAB"'), { timeout: 90000 });
        const result = JSON.parse(await page.locator('pre').first().innerText());
        if (result.modelId !== 'apac.amazon.nova-lite-v1:0' || result.tools[0].result.status !== 'COMPLIANT') throw Error('Actual GUI model/tool proof incomplete');
        output.push({ preview: label, options, modelId: result.modelId, sessionId: result.sessionId, traceId: result.traceId, status: 'PASS' });
      } else output.push({ preview: label, options, authenticatedBackend: true, status: 'PASS' });
      await page.close();
    }
    fs.writeFileSync(path.join(path.dirname(statePath), 'gui-proof.json'), JSON.stringify(output, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(output));
  } finally {
    if (browser) await browser.close();
    bridge.kill('SIGTERM');
    fs.unlinkSync(tokenPath); // Exactly the ephemeral credential this script created.
  }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
