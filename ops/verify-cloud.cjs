// Explicit lanes: fast checks never imply browser acceptance. No installs here.
const {spawnSync} = require('node:child_process');
const {existsSync} = require('node:fs');
const {join} = require('node:path');
const root = join(__dirname, '..');
process.chdir(root);
const lane = process.argv[2] || 'fast';
function fail(message) { console.error(message); process.exit(2); }
if (!['fast', 'browser'].includes(lane) || process.argv.length > 3)
  fail('Usage: npm run verify:cloud -- [fast|browser]');
if (Number(process.versions.node.split('.')[0]) < 20) fail('MISSING prerequisite: Node >=20');
function run(command, args) {
  const start = Date.now();
  const result = spawnSync(command, args, {cwd:root, stdio:'inherit'});
  console.log(`${command} ${args.join(' ')}: ${result.status === 0 ? 'PASS' : 'FAIL'} (${((Date.now()-start)/1000).toFixed(2)}s)`);
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status || 1);
}
if (lane === 'fast') {
  console.log('Browser smoke: SKIPPED (separate browser lane required).');
  if (!existsSync(join(root, 'node_modules/typescript/bin/tsc')))
    fail('MISSING prerequisite: run npm ci at the repository root; no install was attempted.');
  run('python3', ['--version']);
  for (const name of ['build', 'test', 'typecheck']) run('npm', ['run', name]);
  run(process.execPath, ['showcases/chatgpt-sites-preview-b/check-state.cjs']);
} else {
  const modulePath = join(root, 'tools/browser/node_modules/playwright-core');
  if (!existsSync(join(modulePath, 'package.json')))
    fail('MISSING prerequisite: npm ci --prefix tools/browser, then install its matching Chromium; see docs/dot-cloud-pilot.md.');
  const expected = require('../tools/browser/package.json').dependencies['playwright-core'];
  if (require(join(modulePath, 'package.json')).version !== expected)
    fail('MISMATCH: browser tooling must match tools/browser/package.json.');
  if (process.env.SHOWCASE_BROWSER) fail('Custom SHOWCASE_BROWSER is not supported by this pinned verification lane.');
  if (!existsSync(require(modulePath).chromium.executablePath()))
    fail('MISSING prerequisite: matching Chromium is not installed. Browser smoke NOT_RUN.');
  run(process.execPath, ['showcases/chatgpt-sites-preview-b/smoke.cjs', modulePath]);
}
console.log(`PASS: ${lane} lane only.`);
