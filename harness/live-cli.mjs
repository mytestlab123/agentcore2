// The existing CLI channel uses the same live ComplianceBackend as the UI.
import { readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { LiveAgentCoreBackend, invokeViaCli } from '../packages/contracts/dist/index.js';

const statePath = process.argv[2];
if (!statePath) throw new Error('Usage: HARNESS_PYTHON=<venv-python> node harness/live-cli.mjs <private-state> [--reject]');
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const run = promisify(execFile);
const transport = async (method, args) => {
  const { stdout } = await run(process.env.HARNESS_PYTHON || 'python3', [
    fileURLToPath(new URL('./client.py', import.meta.url)), '--state', statePath,
    '--request', JSON.stringify({ method, args }),
  ], { maxBuffer: 1024 * 1024 });
  return JSON.parse(stdout);
};
const backend = new LiveAgentCoreBackend({ runtimeArn: state.harnessArn, modelId: state.modelId,
  sessionId: state.sessionId, toolId: 'inspect_s3_ssl', region: state.region }, transport);
const result = await invokeViaCli(backend, { findingId: 'issue3-ssl-canary', decision:
  process.argv.includes('--reject') ? 'REJECT' : 'APPROVE_ONCE', actorClass: 'lab-operator-cli' });
console.log(JSON.stringify(result).replace(/\b\d{12}\b/g, '<ACCOUNT_ID>'));
