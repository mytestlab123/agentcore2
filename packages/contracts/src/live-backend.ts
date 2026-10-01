/** Authenticated live transport for the same ComplianceBackend seam as the UI. */
import type { AgentDescriptor, ComplianceBackend } from "./backend.js";
import type { ExecutionMode, Finding, FindingQuery } from "./finding.js";
import type { ApprovalDecision, ApprovalRecord, RemediationCapability, RemediationProposal, RemediationRun } from "./remediation.js";
import { MockComplianceBackend } from "./mock-backend.js";

export interface LiveRuntimeEvidence {
  runtimeArn: string;
  modelId: string;
  sessionId: string;
  toolId: string;
  region: string;
}
export type LiveOperation = Exclude<keyof ComplianceBackend, "mode">;
/** Supplied by an authenticated operator bridge or SDK caller, never static credentials. */
export type LiveTransport = (operation: LiveOperation, args: unknown[]) => Promise<unknown>;

export function isLiveEvidenceComplete(e: Partial<LiveRuntimeEvidence> | undefined): e is LiveRuntimeEvidence {
  return Boolean(e && ["runtimeArn", "modelId", "sessionId", "toolId", "region"].every(
    k => typeof e[k as keyof LiveRuntimeEvidence] === "string" && e[k as keyof LiveRuntimeEvidence]!.trim().length > 0));
}
export class RuntimeNotWiredError extends Error {
  constructor(op: string) {
    super(`LiveAgentCoreBackend is UNWIRED: ${op} requires provider evidence and an authenticated transport`);
    this.name = "RuntimeNotWiredError";
  }
}
export class LiveAgentCoreBackend implements ComplianceBackend {
  private readonly evidence?: LiveRuntimeEvidence;
  constructor(evidence?: Partial<LiveRuntimeEvidence>, private readonly transport?: LiveTransport) {
    this.evidence = isLiveEvidenceComplete(evidence) && transport ? evidence : undefined;
  }
  get isWired(): boolean { return this.evidence !== undefined; }
  get mode(): ExecutionMode { return this.isWired ? "LIVE_LAB" : "MOCK"; }
  get runtimeEvidence(): Readonly<LiveRuntimeEvidence> | undefined { return this.evidence; }
  private async call<T>(operation: LiveOperation, args: unknown[] = []): Promise<T> {
    if (!this.evidence || !this.transport) throw new RuntimeNotWiredError(operation);
    return await this.transport(operation, args) as T;
  }
  listFindings(query?: FindingQuery): Promise<Finding[]> { return this.call("listFindings", [query ?? {}]); }
  getFinding(id: string): Promise<Finding | undefined> { return this.call("getFinding", [id]); }
  listAgents(): Promise<AgentDescriptor[]> { return this.call("listAgents"); }
  listCapabilities(): Promise<RemediationCapability[]> { return this.call("listCapabilities"); }
  proposeRemediation(id: string): Promise<RemediationProposal> { return this.call("proposeRemediation", [id]); }
  decide(id: string, decision: ApprovalDecision, actor: string): Promise<ApprovalRecord> { return this.call("decide", [id, decision, actor]); }
  execute(id: string): Promise<RemediationRun> { return this.call("execute", [id]); }
  getRun(id: string): Promise<RemediationRun | undefined> { return this.call("getRun", [id]); }
}
export function wireLiveOrFallbackToMock(evidence?: Partial<LiveRuntimeEvidence>, transport?: LiveTransport): ComplianceBackend {
  return isLiveEvidenceComplete(evidence) && transport ? new LiveAgentCoreBackend(evidence, transport) : new MockComplianceBackend();
}
