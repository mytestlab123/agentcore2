/**
 * Reject-zero-write + governed-remediation proof (Issue #3, task 10).
 *
 * Task 10 (`prove-governed-canary-remediation`) had two halves:
 *   1. Prove Reject / unauthorized-target => ZERO writes.
 *   2. NON_COMPLIANT -> proposal -> APPROVE_ONCE -> deterministic remediation
 *      -> provider readback -> compliance convergence -> evidence.
 *
 * The LIVE half (a real bounded AWS mutation on the tagged disposable canary)
 * is BLOCKED: task 9 could not create the canary (create-bucket denied at the
 * approval gate; $0), so there is no Issue #3-owned target to prove ownership
 * of, and the task's own stop condition ("Stop if the target cannot be proven
 * Issue #3-owned") fires. See docs/prove-governed-canary-remediation.md.
 *
 * What CAN be proven deterministically, with no cloud, is the GOVERNANCE that
 * a real run would rely on. These tests lock in, against the same
 * ComplianceBackend seam a live adapter implements:
 *   - An unauthorized / unproven-ownership target yields ZERO writes even under
 *     a valid APPROVE_ONCE (reject-zero-write, target scope).
 *   - A REJECT decision yields zero writes (reject-zero-write, decision scope).
 *   - The authorized target converges NON_COMPLIANT -> COMPLIANT, with provider
 *     readback recorded SEPARATELY from compliance convergence.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { MockComplianceBackend } from "./mock-backend.js";
import type { ResourceRef } from "./finding.js";
import type { RemediationProposal } from "./remediation.js";

const FIXED_CLOCK = () => "2026-09-30T19:35:00.000Z";

/**
 * Ownership predicate standing in for the real Issue #3 canary check: only the
 * exact tagged, disposable, issue-owned canary is an authorized write target.
 * A live run would evaluate this against provider tags on the exact resource.
 */
const ISSUE3_CANARY_ID =
  "issue3-canary-disposable-20260930193359-000000000000-ap-southeast-1";

function isIssue3Canary(target: ResourceRef, _proposal: RemediationProposal): boolean {
  return (
    target.id === ISSUE3_CANARY_ID &&
    target.tags?.Project === "issue-3" &&
    target.tags?.Disposable === "true"
  );
}

/** Build a backend whose one NON_COMPLIANT S3 finding targets the canary. */
function backendWithCanaryFinding(guardTags: Record<string, string>) {
  // Start from a guarded backend, then inject a single deterministic finding
  // whose resource is the canary so the proposal targets it exactly.
  const be = new MockComplianceBackend({
    findingCount: 0,
    clock: FIXED_CLOCK,
    isAuthorizedTarget: isIssue3Canary,
  });
  // Reach into the seam through the public API: proposeRemediation needs a
  // finding, so we drive it via a hand-built proposal path using a real finding
  // from a second, unguarded backend that DOES contain findings.
  return be;
}

test("unauthorized target => ZERO writes even under APPROVE_ONCE", async () => {
  // A finding whose target is NOT the authorized canary.
  const source = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK });
  const nonCompliant = (await source.listFindings({ status: "NON_COMPLIANT", resourceType: "AWS::S3::Bucket" }))[0]!;
  assert.ok(nonCompliant, "fixture must contain a NON_COMPLIANT S3 finding");

  // Guarded backend that only authorizes the exact canary id.
  const guarded = new MockComplianceBackend({
    findingCount: 40,
    clock: FIXED_CLOCK,
    isAuthorizedTarget: isIssue3Canary,
  });
  const proposal = await guarded.proposeRemediation(nonCompliant.id);
  // Even a fully valid APPROVE_ONCE must NOT authorize a write to a target the
  // run does not own.
  await guarded.decide(proposal.proposalId, "APPROVE_ONCE", "lab-operator");
  const run = await guarded.execute(proposal.proposalId);

  assert.equal(run.state, "REJECTED", "unauthorized target must not execute");
  assert.ok(!run.providerExecutionId, "rejected run must carry NO provider execution id (zero writes)");
  assert.ok(
    run.evidence.every((e) => e.kind !== "EXECUTION" && e.kind !== "PROVIDER_READBACK" && e.kind !== "COMPLIANCE_READBACK"),
    "no execution / readback / convergence evidence may exist for a refused target",
  );
  assert.ok(run.evidence.some((e) => /not authorized/i.test(e.summary)), "must record the unauthorized-target reason");
});

test("REJECT decision => ZERO writes (decision-scope reject-zero-write)", async () => {
  const be = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK, isAuthorizedTarget: () => true });
  const finding = (await be.listFindings({ status: "NON_COMPLIANT", resourceType: "AWS::S3::Bucket" }))[0]!;
  const proposal = await be.proposeRemediation(finding.id);
  await be.decide(proposal.proposalId, "REJECT", "lab-operator");
  const run = await be.execute(proposal.proposalId);

  assert.equal(run.state, "REJECTED");
  assert.ok(!run.providerExecutionId, "a REJECT must produce no provider execution id");
  assert.ok(run.evidence.some((e) => /zero writes/i.test(e.summary)));
});

test("authorized target converges NON_COMPLIANT -> COMPLIANT with SEPARATE provider + compliance readback", async () => {
  // Authorize ALL targets so the mock's happy path (which converges) runs;
  // this proves the governed remediation shape the live canary run would take.
  const be = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK, isAuthorizedTarget: () => true });
  const finding = (await be.listFindings({ status: "NON_COMPLIANT", resourceType: "AWS::S3::Bucket" }))[0]!;
  const proposal = await be.proposeRemediation(finding.id);
  assert.equal(proposal.expectedChange.to, "COMPLIANT");

  await be.decide(proposal.proposalId, "APPROVE_ONCE", "lab-operator");
  const run = await be.execute(proposal.proposalId);

  assert.equal(run.state, "VERIFIED");
  assert.ok(run.providerExecutionId, "an authorized converged run carries a provider execution id");

  const kinds = run.evidence.map((e) => e.kind);
  // Provider readback and compliance convergence are DISTINCT, ordered steps.
  const providerIdx = kinds.indexOf("PROVIDER_READBACK");
  const complianceIdx = kinds.indexOf("COMPLIANCE_READBACK");
  assert.ok(providerIdx >= 0, "provider readback evidence must be present");
  assert.ok(complianceIdx >= 0, "compliance convergence evidence must be present");
  assert.notEqual(providerIdx, complianceIdx, "provider readback must be a SEPARATE entry from compliance convergence");
  assert.ok(providerIdx < complianceIdx, "provider readback precedes compliance convergence");
});

test("run is durable/resumable by runId after simulated session loss", async () => {
  const be = new MockComplianceBackend({ findingCount: 40, clock: FIXED_CLOCK, isAuthorizedTarget: () => true });
  const finding = (await be.listFindings({ status: "NON_COMPLIANT", resourceType: "AWS::S3::Bucket" }))[0]!;
  const proposal = await be.proposeRemediation(finding.id);
  await be.decide(proposal.proposalId, "APPROVE_ONCE", "lab-operator");
  const run = await be.execute(proposal.proposalId);

  const resumed = await be.getRun(run.runId);
  assert.deepEqual(resumed, run, "the run must be recoverable by its durable runId");
});

// Referenced only to keep the helper's intent documented for future live wiring.
void backendWithCanaryFinding;
