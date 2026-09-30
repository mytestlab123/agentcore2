/**
 * Truthful-mode invariant tests for the live wiring seam (Issue #3, task 8).
 *
 * These lock in the property that a live badge can NEVER appear over an unwired
 * or partially-wired adapter, and that the default wiring falls back to MOCK.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LiveAgentCoreBackend,
  RuntimeNotWiredError,
  isLiveEvidenceComplete,
  wireLiveOrFallbackToMock,
  type LiveRuntimeEvidence,
} from "./live-backend.js";
import { MockComplianceBackend } from "./mock-backend.js";

const FULL_EVIDENCE: LiveRuntimeEvidence = {
  runtimeArn: "arn:aws:bedrock-agentcore:ap-southeast-1:000000000000:runtime/issue3-s3-specialist",
  modelId: "amazon.nova-lite-v1:0",
  sessionId: "sess-abc123",
  toolId: "s3-ssl-enforce",
  region: "ap-southeast-1",
};

test("unwired live adapter reports MOCK, never LIVE_LAB", () => {
  const be = new LiveAgentCoreBackend();
  assert.equal(be.isWired, false);
  assert.equal(be.mode, "MOCK", "an unwired adapter must not claim LIVE_LAB");
  assert.equal(be.runtimeEvidence, undefined);
});

test("every backend op on an unwired adapter fails closed (no synthetic success)", async () => {
  const be = new LiveAgentCoreBackend();
  await assert.rejects(() => be.listFindings(), RuntimeNotWiredError);
  await assert.rejects(() => be.getFinding("x"), RuntimeNotWiredError);
  await assert.rejects(() => be.listAgents(), RuntimeNotWiredError);
  await assert.rejects(() => be.listCapabilities(), RuntimeNotWiredError);
  await assert.rejects(() => be.proposeRemediation("f"), RuntimeNotWiredError);
  await assert.rejects(() => be.decide("p", "APPROVE_ONCE", "lab-operator"), RuntimeNotWiredError);
  await assert.rejects(() => be.execute("p"), RuntimeNotWiredError);
  await assert.rejects(() => be.getRun("r"), RuntimeNotWiredError);
});

test("partial evidence is discarded — no half-wired LIVE state", () => {
  // Missing sessionId and toolId: must NOT be accepted as live.
  const partial = {
    runtimeArn: FULL_EVIDENCE.runtimeArn,
    modelId: FULL_EVIDENCE.modelId,
    region: FULL_EVIDENCE.region,
  };
  assert.equal(isLiveEvidenceComplete(partial), false);
  const be = new LiveAgentCoreBackend(partial);
  assert.equal(be.isWired, false);
  assert.equal(be.mode, "MOCK");
});

test("blank-string evidence fields do not satisfy the live invariant", () => {
  const blanks = { ...FULL_EVIDENCE, toolId: "   " };
  assert.equal(isLiveEvidenceComplete(blanks), false);
  assert.equal(new LiveAgentCoreBackend(blanks).mode, "MOCK");
});

test("LIVE_LAB is reported ONLY with complete verified evidence", () => {
  assert.equal(isLiveEvidenceComplete(FULL_EVIDENCE), true);
  const be = new LiveAgentCoreBackend(FULL_EVIDENCE);
  assert.equal(be.isWired, true);
  assert.equal(be.mode, "LIVE_LAB");
  assert.deepEqual(be.runtimeEvidence, FULL_EVIDENCE);
});

test("wireLiveOrFallbackToMock defaults to MOCK when no/partial evidence", () => {
  const noEvidence = wireLiveOrFallbackToMock();
  assert.equal(noEvidence.mode, "MOCK");
  assert.ok(noEvidence instanceof MockComplianceBackend, "default backend is the mock");

  const partial = wireLiveOrFallbackToMock({ runtimeArn: FULL_EVIDENCE.runtimeArn });
  assert.equal(partial.mode, "MOCK");
  assert.ok(partial instanceof MockComplianceBackend);
});

test("wireLiveOrFallbackToMock returns a LIVE adapter only with full evidence", () => {
  const live = wireLiveOrFallbackToMock(FULL_EVIDENCE);
  assert.equal(live.mode, "LIVE_LAB");
  assert.ok(live instanceof LiveAgentCoreBackend);
});
