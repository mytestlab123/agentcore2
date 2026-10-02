/**
 * Governed remediation + evidence contracts.
 *
 * Model (from Issue #3):
 *   finding -> agent understands context -> chooses REGISTERED capability
 *   -> server validates policy / exact target -> approval when required
 *   -> deterministic execution (SSM / API / Lambda) -> provider readback
 *   -> compliance convergence -> evidence.
 *
 * The agent selects a capability; it never invents and runs arbitrary commands.
 * DURABLE asset — candidate for harvest into cloudscape-remediation.
 */

import type { ExecutionMode, ResourceRef } from "./finding.js";

/** A registered, deterministic remediation the platform knows how to perform. */
export interface RemediationCapability {
  id: string;
  title: string;
  /** What the fix does, in operator language. */
  description: string;
  /** Provider-neutral resource type this capability applies to. */
  appliesToResourceType: string;
  /** True if this capability mutates real infrastructure and needs approval. */
  requiresApproval: boolean;
  /** Deterministic backend that performs the change, e.g. "ssm-automation", "aws-api", "lambda". */
  executor: "ssm-automation" | "aws-api" | "lambda" | "mock";
}

/** A concrete, exact-target proposal produced for one finding. */
export interface RemediationProposal {
  proposalId: string;
  findingId: string;
  capabilityId: string;
  /** The exact resource that would be changed. Approval is scoped to this. */
  target: ResourceRef;
  /** Human-readable summary of the proposed change. Never chain-of-thought. */
  summary: string;
  /** Structured before-state the executor will attempt to converge. */
  expectedChange: Record<string, unknown>;
  requiresApproval: boolean;
  createdAt: string;
}

export type ApprovalDecision = "APPROVE_ONCE" | "REJECT";

export interface ApprovalRecord {
  proposalId: string;
  decision: ApprovalDecision;
  /** Caller identity CLASS (e.g. "lab-operator"), never raw credentials. */
  actorClass: string;
  decidedAt: string;
}

export type RunState = "PROPOSED" | "APPROVED" | "REJECTED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "VERIFIED";

/**
 * A durable execution record. Must be resumable after browser/session loss:
 * the runId is the stable handle, persisted server-side.
 */
export interface RemediationRun {
  runId: string;
  proposalId: string;
  findingId: string;
  state: RunState;
  mode: ExecutionMode;
  /** AWS-native execution id (e.g. SSM Automation execution id) when live. */
  providerExecutionId?: string;
  startedAt?: string;
  finishedAt?: string;
  /** Evidence collected across the run lifecycle. */
  evidence: EvidenceEntry[];
}

export type EvidenceKind =
  | "PROPOSAL"
  | "APPROVAL"
  | "EXECUTION"
  | "PROVIDER_READBACK"
  | "COMPLIANCE_READBACK"
  | "CLEANUP"
  | "NOTE";

/** One timestamped, auditable step. Provider readback is kept distinct from compliance convergence. */
export interface EvidenceEntry {
  kind: EvidenceKind;
  at: string;
  mode: ExecutionMode;
  summary: string;
  /** Structured detail; never secrets or chain-of-thought. */
  detail?: Record<string, unknown>;
}
