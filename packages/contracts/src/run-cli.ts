/**
 * Headless entrypoint for the non-GUI channel (Issue #3, task 11).
 *
 * This is the actual runnable proof that the governed backend is reachable with
 * NO GUI and NO new infrastructure: `node dist/run-cli.js [--reject]`. It drives
 * the SAME `ComplianceBackend` seam the preview UI uses, via `invokeViaCli`,
 * against the MOCK backend (no cloud, no canary), and prints a secret-free,
 * auditable evidence line to stdout.
 *
 * Truthful mode: the printed `mode` is the backend's own (`MOCK` here). A wired
 * live adapter would print `LIVE_LAB`; this runner never fabricates it.
 *
 * Usage:
 *   node dist/run-cli.js            # APPROVE_ONCE (authorized) -> converged run
 *   node dist/run-cli.js --reject   # REJECT -> zero writes
 */

import { MockComplianceBackend } from "./mock-backend.js";
import { invokeViaCli, formatCliResult } from "./cli-channel.js";
import type { ApprovalDecision } from "./remediation.js";

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const decision: ApprovalDecision = argv.includes("--reject") ? "REJECT" : "APPROVE_ONCE";
  // MOCK backend, all targets authorized: proves the channel reaches a converged
  // governed run headlessly. Cloud/canary remain out of scope (none created).
  const backend = new MockComplianceBackend({ findingCount: 40, isAuthorizedTarget: () => true });
  const result = await invokeViaCli(backend, { decision, actorClass: "lab-operator-cli" });
  // eslint-disable-next-line no-console
  console.log(formatCliResult(result));
  return result.wrote || result.run.state === "REJECTED" ? 0 : 1;
}

// Run only when invoked directly (import.meta.url === entry), not when imported.
const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  import.meta.url === `file://${process.argv[1]}`;

if (invokedDirectly) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      // eslint-disable-next-line no-console
      console.error(`[non-gui:cli] error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(2);
    },
  );
}
