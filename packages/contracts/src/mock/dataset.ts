/**
 * Deterministic synthetic dataset generator.
 *
 * Produces a large set of findings (default 5000) with per-finding evidence
 * timelines and proposed remediations, entirely in memory. No AWS calls, no
 * credentials. A seeded PRNG makes the output stable across runs so tests can
 * assert exact behavior.
 */
import type {
  ComplianceStatus,
  EvidenceEvent,
  Finding,
  Remediation,
  ServiceName,
  Severity,
} from "../domain.js";
import { SeededRandom } from "./prng.js";

/** Default number of findings — comfortably in the thousands. */
export const DEFAULT_DATASET_SIZE = 5000;

/** Default seed for reproducible output. */
export const DEFAULT_SEED = 0x51_4c_41_42; // "SLAB"

const SEVERITIES: readonly Severity[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFORMATIONAL",
];

const COMPLIANCE_STATUSES: readonly ComplianceStatus[] = [
  "NON_COMPLIANT",
  "NON_COMPLIANT",
  "NON_COMPLIANT",
  "COMPLIANT",
  "NOT_APPLICABLE",
];

const REGIONS: readonly string[] = [
  "ap-southeast-1",
  "us-east-1",
  "us-west-2",
  "eu-west-1",
];

/** Synthetic accounts. No real account IDs, no allowlist. */
const ACCOUNT_IDS: readonly string[] = [
  "000000000001",
  "000000000002",
  "000000000003",
];

/**
 * Rule templates per service. capabilityId ties a finding to the agent
 * capability that would remediate it (see agents/catalogue.ts).
 */
interface RuleTemplate {
  service: ServiceName;
  resourceType: string;
  ruleId: string;
  title: string;
  capabilityId: string;
  remediationTitle: string;
  remediationDescription: string;
  proposedActionSummary: string;
}

const RULE_TEMPLATES: readonly RuleTemplate[] = [
  {
    service: "S3",
    resourceType: "AWS::S3::Bucket",
    ruleId: "s3-bucket-ssl-requests-only",
    title: "S3 bucket does not enforce SSL-only requests",
    capabilityId: "cap-s3-enforce-ssl",
    remediationTitle: "Enforce SSL-only bucket policy",
    remediationDescription:
      "Attach a bucket policy that denies requests where aws:SecureTransport is false.",
    proposedActionSummary:
      "PutBucketPolicy adding an explicit Deny for non-TLS access.",
  },
  {
    service: "S3",
    resourceType: "AWS::S3::Bucket",
    ruleId: "s3-bucket-logging-enabled",
    title: "S3 bucket server access logging is disabled",
    capabilityId: "cap-s3-enable-logging",
    remediationTitle: "Enable S3 server access logging",
    remediationDescription:
      "Configure server access logging to a designated log bucket.",
    proposedActionSummary:
      "PutBucketLogging pointing at the central access-log bucket.",
  },
  {
    service: "S3",
    resourceType: "AWS::S3::Bucket",
    ruleId: "s3-bucket-versioning-enabled",
    title: "S3 bucket versioning is disabled",
    capabilityId: "cap-s3-enable-versioning",
    remediationTitle: "Enable S3 bucket versioning",
    remediationDescription:
      "Turn on versioning so object overwrites and deletes are recoverable.",
    proposedActionSummary: "PutBucketVersioning with Status=Enabled.",
  },
  {
    service: "EC2",
    resourceType: "AWS::EC2::SecurityGroup",
    ruleId: "restricted-common-ports",
    title: "Security group allows unrestricted ingress on a sensitive port",
    capabilityId: "cap-sg-restrict-ingress",
    remediationTitle: "Restrict open ingress rule",
    remediationDescription:
      "Remove the 0.0.0.0/0 ingress rule on the sensitive port and scope it to approved CIDRs.",
    proposedActionSummary:
      "RevokeSecurityGroupIngress for the 0.0.0.0/0 rule on the sensitive port.",
  },
  {
    service: "EBS",
    resourceType: "AWS::EC2::Volume",
    ruleId: "ebs-in-backup-plan",
    title: "EBS volume is not covered by a backup plan",
    capabilityId: "cap-ebs-enable-backup",
    remediationTitle: "Add EBS volume to backup plan",
    remediationDescription:
      "Tag and register the volume with the standard AWS Backup plan.",
    proposedActionSummary:
      "Tag the volume and associate it with the standard backup plan.",
  },
];

