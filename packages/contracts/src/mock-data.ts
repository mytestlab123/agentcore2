/**
 * Shared synthetic dataset.
 *
 * Enough findings to exercise thousands-of-resource UI behavior (tables,
 * filters, paging) WITHOUT creating real AWS resources. Deterministic: the
 * generator is seeded so mock output is stable across previews and reloads.
 */

import type { Finding, ResourceRef, Severity, ComplianceStatus } from "./finding.js";
import type { AgentDescriptor } from "./backend.js";
import type { RemediationCapability } from "./remediation.js";

const LAB_ACCOUNT = "000000000000"; // placeholder; real account never hard-coded in the public repo
const LAB_REGION = "ap-southeast-1";

/** Registered deterministic remediation capabilities. */
export const CAPABILITIES: RemediationCapability[] = [
  {
    id: "cap-s3-ssl",
    title: "Enforce S3 SSL-only bucket policy",
    description: "Attach a bucket policy denying non-TLS (aws:SecureTransport=false) requests.",
    appliesToResourceType: "AWS::S3::Bucket",
    requiresApproval: true,
    executor: "aws-api",
  },
  {
    id: "cap-s3-logging",
    title: "Enable S3 server access logging",
    description: "Configure access logging to a dedicated log bucket.",
    appliesToResourceType: "AWS::S3::Bucket",
    requiresApproval: true,
    executor: "aws-api",
  },
  {
    id: "cap-s3-backup",
    title: "Enable S3 versioning for backup posture",
    description: "Turn on bucket versioning to support recovery.",
    appliesToResourceType: "AWS::S3::Bucket",
    requiresApproval: true,
    executor: "aws-api",
  },
  {
    id: "cap-sg-revoke-open",
    title: "Revoke overly-open security group ingress",
    description: "Remove 0.0.0.0/0 ingress on sensitive ports.",
    appliesToResourceType: "AWS::EC2::SecurityGroup",
    requiresApproval: true,
    executor: "aws-api",
  },
];

/** Agent catalogue. Mock readiness by default; real agents graduate to HARNESS_DEPLOYED. */
export const AGENTS: AgentDescriptor[] = [
  { id: "agt-s3-ssl", name: "S3 SSL Specialist", domain: "s3-ssl", description: "Understands and remediates S3 SSL/TLS enforcement findings.", readiness: "MOCK", capabilityIds: ["cap-s3-ssl"] },
  { id: "agt-s3-logging", name: "S3 Logging Specialist", domain: "s3-logging", description: "Handles S3 access-logging compliance.", readiness: "MOCK", capabilityIds: ["cap-s3-logging"] },
  { id: "agt-s3-backup", name: "S3 Backup Specialist", domain: "s3-backup", description: "Handles S3 versioning/backup posture.", readiness: "MOCK", capabilityIds: ["cap-s3-backup"] },
  { id: "agt-sg", name: "Security Group Specialist", domain: "security-group", description: "Reviews and remediates open ingress.", readiness: "MOCK", capabilityIds: ["cap-sg-revoke-open"] },
  { id: "agt-triage", name: "Finding Triage Assistant", domain: "triage", description: "Explains findings and proposes next steps.", readiness: "MOCK", capabilityIds: [] },
  { id: "agt-evidence", name: "Evidence/Report Assistant", domain: "evidence", description: "Summarizes runs into audit evidence.", readiness: "MOCK", capabilityIds: [] },
];

interface RuleSpec {
  ruleId: string;
  title: string;
  description: string;
  resourceType: string;
  severity: Severity;
  frameworks: string[];
  capabilityId?: string;
}

const RULES: RuleSpec[] = [
  { ruleId: "s3-bucket-ssl-requests-only", title: "S3 bucket allows non-SSL requests", description: "Bucket policy does not deny requests over plain HTTP.", resourceType: "AWS::S3::Bucket", severity: "MEDIUM", frameworks: ["CIS-2.1.2", "PCI-DSS-4.1"], capabilityId: "cap-s3-ssl" },
  { ruleId: "s3-bucket-logging-enabled", title: "S3 bucket has no access logging", description: "Server access logging is disabled.", resourceType: "AWS::S3::Bucket", severity: "LOW", frameworks: ["CIS-3.6"], capabilityId: "cap-s3-logging" },
  { ruleId: "s3-bucket-versioning-enabled", title: "S3 bucket versioning disabled", description: "Versioning is off; recovery posture is weak.", resourceType: "AWS::S3::Bucket", severity: "LOW", frameworks: ["CIS-2.1.3"], capabilityId: "cap-s3-backup" },
  { ruleId: "restricted-common-ports", title: "Security group exposes sensitive port to 0.0.0.0/0", description: "Ingress rule allows the world to a sensitive port.", resourceType: "AWS::EC2::SecurityGroup", severity: "HIGH", frameworks: ["CIS-5.2"], capabilityId: "cap-sg-revoke-open" },
  { ruleId: "ebs-snapshot-public", title: "EBS snapshot is public", description: "Snapshot is shared with all AWS accounts.", resourceType: "AWS::EC2::Snapshot", severity: "CRITICAL", frameworks: ["CIS-2.2.1"] },
];

/** Small deterministic PRNG (mulberry32) so the dataset is stable. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUS_CYCLE: ComplianceStatus[] = ["NON_COMPLIANT", "NON_COMPLIANT", "NON_COMPLIANT", "COMPLIANT"];

/**
 * Generate `count` deterministic synthetic findings spread across the rule set.
 * Default 1200 comfortably exercises large-table UI without real resources.
 */
export function generateFindings(count = 1200): Finding[] {
  const rand = rng(42);
  const findings: Finding[] = [];
  for (let i = 0; i < count; i++) {
    const rule = RULES[i % RULES.length]!;
    const status = STATUS_CYCLE[Math.floor(rand() * STATUS_CYCLE.length)]!;
    const idNum = String(i).padStart(5, "0");
    const resource: ResourceRef = {
      id: resourceIdFor(rule.resourceType, idNum),
      type: rule.resourceType,
      region: LAB_REGION,
      accountId: LAB_ACCOUNT,
      name: `lab-${rule.resourceType.split("::").pop()!.toLowerCase()}-${idNum}`,
      tags: { project: "agentcore2", environment: "dev", owner: "amit" },
    };
    findings.push({
      id: `f-${idNum}`,
      ruleId: rule.ruleId,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      status,
      resource,
      frameworks: rule.frameworks,
      firstObservedAt: "2026-09-01T00:00:00.000Z",
      lastObservedAt: "2026-09-30T00:00:00.000Z",
      remediationCapabilityId: status === "NON_COMPLIANT" ? rule.capabilityId : undefined,
    });
  }
  return findings;
}

function resourceIdFor(type: string, idNum: string): string {
  switch (type) {
    case "AWS::S3::Bucket":
      return `lab-agentcore2-bucket-${idNum}`;
    case "AWS::EC2::SecurityGroup":
      return `sg-${idNum}abcdef0`;
    case "AWS::EC2::Snapshot":
      return `snap-${idNum}abcdef0`;
    default:
      return `res-${idNum}`;
  }
}
