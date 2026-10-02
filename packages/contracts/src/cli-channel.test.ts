/**
 * Non-GUI channel governance proof (Issue #3, task 11).
 *
 * Proves that a headless (CLI/SDK) caller driving the SAME `ComplianceBackend`
 * seam is bound by the SAME governance the GUI is — no bypass is possible,
 * because both channels funnel through `backend.execute`:
 *
 *   - APPROVE_ONCE on an authorized target => one converged, zero-new-infra
 *     remediation with SEPARATE provider + compliance readback (the happy path).
 *   - REJECT over the CLI => ZERO writes (decision-scope reject-zero-write).
 *   - APPROVE_ONCE against an UNAUTHORIZED target (not the Issue #3 canary)
 *     => ZERO writes (target-scope reject-zero-write) — reusing the SAME
 *     canary-ownership guard task 10 proved for the GUI.
 *   - The run is durable/resumable by runId (same evidence model as the GUI).
 *   - Truthful mode: the CLI reports the backend's mode (MOCK here), never a
 *     synthesized LIVE.
 *   - The CLI refuses to invent a target when no finding matches.
 *
 * No new backend, no new canary, no cloud: the SAME bounded canary/remediation
 * capability and the SAME evidence model as tasks 8/10 are reused.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { MockComplianceBackend } from "./mock-backend.js";
import { invokeViaCli, formatCliResult, NoMatchingFindingError } from "./cli-channel.js";
import type { ResourceRef } from "./finding.js";
import type { RemediationProposal } from "./remediation.js";

const FIXED_CLOCK = () => "2026-09-30T19:41:00.000Z";

// The SAME exact-ownership guard task 10 uses: only the tagged, disposable,
// Issue #3-owned canary is an authorized write target.
const ISSUE3_CANARY_ID =
  "issue3-canary-disposable-20260930193359-000000000000-ap-southeast-1";

function isIssue3Canary(target: ResourceRef, _proposal: RemediationProposal): boolean {
  return (
    target.id === ISSUE3_CANARY_ID &&
    target.tags?.Project === "issue-3" &&
    target.tags?.Disposable === "true"
  );
}

test("non-GUI APPROVE_ONCE (authorized) converges with SEPARATE provider + compliance readback", async () => {
  // Authorize all targets so the governed happy path runs; proves the channel's
  // shape end to end (same as GUI), including truthful mode.
  const be = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK, isAuthorizedTarget: () => true });
  const result = await invokeViaCli(be, { decision: "APPROVE_ONCE", actorClass: "lab-operator-cli" });

  assert.equal(result.channel, "cli");
  assert.equal(result.mode, "MOCK", "CLI reports the backend's truthful mode, never a synthesized LIVE");
  assert.equal(result.run.state, "VERIFIED");
  assert.equal(result.wrote, true);
  assert.ok(result.run.providerExecutionId, "a converged run carries a provider execution id");

  const kinds = result.run.evidence.map((e) => e.kind);
  const providerIdx = kinds.indexOf("PROVIDER_READBACK");
  const complianceIdx = kinds.indexOf("COMPLIANCE_READBACK");
  assert.ok(providerIdx >= 0 && complianceIdx >= 0, "both readbacks present");
  assert.ok(providerIdx < complianceIdx, "provider readback precedes compliance convergence, as a distinct entry");

  // Durable/resumable by the same runId handle the GUI would use.
  const resumed = await be.getRun(result.run.runId);
  assert.equal(resumed?.runId, result.run.runId);
});

test("non-GUI REJECT => ZERO writes (decision-scope reject-zero-write)", async () => {
  const be = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK, isAuthorizedTarget: () => true });
  const result = await invokeViaCli(be, { decision: "REJECT", actorClass: "lab-operator-cli" });

  assert.equal(result.run.state, "REJECTED");
  assert.equal(result.wrote, false);
  assert.ok(!result.run.providerExecutionId, "a REJECT over the CLI must carry no provider execution id");
  assert.ok(result.run.evidence.some((e) => /zero writes/i.test(e.summary)));
});

test("non-GUI APPROVE_ONCE against an UNAUTHORIZED target => ZERO writes (same canary guard as GUI)", async () => {
  // Guard authorizes ONLY the exact canary; the fixture finding targets a
  // different bucket, so even a valid APPROVE_ONCE must not write.
  const be = new MockComplianceBackend({
    findingCount: 40,
    clock: FIXED_CLOCK,
    isAuthorizedTarget: isIssue3Canary,
  });
  const result = await invokeViaCli(be, { decision: "APPROVE_ONCE", actorClass: "lab-operator-cli" });

  assert.equal(result.run.state, "REJECTED", "unauthorized target must not execute over the CLI either");
  assert.equal(result.wrote, false);
  assert.ok(!result.run.providerExecutionId, "refused target => no provider execution id");
  assert.ok(
    result.run.evidence.every(
      (e) => e.kind !== "EXECUTION" && e.kind !== "PROVIDER_READBACK" && e.kind !== "COMPLIANCE_READBACK",
    ),
    "no execution / readback / convergence evidence for a refused target",
  );
  assert.ok(result.run.evidence.some((e) => /not authorized/i.test(e.summary)));
});

test("non-GUI channel refuses to invent a target when no finding matches", async () => {
  const be = new MockComplianceBackend({ findingCount: 0, clock: FIXED_CLOCK });
  await assert.rejects(
    () => invokeViaCli(be, { decision: "APPROVE_ONCE", actorClass: "lab-operator-cli" }),
    NoMatchingFindingError,
  );
});

test("formatCliResult is a secret-free, auditable one-liner", async () => {
  const be = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK, isAuthorizedTarget: () => true });
  const result = await invokeViaCli(be, { decision: "APPROVE_ONCE", actorClass: "lab-operator-cli" });
  const line = formatCliResult(result);
  assert.match(line, /\[non-gui:cli\] mode=MOCK/);
  assert.match(line, /state=VERIFIED wrote=true/);
  assert.match(line, /evidence=PROPOSAL>APPROVAL>EXECUTION>PROVIDER_READBACK>COMPLIANCE_READBACK/);
  assert.doesNotMatch(line, /secret|password|token|AKIA/i);
});
