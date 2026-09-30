/**
 * Backend adapter interface + agent catalogue.
 *
 * Every preview talks to a ComplianceBackend. The SAME interface is implemented
 * by the mock backend (this package) and, later, by a live AgentCore-backed
 * adapter. A UI cannot tell which it is talking to except via the ExecutionMode
 * each response carries — which is exactly what the MOCK/RECORDED/LIVE badge shows.
 *
 * DURABLE asset — candidate for harvest into cloudscape-remediation.
 */

import type { ExecutionMode, Finding, FindingQuery } from "./finding.js";
import type {
  ApprovalDecision,
  ApprovalRecord,
  RemediationCapability,
  RemediationProposal,
  RemediationRun,
} from "./remediation.js";

/** Readiness of an agent, reported truthfully (never synthetic "success"). */
export type AgentReadiness = "MOCK" | "HARNESS_DEPLOYED" | "PLANNED";

/** An AgentCore agent (or its mock stand-in). A tool/parser/verifier is NOT an agent. */
export interface AgentDescriptor {
  id: string;
  name: string;
  /** What compliance domain it specializes in, e.g. "s3-ssl". */
  domain: string;
  description: string;
  readiness: AgentReadiness;
  /** Capabilities this agent may select. It selects; it does not invent. */
  capabilityIds: string[];
}

/**
 * The single seam every preview UI depends on. Mock and live implementations
 * are interchangeable; each result's `mode` tells the UI what it is showing.
 */
export interface ComplianceBackend {
  readonly mode: ExecutionMode;

  listFindings(query?: FindingQuery): Promise<Finding[]>;
  getFinding(id: string): Promise<Finding | undefined>;

  listAgents(): Promise<AgentDescriptor[]>;
  listCapabilities(): Promise<RemediationCapability[]>;

  /** Produce an exact-target proposal for a finding (agent- or GUI-initiated). */
  proposeRemediation(findingId: string): Promise<RemediationProposal>;

  /** Record an Approve Once / Reject decision. A REJECT must yield zero writes. */
  decide(proposalId: string, decision: ApprovalDecision, actorClass: string): Promise<ApprovalRecord>;

  /** Execute an approved proposal deterministically. Returns a durable, resumable run. */
  execute(proposalId: string): Promise<RemediationRun>;

  /** Fetch a run by its durable id (resume after session/browser loss). */
  getRun(runId: string): Promise<RemediationRun | undefined>;
}
