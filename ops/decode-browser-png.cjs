// Reuse pngjs already bundled in the pinned Playwright tool; no image package install.
const fs = require('node:fs');
const path = require('node:path');
const modulePath = process.env.SHOWCASE_PLAYWRIGHT_MODULE ||
  path.join(__dirname, '../tools/browser/node_modules/playwright-core');
try {
  const {PNG} = require(path.join(modulePath, 'lib/utilsBundle.js'));
  const decoded = PNG.sync.read(fs.readFileSync(0), {checkCRC:true});
  if (decoded.data.length !== decoded.width * decoded.height * 4) throw new Error();
  process.stdout.write(`${decoded.width} ${decoded.height}`);
} catch {
  process.stderr.write('PNG decode failed or existing Playwright decoder unavailable\n');
  process.exitCode = 1;
}
