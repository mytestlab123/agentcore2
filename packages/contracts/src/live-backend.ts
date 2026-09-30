/**
 * Live AgentCore-backed adapter (the WIRING SEAM for the real runtime).
 *
 * This is the single place a preview UI is pointed at a real AgentCore runtime
 * instead of the in-memory mock. It implements the SAME `ComplianceBackend`
 * seam, so no preview code changes when it is swapped in.
 *
 * TRUTHFUL-MODE INVARIANT (Issue #3, task 8):
 *   A result may carry `mode: "LIVE_LAB"` ONLY when this adapter holds real,
 *   verified provider evidence — a runtime ARN, a model id, a live session id,
 *   and a registered tool id, all supplied by an actually-deployed Issue #3
 *   runtime. Absent that evidence the adapter is UNWIRED: it never fabricates a
 *   runtime, never emits LIVE_LAB, and never returns synthetic success dressed
 *   as live. It fails closed instead.
 *
 * Because task 7 (`deploy-agentcore-s3-specialist`) produced NO deployable
 * Issue #3-owned runtime (no containerUri / ECR image), the wiring point exists
 * but cannot be given live evidence yet: `wireLiveOrFallbackToMock()` therefore
 * hands back the MOCK backend, preserving MOCK mode, and a real bounded live
 * invocation is deferred until a runtime exists.
 *
 * DURABLE asset — candidate for harvest into cloudscape-remediation.
 */

import type { AgentDescriptor, ComplianceBackend } from "./backend.js";
import type { ExecutionMode, Finding, FindingQuery } from "./finding.js";
import type {
  ApprovalDecision,
  ApprovalRecord,
  RemediationCapability,
  RemediationProposal,
  RemediationRun,
} from "./remediation.js";
import { MockComplianceBackend } from "./mock-backend.js";

/**
 * Concrete, verified evidence that a real Issue #3 AgentCore runtime is wired.
 * Every field is a provider-native identifier; none may be synthesized. If ALL
 * are present the adapter is LIVE, otherwise it is UNWIRED. There is no third
 * state — you cannot be "partly live".
 */
export interface LiveRuntimeEvidence {
  /** AgentCore runtime ARN from create-agent-runtime, e.g. arn:aws:bedrock-agentcore:...:runtime/... */
  runtimeArn: string;
  /** Foundation model id the runtime is bound to, e.g. a Bedrock model id. */
  modelId: string;
  /** Live session id returned when the runtime opens a session. */
  sessionId: string;
  /** Id of a registered tool the runtime is permitted to invoke. */
  toolId: string;
  /** Owner-approved personal-LAB region (must be verified before use). */
  region: string;
}

/** True only when every required piece of live evidence is a non-empty string. */
export function isLiveEvidenceComplete(e: Partial<LiveRuntimeEvidence> | undefined): e is LiveRuntimeEvidence {
  if (!e) return false;
  const fields: (keyof LiveRuntimeEvidence)[] = ["runtimeArn", "modelId", "sessionId", "toolId", "region"];
  return fields.every((k) => typeof e[k] === "string" && (e[k] as string).trim().length > 0);
}

/** Raised when a live operation is attempted with no verified runtime evidence. */
export class RuntimeNotWiredError extends Error {
  constructor(op: string) {
    super(
      `LiveAgentCoreBackend is UNWIRED: '${op}' requires a deployed Issue #3 runtime ` +
        `(runtimeArn, modelId, sessionId, toolId). No live evidence present — refusing to ` +
        `fabricate a live result. Deploy the harness runtime (task 7) first.`,
    );
    this.name = "RuntimeNotWiredError";
  }
}

/**
 * Adapter that speaks the ComplianceBackend seam over a real AgentCore runtime.
 *
 * Constructed WITHOUT evidence it is a valid object (the wiring point exists)
 * but every backend method that would touch the live runtime fails closed with
 * RuntimeNotWiredError. `mode` reports "MOCK" while unwired so a UI can never be
 * tricked into rendering a LIVE badge over an unwired adapter.
 */
export class LiveAgentCoreBackend implements ComplianceBackend {
  private readonly evidence?: LiveRuntimeEvidence;

  constructor(evidence?: Partial<LiveRuntimeEvidence>) {
    // Accept evidence ONLY if it is fully complete; a partial object is discarded
    // (never half-wired). This is what makes "synthetic success shown as live"
    // structurally impossible: without all four provider ids there is no LIVE.
    this.evidence = isLiveEvidenceComplete(evidence) ? evidence : undefined;
  }

  /** True only when verified live runtime evidence is held. */
  get isWired(): boolean {
    return this.evidence !== undefined;
  }

  /**
   * The mode a UI badge renders. LIVE_LAB is only ever returned when real
   * evidence is held; an unwired adapter reports MOCK, never LIVE_LAB.
   */
  get mode(): ExecutionMode {
    return this.evidence ? "LIVE_LAB" : "MOCK";
  }

  /** The verified evidence, or undefined when unwired. Never fabricated. */
  get runtimeEvidence(): Readonly<LiveRuntimeEvidence> | undefined {
    return this.evidence;
  }

  private requireWired(op: string): LiveRuntimeEvidence {
    if (!this.evidence) throw new RuntimeNotWiredError(op);
    return this.evidence;
  }

  async listFindings(_query?: FindingQuery): Promise<Finding[]> {
    this.requireWired("listFindings");
    // A real implementation would call the runtime's finding source here.
    throw new RuntimeNotWiredError("listFindings");
  }

  async getFinding(_id: string): Promise<Finding | undefined> {
    this.requireWired("getFinding");
    throw new RuntimeNotWiredError("getFinding");
  }

  async listAgents(): Promise<AgentDescriptor[]> {
    this.requireWired("listAgents");
    throw new RuntimeNotWiredError("listAgents");
  }

  async listCapabilities(): Promise<RemediationCapability[]> {
    this.requireWired("listCapabilities");
    throw new RuntimeNotWiredError("listCapabilities");
  }

  async proposeRemediation(_findingId: string): Promise<RemediationProposal> {
    this.requireWired("proposeRemediation");
    throw new RuntimeNotWiredError("proposeRemediation");
  }

  async decide(_proposalId: string, _decision: ApprovalDecision, _actorClass: string): Promise<ApprovalRecord> {
    this.requireWired("decide");
    throw new RuntimeNotWiredError("decide");
  }

  async execute(_proposalId: string): Promise<RemediationRun> {
    this.requireWired("execute");
    throw new RuntimeNotWiredError("execute");
  }

  async getRun(_runId: string): Promise<RemediationRun | undefined> {
    this.requireWired("getRun");
    throw new RuntimeNotWiredError("getRun");
  }
}

/**
 * The one-line seam every preview uses to pick its backend.
 *
 * Returns a LIVE adapter only when complete, verified runtime evidence is
 * supplied; otherwise returns the MOCK backend so previews keep working with a
 * truthful MOCK badge. This is the default the previews import — it CANNOT
 * silently produce a live-labelled backend from missing evidence.
 */
export function wireLiveOrFallbackToMock(
  evidence?: Partial<LiveRuntimeEvidence>,
): ComplianceBackend {
  if (isLiveEvidenceComplete(evidence)) {
    return new LiveAgentCoreBackend(evidence);
  }
  return new MockComplianceBackend();
}
