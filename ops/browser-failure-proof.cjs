// A fixture failure is expected; any missing/unsafe evidence still fails this command.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.join(__dirname, '..');
const modulePath = path.join(root, 'tools/browser/node_modules/playwright-core');
const expected = require('../tools/browser/package.json').dependencies['playwright-core'];
assert.equal(require(path.join(modulePath, 'package.json')).version, expected);
const executable = require(modulePath).chromium.executablePath();
assert(fs.existsSync(executable), 'Matching Chromium must already be installed');
// Fresh output: never validate or publish files left by an earlier execution.
const output = path.join(root, 'artifacts/showcase/expected-failure');
fs.mkdirSync(path.dirname(output), {recursive:true});
fs.mkdirSync(output, {recursive:false});
const privateHome = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-fixture-home-'));
const sentinel = 'ISSUE12_SYNTHETIC_PRIVATE_SENTINEL_DO_NOT_PUBLISH';
process.env.SHOWCASE_PRIVATE_SESSION = sentinel;
const result = spawnSync(process.execPath,
  [path.join(root, 'showcases/chatgpt-sites-preview-b/smoke.cjs'), modulePath], {
    cwd:root, encoding:'utf8', timeout:60000,
    // Do not forward runner tokens, credential variables or a persisted browser profile.
    env:{PATH:process.env.PATH, HOME:privateHome, TMPDIR:privateHome,
      SHOWCASE_ARTIFACTS:output, SHOWCASE_BROWSER:executable,
      SHOWCASE_FAILURE_FIXTURE:'capture-v1'}
  });
assert.equal(result.error, undefined, 'Fixture subprocess must finish normally');
assert.equal(result.signal, null);
assert.equal(result.status, 1, 'Fixture must remain a failing smoke process');
assert(result.stderr.includes('SHOWCASE_EXPECTED_FAILURE_CAPTURE_V1'), 'Wrong failure');
assert(!result.stdout.includes('"status": "PASS"'), 'Fixture cannot claim smoke PASS');
assert(!(result.stdout + result.stderr).includes(sentinel), 'Private sentinel leaked to logs');
const checked = spawnSync('python3', [path.join(__dirname, 'verify-browser-failure.py'), output],
  {cwd:root, encoding:'utf8', timeout:30000});
assert.equal(checked.status, 0, 'Artifact content verification failed; do not publish');
process.stdout.write(checked.stdout);
console.log('PASS: expected fixture exit 1; artifact guards passed.');
