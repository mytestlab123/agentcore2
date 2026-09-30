import { describe, expect, it } from "vitest";
import {
  DEFAULT_DATASET_SIZE,
  DEFAULT_SEED,
  generateDataset,
} from "../mock/dataset.js";
import type {
  ComplianceStatus,
  Finding,
  Severity,
} from "../domain.js";

const VALID_STATUSES: ComplianceStatus[] = [
  "COMPLIANT",
  "NON_COMPLIANT",
  "NOT_APPLICABLE",
];
const VALID_SEVERITIES: Severity[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFORMATIONAL",
];

function assertValidShape(f: Finding): void {
  expect(typeof f.id).toBe("string");
  expect(f.id.length).toBeGreaterThan(0);
  expect(typeof f.title).toBe("string");
  expect(typeof f.resourceId).toBe("string");
  expect(typeof f.resourceType).toBe("string");
  expect(["S3", "EC2", "EBS", "IAM", "RDS"]).toContain(f.service);
  expect(typeof f.region).toBe("string");
  expect(VALID_STATUSES).toContain(f.complianceStatus);
  expect(VALID_SEVERITIES).toContain(f.severity);
  expect(typeof f.ruleId).toBe("string");
  expect(() => new Date(f.firstObservedAt).toISOString()).not.toThrow();
  expect(() => new Date(f.lastObservedAt).toISOString()).not.toThrow();
  expect(typeof f.accountId).toBe("string");
  expect(typeof f.tags).toBe("object");
}

describe("generateDataset", () => {
  it("produces the expected large count of findings by default", () => {
    const dataset = generateDataset();
    expect(dataset.findings).toHaveLength(DEFAULT_DATASET_SIZE);
    expect(DEFAULT_DATASET_SIZE).toBeGreaterThanOrEqual(1000);
  });

  it("is deterministic for the same seed", () => {
    const a = generateDataset({ size: 500, seed: DEFAULT_SEED });
    const b = generateDataset({ size: 500, seed: DEFAULT_SEED });
    expect(JSON.stringify(a.findings)).toEqual(JSON.stringify(b.findings));
  });

  it("produces different data for a different seed", () => {
    const a = generateDataset({ size: 500, seed: 1 });
    const b = generateDataset({ size: 500, seed: 2 });
    expect(JSON.stringify(a.findings)).not.toEqual(
      JSON.stringify(b.findings),
    );
  });

  it("yields valid finding shapes with matching remediation + evidence", () => {
    const dataset = generateDataset({ size: 200 });
    for (const finding of dataset.findings) {
      assertValidShape(finding);
      const remediation = dataset.remediationsByFindingId.get(finding.id);
      expect(remediation).toBeDefined();
      expect(remediation?.findingId).toBe(finding.id);
      expect(remediation?.targetResourceId).toBe(finding.resourceId);
      const evidence = dataset.evidenceByFindingId.get(finding.id);
      expect(evidence?.[0]?.kind).toBe("DETECTED");
      // Non-compliant findings advertise a proposed fix in their initial
      // timeline so FIX_PROPOSED is actually produced, not just typed.
      if (finding.complianceStatus === "NON_COMPLIANT") {
        const kinds = evidence!.map((e) => e.kind);
        expect(kinds).toEqual(["DETECTED", "EXPLAINED", "FIX_PROPOSED"]);
      }
    }
  });

  it("emits FIX_PROPOSED for non-compliant findings", () => {
    const dataset = generateDataset({ size: 300, seed: 99 });
    const emitted = [...dataset.evidenceByFindingId.values()].some((events) =>
      events.some((e) => e.kind === "FIX_PROPOSED"),
    );
    expect(emitted).toBe(true);
  });

  it("spans multiple services, severities, statuses, regions and accounts", () => {
    const dataset = generateDataset({ size: 2000 });
    const services = new Set(dataset.findings.map((f) => f.service));
    const severities = new Set(dataset.findings.map((f) => f.severity));
    const statuses = new Set(dataset.findings.map((f) => f.complianceStatus));
    const regions = new Set(dataset.findings.map((f) => f.region));
    const accounts = new Set(dataset.findings.map((f) => f.accountId));
    expect(services.size).toBeGreaterThan(1);
    expect(severities.size).toBeGreaterThan(1);
    expect(statuses.size).toBe(3);
    expect(regions.size).toBeGreaterThan(1);
    expect(accounts.size).toBeGreaterThan(1);
  });
});
