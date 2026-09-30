import { beforeEach, describe, expect, it } from "vitest";
import { MockBackendAdapter } from "../mock/adapter.js";
import { generateDataset } from "../mock/dataset.js";

function makeAdapter(size = 1000) {
  return new MockBackendAdapter({ dataset: generateDataset({ size, seed: 7 }) });
}

describe("MockBackendAdapter.mode", () => {
  it("reports MOCK", () => {
    expect(makeAdapter(10).mode()).toBe("MOCK");
  });
});

describe("MockBackendAdapter.listFindings filtering + pagination", () => {
  let adapter: MockBackendAdapter;

  beforeEach(() => {
    adapter = makeAdapter(1000);
  });

  it("paginates deterministically", async () => {
    const page1 = await adapter.listFindings({ page: 1, pageSize: 20 });
    expect(page1.items).toHaveLength(20);
    expect(page1.page).toBe(1);
    expect(page1.pageSize).toBe(20);
    expect(page1.total).toBe(1000);
    expect(page1.totalPages).toBe(50);

    const page2 = await adapter.listFindings({ page: 2, pageSize: 20 });
    expect(page2.items[0]?.id).not.toBe(page1.items[0]?.id);
    // No overlap between pages.
    const ids1 = new Set(page1.items.map((f) => f.id));
    expect(page2.items.some((f) => ids1.has(f.id))).toBe(false);
  });

  it("filters by service", async () => {
    const result = await adapter.listFindings({ service: "S3", pageSize: 1000 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((f) => f.service === "S3")).toBe(true);
    expect(result.total).toBe(result.items.length);
  });

  it("filters by severity and compliance status together", async () => {
    const result = await adapter.listFindings({
      severity: "CRITICAL",
      complianceStatus: "NON_COMPLIANT",
      pageSize: 1000,
    });
    expect(
      result.items.every(
        (f) => f.severity === "CRITICAL" && f.complianceStatus === "NON_COMPLIANT",
      ),
    ).toBe(true);
  });

  it("filters by free-text search over ruleId", async () => {
    const result = await adapter.listFindings({
      search: "ssl-requests-only",
      pageSize: 1000,
    });
    expect(result.items.length).toBeGreaterThan(0);
    expect(
      result.items.every((f) => f.ruleId.includes("ssl-requests-only")),
    ).toBe(true);
  });

  it("returns an empty page beyond the last page", async () => {
    const result = await adapter.listFindings({ page: 999, pageSize: 20 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(1000);
  });
});

describe("MockBackendAdapter.previewFix + getFinding", () => {
  it("returns the deterministic proposed remediation", async () => {
    const adapter = makeAdapter(50);
    const page = await adapter.listFindings({ pageSize: 1 });
    const finding = page.items[0]!;
    const a = await adapter.previewFix(finding.id);
    const b = await adapter.previewFix(finding.id);
    expect(a).toEqual(b);
    expect(a.findingId).toBe(finding.id);
    expect(a.deterministic).toBe(true);
    expect(a.requiresApproval).toBe(true);
  });

  it("getFinding returns null for unknown ids", async () => {
    const adapter = makeAdapter(10);
    expect(await adapter.getFinding("does-not-exist")).toBeNull();
  });
});