/** A fully generated dataset: findings + their remediations + evidence. */
export interface MockDataset {
  seed: number;
  findings: Finding[];
  remediationsByFindingId: Map<string, Remediation>;
  evidenceByFindingId: Map<string, EvidenceEvent[]>;
}

/** Options for {@link generateDataset}. */
export interface GenerateDatasetOptions {
  size?: number;
  seed?: number;
}

function pad(n: number, width: number): string {
  return n.toString().padStart(width, "0");
}

/**
 * Generate a deterministic dataset. Given the same size + seed, the output is
 * byte-for-byte identical across runs and processes.
 */
export function generateDataset(
  options: GenerateDatasetOptions = {},
): MockDataset {
  const size = options.size ?? DEFAULT_DATASET_SIZE;
  const seed = options.seed ?? DEFAULT_SEED;
  const rng = new SeededRandom(seed);

  const findings: Finding[] = [];
  const remediationsByFindingId = new Map<string, Remediation>();
  const evidenceByFindingId = new Map<string, EvidenceEvent[]>();

  // A fixed base time so timestamps are deterministic (no Date.now()).
  const baseTime = Date.UTC(2024, 0, 1, 0, 0, 0);

  for (let i = 0; i < size; i++) {
    const template = rng.pick(RULE_TEMPLATES);
    const severity = rng.pick(SEVERITIES);
    const complianceStatus = rng.pick(COMPLIANCE_STATUSES);
    const region = rng.pick(REGIONS);
    const accountId = rng.pick(ACCOUNT_IDS);

    const findingId = `finding-${pad(i, 6)}`;
    const resourceId = `${template.service.toLowerCase()}-resource-${pad(
      rng.int(0, 999999),
      6,
    )}`;

    // Spread observation times deterministically over a window.
    const firstOffsetDays = rng.int(1, 120);
    const lastOffsetDays = rng.int(0, firstOffsetDays - 1 < 0 ? 0 : firstOffsetDays - 1);
    const dayMs = 24 * 60 * 60 * 1000;
    const firstObservedAt = new Date(baseTime + firstOffsetDays * dayMs).toISOString();
    const lastObservedAt = new Date(
      baseTime + (firstOffsetDays + lastOffsetDays) * dayMs,
    ).toISOString();

    const finding: Finding = {
      id: findingId,
      title: template.title,
      resourceId,
      resourceType: template.resourceType,
      service: template.service,
      region,
      complianceStatus,
      severity,
      ruleId: template.ruleId,
      firstObservedAt,
      lastObservedAt,
      accountId,
      tags: {
        env: rng.pick(["dev", "staging", "sandbox"]),
        owner: rng.pick(["platform", "data", "app"]),
      },
    };
    findings.push(finding);

    const remediation: Remediation = {
      id: `remediation-${pad(i, 6)}`,
      findingId,
      title: template.remediationTitle,
      description: template.remediationDescription,
      capabilityId: template.capabilityId,
      deterministic: true,
      requiresApproval: true,
      proposedActionSummary: template.proposedActionSummary,
      targetResourceId: resourceId,
    };
    remediationsByFindingId.set(findingId, remediation);

    // Initial evidence timeline: detection (+ explanation for non-compliant).
    const timeline: EvidenceEvent[] = [
      {
        id: `${findingId}-ev-0`,
        findingId,
        remediationId: null,
        timestamp: firstObservedAt,
        kind: "DETECTED",
        actor: "config-recorder",
        summary: `Finding detected: ${template.title}`,
        executionId: null,
      },
    ];
    if (complianceStatus === "NON_COMPLIANT") {
      timeline.push({
        id: `${findingId}-ev-1`,
        findingId,
        remediationId: remediation.id,
        timestamp: lastObservedAt,
        kind: "EXPLAINED",
        actor: "agent-finding-triage",
        summary: `Explained ${severity} finding and proposed remediation.`,
        executionId: null,
      });
      // A fix has been proposed once a remediation exists for the finding. This
      // makes the initial timeline match the documented pre-approval chain
      // DETECTED -> EXPLAINED -> FIX_PROPOSED (see docs/ARCHITECTURE.md) so the
      // FIX_PROPOSED kind is actually produced, not just typed.
      timeline.push({
        id: `${findingId}-ev-2`,
        findingId,
        remediationId: remediation.id,
        timestamp: lastObservedAt,
        kind: "FIX_PROPOSED",
        actor: "agent-finding-triage",
        summary: `Proposed remediation: ${remediation.title}.`,
        executionId: null,
      });
    }
    evidenceByFindingId.set(findingId, timeline);
  }

  return { seed, findings, remediationsByFindingId, evidenceByFindingId };
}
