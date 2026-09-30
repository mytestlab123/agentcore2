/**
 * Domain contract — the single shared finding/remediation/evidence vocabulary
 * used by every preview app and by every backend adapter (mock and, later, a
 * real AgentCore adapter).
 *
 * SPEC.md MUST: provider readback and Config/compliance convergence are kept as
 * SEPARATE evidence event kinds (see {@link EvidenceKind}).
 */

/** Lab state a backend adapter is operating in. Rendered by the LabModeBadge. */
export type LabMode = "MOCK" | "RECORDED" | "LIVE_LAB";

/** Compliance status for a resource against a rule. */
export type ComplianceStatus = "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE";

/** Finding severity. */
export type Severity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "INFORMATIONAL";

/** AWS-style service namespace the finding belongs to. */
export type ServiceName = "S3" | "EC2" | "EBS" | "IAM" | "RDS";

/** A single compliance finding against a cloud resource. */
export interface Finding {
  id: string;
  title: string;
  resourceId: string;
  resourceType: string;
  service: ServiceName;
  region: string;
  complianceStatus: ComplianceStatus;
  severity: Severity;
  ruleId: string;
  firstObservedAt: string;
  lastObservedAt: string;
  accountId: string;
  tags: Record<string, string>;
}

/**
 * A proposed remediation for a finding. Deterministic remediation is gated by
 * {@link Remediation.requiresApproval} per SPEC.md.
 */
export interface Remediation {
  id: string;
  findingId: string;
  title: string;
  description: string;
  /** Identifier of the agent capability that would perform this remediation. */
  capabilityId: string;
  /** True when the remediation is reproducible with a stable outcome. */
  deterministic: boolean;
  /** True when human approval is required before execution. */
  requiresApproval: boolean;
  proposedActionSummary: string;
  targetResourceId: string;
}

/**
 * Kinds of evidence timeline events.
 *
 * PROVIDER_READBACK (what the resource's own API reports) and CONFIG_CONVERGENCE
 * (what AWS Config / compliance evaluation reports) are DISTINCT kinds and MUST
 * NOT be merged — SPEC.md MUST.
 */
export type EvidenceKind =
  | "DETECTED"
  | "EXPLAINED"
  | "FIX_PROPOSED"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTED"
  | "PROVIDER_READBACK"
  | "CONFIG_CONVERGENCE"
  | "VERIFIED";

/** A single entry in an evidence timeline. */
export interface EvidenceEvent {
  id: string;
  findingId: string;
  /** Present when the event belongs to a specific remediation. */
  remediationId: string | null;
  timestamp: string;
  kind: EvidenceKind;
  actor: string;
  summary: string;
  /** Present once an execution exists; ties the event to an execution. */
  executionId: string | null;
}

/** Alias for a full evidence timeline for a finding. */
export type Evidence = EvidenceEvent[];

/** Execution lifecycle status. */
export type ExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "REJECTED";

/** Persisted state of a remediation execution, retrievable by executionId. */
export interface ExecutionState {
  executionId: string;
  findingId: string;
  remediationId: string;
  status: ExecutionStatus;
  mode: LabMode;
  createdAt: string;
  updatedAt: string;
  /** Whether the request was approved. approve:false => approved:false. */
  approved: boolean;
}
