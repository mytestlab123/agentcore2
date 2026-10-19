import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFile, lstat, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releasePath = 'showcases/chatgpt-sites-preview-b/RELEASE.json';
const sourcePath = 'showcases/chatgpt-sites-preview-b/index.html';
const workerModulePath = 'ops/issue42-cloudflare-worker.mjs';
const assetDir = resolve(root, '.wrangler/issue42-static-assets');
const receiptPath = resolve(root, '.wrangler/issue42-release-receipt.json');
const moduleDir = resolve(root, '.wrangler/issue42-module-version');
const moduleReceiptPath = resolve(root, '.wrangler/issue42-module-release-receipt.json');
const assetAllowlist = Object.freeze([{ source: sourcePath, path: 'index.html' }]);
const outputAllowlist = Object.freeze(['index.html']);
const moduleOutputAllowlist = Object.freeze(['index.html', 'request.json', 'worker.mjs']);
const packageSourcePaths = Object.freeze([sourcePath, releasePath, workerModulePath, 'ops/package-cloudflare-release.mjs', 'wrangler.jsonc']);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const refuse = message => { throw new Error(message); };

async function regularFile(path) {
  try {
    const stat = await lstat(path);
    if (!stat.isFile() || stat.isSymbolicLink()) refuse('Package path is not a regular file.');
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function directoryEntries(path) {
  try {
    const stat = await lstat(path);
    if (!stat.isDirectory() || stat.isSymbolicLink()) refuse('Package output is not a plain directory.');
    return await readdir(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function atomicWrite(path, bytes) {
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
  await rename(temporary, path);
}

const release = JSON.parse(await readFile(resolve(root, releasePath), 'utf8'));
const source = await readFile(resolve(root, sourcePath));
const workerModule = await readFile(resolve(root, workerModulePath));
const html = source.toString('utf8');
const htmlHash = sha256(source);
execFileSync('git', ['ls-files', '--error-unmatch', '--', ...packageSourcePaths], { cwd: root, stdio: 'ignore' });
execFileSync('git', ['diff', '--quiet', 'HEAD', '--', ...packageSourcePaths], { cwd: root, stdio: 'ignore' });
const embedded = [...html.matchAll(/const RELEASE='([^']+)',BUILD_FINGERPRINT='([a-f0-9]{64})'/g)];
if (embedded.length !== 1 || embedded[0][1] !== release.release || embedded[0][2] !== release.guiSourceFingerprint || htmlHash !== release.htmlSha256) {
  refuse('Accepted release metadata does not match the standalone HTML.');
}
const embeddedFingerprint = embedded[0][2];
const unsignedHtml = html.replace(embeddedFingerprint, '__FINGERPRINT__');
if (sha256(unsignedHtml) !== release.guiSourceFingerprint || unsignedHtml === html) {
  refuse('The standalone HTML fingerprint does not match the release receipt.');
}

const configBytes = await readFile(resolve(root, 'wrangler.jsonc'));
const config = JSON.parse(configBytes.toString('utf8'));
if (JSON.stringify(Object.keys(config).sort()) !== JSON.stringify(['assets', 'compatibility_date', 'name', 'preview_urls', 'workers_dev']) || JSON.stringify(Object.keys(config.assets || {}).sort()) !== JSON.stringify(['directory', 'run_worker_first']) || config.name !== 'agentic-operations-lab' || config.assets.directory !== './.wrangler/issue42-static-assets' || config.workers_dev !== false || config.preview_urls !== false || config.assets.run_worker_first !== false) {
  refuse('Worker config is not the expected unrouted private staging config.');
}

const wrapperDir = resolve(root, '.wrangler');
const wrapperStat = await directoryEntries(wrapperDir);
if (wrapperStat === null) await mkdir(wrapperDir, { mode: 0o700 });
const priorReceiptExists = await regularFile(receiptPath);
if (priorReceiptExists) {
  const prior = JSON.parse(await readFile(receiptPath, 'utf8'));
  if (prior.schemaVersion !== 'agentcore2.cloudflare-static-source-package/1' || prior.assetDirectory !== './.wrangler/issue42-static-assets' || JSON.stringify(prior.outputAllowlist) !== JSON.stringify(outputAllowlist)) {
    refuse('Existing package receipt does not identify this generated output.');
  }
}

const existing = await directoryEntries(assetDir);
if (existing === null) await mkdir(assetDir, { mode: 0o700 });
else if (JSON.stringify(existing.sort()) !== JSON.stringify(outputAllowlist)) refuse('Package directory contains files outside its one-file allowlist.');
const existingHtml = resolve(assetDir, 'index.html');
if (await regularFile(existingHtml)) {
  if (!priorReceiptExists) refuse('Existing unreceipted package file will not be replaced.');
  const oldBytes = await readFile(existingHtml);
  if (!oldBytes.equals(source)) await atomicWrite(existingHtml, source);
} else {
  await copyFile(resolve(root, sourcePath), existingHtml);
}

const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (!/^[a-f0-9]{40}$/.test(sourceRevision)) refuse('Could not identify the source revision.');
const assets = [{ path: 'index.html', sha256: htmlHash, bytes: source.byteLength }];
const packageSha256 = sha256(Buffer.from(JSON.stringify(assets)));
const receipt = {
  schemaVersion: 'agentcore2.cloudflare-static-source-package/1',
  status: 'SOURCE_PACKAGE_ONLY_NOT_DEPLOYED',
  sourceRevision,
  sourceRelease: release.release,
  sourceFingerprint: release.guiSourceFingerprint,
  sourceHtmlSha256: htmlHash,
  workerConfigSha256: sha256(configBytes),
  assetDirectory: './.wrangler/issue42-static-assets',
  assetAllowlist,
  outputAllowlist,
  assets,
  packageSha256,
  workerName: config.name,
  workerNameStatus: 'PROPOSED_NOT_OWNER_VERIFIED',
  accountStatus: 'OWNER_ACCOUNT_NOT_VERIFIED',
  accessStatus: 'PRIVATE_ACCESS_NOT_CONFIGURED_OR_VERIFIED',
  routes: [],
  workersDev: false,
  previewUrls: false
};
await atomicWrite(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

const workerModuleHash = sha256(workerModule);
const moduleRequest = {
  compatibility_date: config.compatibility_date,
  main_module: 'worker.mjs',
  modules: [
    {
      name: 'worker.mjs',
      content_type: 'application/javascript+module',
      content_base64: workerModule.toString('base64')
    },
    {
      name: 'index.html',
      content_type: 'text/plain',
      content_base64: source.toString('base64')
    }
  ]
};
const moduleRequestBytes = Buffer.from(`${JSON.stringify(moduleRequest, null, 2)}\n`);
const moduleRequestHash = sha256(moduleRequestBytes);
const existingModuleEntries = await directoryEntries(moduleDir);
const priorModuleReceiptExists = await regularFile(moduleReceiptPath);
if (priorModuleReceiptExists) {
  const priorModuleReceipt = JSON.parse(await readFile(moduleReceiptPath, 'utf8'));
  if (priorModuleReceipt.schemaVersion !== 'agentcore2.cloudflare-module-version-package/1' || priorModuleReceipt.packageDirectory !== './.wrangler/issue42-module-version' || JSON.stringify(priorModuleReceipt.outputAllowlist) !== JSON.stringify([...moduleOutputAllowlist])) {
    refuse('Existing module package receipt does not identify this generated output.');
  }
}
if (existingModuleEntries === null) await mkdir(moduleDir, { mode: 0o700 });
else {
  if (JSON.stringify(existingModuleEntries.sort()) !== JSON.stringify([...moduleOutputAllowlist].sort())) {
    refuse('Module version package contains files outside its three-file allowlist.');
  }
  if (!priorModuleReceiptExists) refuse('Existing unreceipted module package will not be replaced.');
}

for (const [name, bytes] of [['index.html', source], ['worker.mjs', workerModule], ['request.json', moduleRequestBytes]]) {
  const outputPath = resolve(moduleDir, name);
  if (await regularFile(outputPath)) {
    if (!priorModuleReceiptExists) refuse('Existing unreceipted module package file will not be replaced.');
    if (!(await readFile(outputPath)).equals(bytes)) await atomicWrite(outputPath, bytes);
  } else {
    await atomicWrite(outputPath, bytes);
  }
}

const moduleReceipt = {
  schemaVersion: 'agentcore2.cloudflare-module-version-package/1',
  status: 'SOURCE_PACKAGE_ONLY_NOT_DEPLOYED',
  sourceRevision,
  sourceRelease: release.release,
  sourceFingerprint: release.guiSourceFingerprint,
  sourceHtmlSha256: htmlHash,
  workerModuleSha256: workerModuleHash,
  workerConfigSha256: sha256(configBytes),
  packageDirectory: './.wrangler/issue42-module-version',
  outputAllowlist: moduleOutputAllowlist,
  versionUpload: {
    method: 'POST',
    endpoint: '/accounts/{account_id}/workers/workers/{worker_id}/versions',
    bodyFile: 'request.json',
    createsVersionOnly: true,
    deploysVersion: false
  },
  modules: [
    { name: 'worker.mjs', contentType: 'application/javascript+module', sha256: workerModuleHash, bytes: workerModule.byteLength },
    { name: 'index.html', contentType: 'text/plain', sha256: htmlHash, bytes: source.byteLength }
  ],
  requestSha256: moduleRequestHash,
  workerName: config.name,
  workersDev: false,
  previewUrls: false
};
await atomicWrite(moduleReceiptPath, `${JSON.stringify(moduleReceipt, null, 2)}\n`);
console.log(JSON.stringify({ status: receipt.status, sourceRevision, sourceRelease: release.release, sourceFingerprint: release.guiSourceFingerprint, sourceHtmlSha256: htmlHash, assetAllowlist: ['index.html'], packageSha256, receiptPath: '.wrangler/issue42-release-receipt.json', moduleStatus: moduleReceipt.status, workerModuleSha256: workerModuleHash, moduleRequestSha256: moduleRequestHash, modulePath: '.wrangler/issue42-module-version/request.json', moduleReceiptPath: '.wrangler/issue42-module-release-receipt.json' }));
