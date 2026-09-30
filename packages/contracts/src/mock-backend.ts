/**
 * In-memory MOCK backend.
 *
 * Implements the ComplianceBackend seam so previews work with zero AWS
 * credentials. Enforces the governed flow: a REJECT produces ZERO writes and
 * no run; only APPROVE_ONCE lets execute() proceed. Runs are stored by durable
 * runId so getRun() resumes after simulated session loss.
 */

import type { ComplianceBackend, AgentDescriptor } from "./backend.js";
import type { Finding, FindingQuery, ExecutionMode } from "./finding.js";
import type {
  ApprovalDecision,
  ApprovalRecord,
  RemediationCapability,
  RemediationProposal,
  RemediationRun,
} from "./remediation.js";
import { AGENTS, CAPABILITIES, generateFindings } from "./mock-data.js";

function nowIso(): string {
  return new Date().toISOString();
}

export interface MockBackendOptions {
  findingCount?: number;
  /** Fixed clock for deterministic tests. */
  clock?: () => string;
}

export class MockComplianceBackend implements ComplianceBackend {
  readonly mode: ExecutionMode = "MOCK";
  private readonly findings: Finding[];
  private readonly proposals = new Map<string, RemediationProposal>();
  private readonly approvals = new Map<string, ApprovalRecord>();
  private readonly runs = new Map<string, RemediationRun>();
  private readonly clock: () => string;
  private seq = 0;

  constructor(opts: MockBackendOptions = {}) {
    this.findings = generateFindings(opts.findingCount);
    this.clock = opts.clock ?? nowIso;
  }

  async listFindings(query: FindingQuery = {}): Promise<Finding[]> {
    const q = query.search?.toLowerCase();
    return this.findings.filter((f) => {
      if (query.status && f.status !== query.status) return false;
      if (query.severity && f.severity !== query.severity) return false;
      if (query.resourceType && f.resource.type !== query.resourceType) return false;
      if (query.ruleId && f.ruleId !== query.ruleId) return false;
      if (q && !(`${f.title} ${f.resource.id}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  async getFinding(id: string): Promise<Finding | undefined> {
    return this.findings.find((f) => f.id === id);
  }

  async listAgents(): Promise<AgentDescriptor[]> {
    return AGENTS;
  }

  async listCapabilities(): Promise<RemediationCapability[]> {
    return CAPABILITIES;
  }

  async proposeRemediation(findingId: string): Promise<RemediationProposal> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error(`unknown finding: ${findingId}`);
    const capabilityId = finding.remediationCapabilityId;
    if (!capabilityId) throw new Error(`finding ${findingId} has no registered remediation capability`);
    const capability = CAPABILITIES.find((c) => c.id === capabilityId)!;
    const proposalId = `prop-${++this.seq}`;
    const proposal: RemediationProposal = {
      proposalId,
      findingId,
      capabilityId,
      target: finding.resource,
      summary: `${capability.title} on ${finding.resource.id}`,
      expectedChange: { rule: finding.ruleId, from: finding.status, to: "COMPLIANT" },
      requiresApproval: capability.requiresApproval,
      createdAt: this.clock(),
    };
    this.proposals.set(proposalId, proposal);
    return proposal;
  }

  async decide(proposalId: string, decision: ApprovalDecision, actorClass: string): Promise<ApprovalRecord> {
    if (!this.proposals.has(proposalId)) throw new Error(`unknown proposal: ${proposalId}`);
    const record: ApprovalRecord = { proposalId, decision, actorClass, decidedAt: this.clock() };
    this.approvals.set(proposalId, record);
    return record;
  }

  async execute(proposalId: string): Promise<RemediationRun> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error(`unknown proposal: ${proposalId}`);
    const approval = this.approvals.get(proposalId);

    // Governance: no APPROVE_ONCE -> zero writes.
    if (!approval || approval.decision !== "APPROVE_ONCE") {
      const runId = `run-${++this.seq}`;
      const rejected: RemediationRun = {
        runId,
        proposalId,
        findingId: proposal.findingId,
        state: approval?.decision === "REJECT" ? "REJECTED" : "PROPOSED",
        mode: this.mode,
        evidence: [
          { kind: "NOTE", at: this.clock(), mode: this.mode, summary: "Execution refused: no APPROVE_ONCE decision. Zero writes performed." },
        ],
      };
      this.runs.set(runId, rejected);
      return rejected;
    }

    const runId = `run-${++this.seq}`;
    const at = this.clock();
    const run: RemediationRun = {
      runId,
      proposalId,
      findingId: proposal.findingId,
      state: "VERIFIED",
      mode: this.mode,
      providerExecutionId: `mock-exec-${runId}`,
      startedAt: at,
      finishedAt: at,
      evidence: [
        { kind: "PROPOSAL", at, mode: this.mode, summary: proposal.summary },
        { kind: "APPROVAL", at, mode: this.mode, summary: `APPROVE_ONCE by ${approval.actorClass}` },
        { kind: "EXECUTION", at, mode: this.mode, summary: `Applied ${proposal.capabilityId} (mock)` },
        { kind: "PROVIDER_READBACK", at, mode: this.mode, summary: "Provider readback: change present (mock)" },
        { kind: "COMPLIANCE_READBACK", at, mode: this.mode, summary: "Compliance readback: NON_COMPLIANT -> COMPLIANT (mock)" },
      ],
    };
    this.runs.set(runId, run);
    return run;
  }

  async getRun(runId: string): Promise<RemediationRun | undefined> {
    return this.runs.get(runId);
  }
}
