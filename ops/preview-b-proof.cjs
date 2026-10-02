// Repo-owned MOCK UI proof; no AWS, token, trace, or storage export.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const response = await page.goto(process.argv[2], { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.locator('tbody tr').first().waitFor();
    assert.equal(await page.locator('.badge').innerText(), 'MOCK');
    const models = await page.getByRole('combobox', { name: 'Explanation model' }).locator('option').allTextContents();
    assert.deepEqual(models, ['Nova Micro — Economy — 1.0x · APAC', 'Nova Lite — Default — 1.7x · APAC', 'Nova 2 Lite — Enhanced — 8.7x · Global']);
    assert.equal(await page.getByRole('textbox', { name: 'Bridge URL' }).inputValue(), 'http://127.0.0.1:8443');
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    const darkBackground = await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor);
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.notEqual(await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor), darkBackground);
    const fix = page.getByRole('combobox', { name: 'Fixability filter' });
    await fix.selectOption('MANUAL');
    assert((await page.locator('tbody tr td:last-child').allTextContents()).every(t => t === 'MANUAL'));
    assert(await page.locator('tbody tr').count() > 0);
    await page.locator('.finding-link').first().click();
    await page.getByRole('region', { name: 'Remediation summary' }).waitFor();
    assert(await page.getByRole('button', { name: 'Preview Fix', exact: true }).isDisabled());
    await page.getByRole('combobox', { name: 'Status filter' }).selectOption('COMPLIANT');
    await fix.selectOption('AUTOMATED');
    assert.equal(await page.locator('tbody tr').count(), 0); // Capability alone is not AUTOMATED.
    await page.getByRole('combobox', { name: 'Status filter' }).selectOption('NON_COMPLIANT');
    assert((await page.locator('tbody tr td:last-child').allTextContents()).every(t => t === 'AUTOMATED'));
    await page.getByRole('textbox', { name: 'Search findings' }).fill('S3 bucket allows non-SSL');
    assert(await page.locator('tbody tr').count() > 0);
    await page.locator('.finding-link').first().click();
    await page.getByRole('button', { name: 'Preview Fix', exact: true }).click();
    await page.getByRole('button', { name: 'Reject', exact: true }).click();
    const timeline = page.getByRole('region', { name: 'Evidence timeline' });
    await timeline.waitFor();
    assert((await timeline.innerText()).includes('Zero writes performed'));
    assert.equal(await timeline.locator('.absent').count(), 5);
    await page.getByRole('button', { name: 'Preview Fix', exact: true }).click();
    await page.getByRole('button', { name: 'Approve Once', exact: true }).click();
    await timeline.waitFor();
    assert.equal(await timeline.locator('.absent').count(), 0);
    assert.equal(await timeline.locator('ol > li').count(), 5);
    assert((await timeline.innerText()).includes('NON_COMPLIANT -> COMPLIANT (mock)'));
    assert.equal(await page.evaluate(() => Object.keys(localStorage).join(',')), 'preview-b-theme');
    console.log(JSON.stringify({ status: 'PASS', http: 200, themeToggleAndPersistence: true,
      manualAndAutomatedFilters: true, compliantNotAutomated: true, contextualSummary: true,
      rejectedAbsentSteps: 5, approvedRecordedSteps: 5, timelineMode: 'MOCK', models,
      tokenStorage: 'none', awsCalls: 0 }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
