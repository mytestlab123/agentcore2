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
