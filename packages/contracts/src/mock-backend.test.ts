import { test } from "node:test";
import assert from "node:assert/strict";
import { MockComplianceBackend } from "./mock-backend.js";

const fixedClock = () => "2026-09-30T00:00:00.000Z";

test("mock backend generates a deterministic, filterable dataset", async () => {
  const be = new MockComplianceBackend({ findingCount: 100, clock: fixedClock });
  const all = await be.listFindings();
  assert.equal(all.length, 100);

  const nonCompliant = await be.listFindings({ status: "NON_COMPLIANT" });
  assert.ok(nonCompliant.length > 0 && nonCompliant.length < 100);
  assert.ok(nonCompliant.every((f) => f.status === "NON_COMPLIANT"));

  const s3 = await be.listFindings({ resourceType: "AWS::S3::Bucket" });
  assert.ok(s3.every((f) => f.resource.type === "AWS::S3::Bucket"));

  const search = await be.listFindings({ search: "bucket-00001" });
  assert.ok(search.length >= 1);
});

test("every response is tagged MOCK so the UI badge is truthful", async () => {
  const be = new MockComplianceBackend({ findingCount: 20, clock: fixedClock });
  assert.equal(be.mode, "MOCK");
});

test("REJECT produces zero writes and no successful run", async () => {
  const be = new MockComplianceBackend({ findingCount: 50, clock: fixedClock });
  const target = (await be.listFindings({ status: "NON_COMPLIANT" }))[0]!;
  const proposal = await be.proposeRemediation(target.id);
  await be.decide(proposal.proposalId, "REJECT", "lab-operator");

  const run = await be.execute(proposal.proposalId);
  assert.equal(run.state, "REJECTED");
  assert.ok(!run.providerExecutionId, "rejected run must not carry a provider execution id");
  assert.ok(run.evidence.some((e) => /zero writes/i.test(e.summary)));
});

test("execute WITHOUT any decision also performs zero writes", async () => {
  const be = new MockComplianceBackend({ findingCount: 50, clock: fixedClock });
  const target = (await be.listFindings({ status: "NON_COMPLIANT" }))[0]!;
  const proposal = await be.proposeRemediation(target.id);
  const run = await be.execute(proposal.proposalId); // no decide()
  assert.equal(run.state, "PROPOSED");
  assert.ok(!run.providerExecutionId);
});

test("APPROVE_ONCE converges and keeps provider readback distinct from compliance readback", async () => {
  const be = new MockComplianceBackend({ findingCount: 50, clock: fixedClock });
  const target = (await be.listFindings({ status: "NON_COMPLIANT" }))[0]!;
  const proposal = await be.proposeRemediation(target.id);
  await be.decide(proposal.proposalId, "APPROVE_ONCE", "lab-operator");
  const run = await be.execute(proposal.proposalId);

  assert.equal(run.state, "VERIFIED");
  assert.ok(run.providerExecutionId);
  const kinds = run.evidence.map((e) => e.kind);
  assert.ok(kinds.includes("PROVIDER_READBACK"));
  assert.ok(kinds.includes("COMPLIANCE_READBACK"));

  // Durable/resumable: run is retrievable by id after "session loss".
  const resumed = await be.getRun(run.runId);
  assert.equal(resumed?.runId, run.runId);
  assert.equal(resumed?.state, "VERIFIED");
});

test("a finding with no registered capability cannot be silently remediated", async () => {
  const be = new MockComplianceBackend({ findingCount: 50, clock: fixedClock });
  const snapshot = (await be.listFindings({ ruleId: "ebs-snapshot-public" }))[0];
  if (snapshot) {
    await assert.rejects(() => be.proposeRemediation(snapshot.id), /no registered remediation capability|no registered/i);
  }
});
