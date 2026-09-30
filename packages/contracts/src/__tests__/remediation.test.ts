import { describe, expect, it } from "vitest";
import { MockBackendAdapter } from "../mock/adapter.js";
import { generateDataset } from "../mock/dataset.js";
import type { EvidenceKind } from "../domain.js";

function makeAdapter() {
  return new MockBackendAdapter({ dataset: generateDataset({ size: 100, seed: 42 }) });
}

async function firstFindingId(adapter: MockBackendAdapter): Promise<string> {
  const page = await adapter.listFindings({ pageSize: 1 });
  return page.items[0]!.id;
}

describe("requestRemediation approval gate", () => {
  it("approve:false yields REJECTED with zero mutation (no EXECUTED event)", async () => {
    const adapter = makeAdapter();
    const findingId = await firstFindingId(adapter);
    const before = await adapter.getEvidenceTimeline(findingId);

    const execution = await adapter.requestRemediation(findingId, {
      approve: false,
    });

    expect(execution.status).toBe("REJECTED");
    expect(execution.approved).toBe(false);
    expect(execution.mode).toBe("MOCK");

    const after = await adapter.getEvidenceTimeline(findingId);
    // Exactly one new event was appended, and it is REJECTED.
    expect(after.length).toBe(before.length + 1);
    const appended = after.slice(before.length);
    expect(appended.map((e) => e.kind)).toEqual(["REJECTED"]);

    // Zero mutation: none of the mutation/verification events exist.
    const forbidden: EvidenceKind[] = [
      "EXECUTED",
      "PROVIDER_READBACK",
      "CONFIG_CONVERGENCE",
      "VERIFIED",
    ];
    expect(after.some((e) => forbidden.includes(e.kind))).toBe(false);

    // Execution is persisted and retrievable.
    const retrieved = await adapter.getExecution(execution.executionId);
    expect(retrieved).toEqual(execution);
  });

  it("approve:true yields SUCCEEDED with the full evidence chain and separate readback/convergence events", async () => {
    const adapter = makeAdapter();
    const findingId = await firstFindingId(adapter);
    const before = await adapter.getEvidenceTimeline(findingId);

    const execution = await adapter.requestRemediation(findingId, {
      approve: true,
    });

    expect(execution.status).toBe("SUCCEEDED");
    expect(execution.approved).toBe(true);
    expect(execution.executionId).toMatch(/^exec-\d{8}$/);

    const after = await adapter.getEvidenceTimeline(findingId);
    const appended = after.slice(before.length);
    expect(appended.map((e) => e.kind)).toEqual([
      "APPROVED",
      "EXECUTED",
      "PROVIDER_READBACK",
      "CONFIG_CONVERGENCE",
      "VERIFIED",
    ]);

    // PROVIDER_READBACK and CONFIG_CONVERGENCE are SEPARATE, distinct events.
    const readback = appended.filter((e) => e.kind === "PROVIDER_READBACK");
    const convergence = appended.filter((e) => e.kind === "CONFIG_CONVERGENCE");
    expect(readback).toHaveLength(1);
    expect(convergence).toHaveLength(1);
    expect(readback[0]!.id).not.toBe(convergence[0]!.id);

    // Every appended event is tied to the persisted executionId.
    expect(appended.every((e) => e.executionId === execution.executionId)).toBe(
      true,
    );

    // Execution is persisted and retrievable by id.
    const retrieved = await adapter.getExecution(execution.executionId);
    expect(retrieved?.executionId).toBe(execution.executionId);
    expect(retrieved?.status).toBe("SUCCEEDED");
  });

  it("generates distinct execution ids per request", async () => {
    const adapter = makeAdapter();
    const findingId = await firstFindingId(adapter);
    const e1 = await adapter.requestRemediation(findingId, { approve: false });
    const e2 = await adapter.requestRemediation(findingId, { approve: true });
    expect(e1.executionId).not.toBe(e2.executionId);
  });
});

describe("requestRemediation idempotency (terminal state)", () => {
  it("re-approving an already-remediated finding is a no-op: same execution, no duplicate chain", async () => {
    const adapter = makeAdapter();
    const findingId = await firstFindingId(adapter);

    const first = await adapter.requestRemediation(findingId, {
      approve: true,
    });
    expect(first.status).toBe("SUCCEEDED");
    const afterFirst = await adapter.getEvidenceTimeline(findingId);

    const second = await adapter.requestRemediation(findingId, {
      approve: true,
    });

    // Same execution is returned; no new SUCCEEDED execution is created.
    expect(second.executionId).toBe(first.executionId);
    expect(second.status).toBe("SUCCEEDED");

    const afterSecond = await adapter.getEvidenceTimeline(findingId);

    // The full mutation chain is NOT replayed — at most one explicit no-op
    // event is appended, never a second EXECUTED/READBACK/CONVERGENCE trio.
    expect(afterSecond.length).toBe(afterFirst.length + 1);
    const kindCount = (kind: EvidenceKind) =>
      afterSecond.filter((e) => e.kind === kind).length;
    expect(kindCount("EXECUTED")).toBe(1);
    expect(kindCount("PROVIDER_READBACK")).toBe(1);
    expect(kindCount("CONFIG_CONVERGENCE")).toBe(1);
    expect(kindCount("APPROVED")).toBe(1);

    // Exactly one SUCCEEDED execution exists for this finding.
    const succeededEvents = afterSecond.filter(
      (e) => e.executionId === first.executionId && e.kind === "EXECUTED",
    );
    expect(succeededEvents).toHaveLength(1);
  });

  it("rejecting an already-remediated finding returns the standing execution with zero mutation", async () => {
    const adapter = makeAdapter();
    const findingId = await firstFindingId(adapter);

    const first = await adapter.requestRemediation(findingId, {
      approve: true,
    });
    const afterFirst = await adapter.getEvidenceTimeline(findingId);

    const rejected = await adapter.requestRemediation(findingId, {
      approve: false,
    });

    // Terminal finding: the standing SUCCEEDED execution is returned, no
    // REJECTED execution or event is produced.
    expect(rejected.executionId).toBe(first.executionId);
    expect(rejected.status).toBe("SUCCEEDED");

    const afterReject = await adapter.getEvidenceTimeline(findingId);
    expect(afterReject.length).toBe(afterFirst.length);
    expect(afterReject.some((e) => e.kind === "REJECTED")).toBe(false);
  });
});

describe("read methods return copies (no leaked internal references)", () => {
  it("getRemediationForFinding / previewFix return copies", async () => {
    const adapter = makeAdapter();
    const findingId = await firstFindingId(adapter);

    const a = await adapter.getRemediationForFinding(findingId);
    const b = await adapter.getRemediationForFinding(findingId);
    expect(a).not.toBe(b);
    expect(a).toEqual(b);

    // Mutating a returned copy does not corrupt later reads.
    a!.title = "MUTATED";
    const c = await adapter.getRemediationForFinding(findingId);
    expect(c!.title).not.toBe("MUTATED");

    const p = await adapter.previewFix(findingId);
    const q = await adapter.previewFix(findingId);
    expect(p).not.toBe(q);
    expect(p).toEqual(q);
  });
});
