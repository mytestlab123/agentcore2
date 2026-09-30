/**
 * MockBackendAdapter — an in-memory {@link BackendAdapter} over a deterministic
 * synthetic dataset. No AWS calls, no credentials.
 *
 * Remediation is gated by approval (SPEC.md MUST):
 * - approve:false => REJECTED execution, a single REJECTED evidence event, and
 *   ZERO mutation (no EXECUTED / readback / convergence / verified events).
 * - approve:true  => SUCCEEDED execution with a persisted, retrievable
 *   executionId and the full evidence chain
 *   EXECUTED -> PROVIDER_READBACK -> CONFIG_CONVERGENCE -> VERIFIED, keeping
 *   provider readback and Config convergence as SEPARATE events.
 */
import type {
  BackendAdapter,
  FindingQuery,
  Paginated,
  RemediationRequest,
} from "../adapter.js";
import type {
  EvidenceEvent,
  ExecutionState,
  Finding,
  LabMode,
  Remediation,
} from "../domain.js";
import {
  DEFAULT_SEED,
  generateDataset,
  type GenerateDatasetOptions,
  type MockDataset,
} from "./dataset.js";

const DEFAULT_PAGE_SIZE = 25;

/** Options for constructing a {@link MockBackendAdapter}. */
export interface MockBackendAdapterOptions extends GenerateDatasetOptions {
  /** Provide a pre-generated dataset instead of generating a fresh one. */
  dataset?: MockDataset;
}

export class MockBackendAdapter implements BackendAdapter {
  private readonly dataset: MockDataset;
  private readonly findingsById: Map<string, Finding>;
  private readonly executionsById = new Map<string, ExecutionState>();
  /** Deterministic counter feeding generated execution ids. */
  private executionCounter = 0;

  constructor(options: MockBackendAdapterOptions = {}) {
    this.dataset = options.dataset ?? generateDataset(options);
    this.findingsById = new Map(
      this.dataset.findings.map((f) => [f.id, f]),
    );
  }

  mode(): LabMode {
    return "MOCK";
  }

  async listFindings(query: FindingQuery = {}): Promise<Paginated<Finding>> {
    const search = query.search?.trim().toLowerCase();

    const filtered = this.dataset.findings.filter((f) => {
      if (query.complianceStatus && f.complianceStatus !== query.complianceStatus) {
        return false;
      }
      if (query.severity && f.severity !== query.severity) return false;
      if (query.service && f.service !== query.service) return false;
      if (query.resourceType && f.resourceType !== query.resourceType) {
        return false;
      }
      if (search) {
        const haystack = `${f.title} ${f.resourceId} ${f.ruleId}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const page = Math.max(1, query.page ?? 1);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }

  async getFinding(id: string): Promise<Finding | null> {
    return this.findingsById.get(id) ?? null;
  }

  async getRemediationForFinding(
    findingId: string,
  ): Promise<Remediation | null> {
    return this.dataset.remediationsByFindingId.get(findingId) ?? null;
  }

  async previewFix(findingId: string): Promise<Remediation> {
    const remediation = this.dataset.remediationsByFindingId.get(findingId);
    if (!remediation) {
      throw new Error(`No remediation available for finding ${findingId}`);
    }
    // Deterministic: previewing is read-only and returns the same proposal.
    return remediation;
  }

  async requestRemediation(
    findingId: string,
    request: RemediationRequest,
  ): Promise<ExecutionState> {
    const finding = this.findingsById.get(findingId);
    if (!finding) {
      throw new Error(`Unknown finding ${findingId}`);
    }
    const remediation = this.dataset.remediationsByFindingId.get(findingId);
    if (!remediation) {
      throw new Error(`No remediation available for finding ${findingId}`);
    }

    const executionId = this.nextExecutionId();
    // Deterministic timestamp derived from finding + counter, no Date.now().
    const now = new Date(
      Date.UTC(2024, 5, 1, 0, 0, 0) + this.executionCounter * 1000,
    ).toISOString();

    const timeline = this.dataset.evidenceByFindingId.get(findingId) ?? [];

    if (!request.approve) {
      // Approval gate: rejected. Zero mutation. Only a REJECTED event.
      const execution: ExecutionState = {
        executionId,
        findingId,
        remediationId: remediation.id,
        status: "REJECTED",
        mode: "MOCK",
        createdAt: now,
        updatedAt: now,
        approved: false,
      };
      this.executionsById.set(executionId, execution);

      timeline.push({
        id: `${findingId}-ev-${timeline.length}`,
        findingId,
        remediationId: remediation.id,
        timestamp: now,
        kind: "REJECTED",
        actor: "human-approver",
        summary: "Remediation rejected at approval gate; no action taken.",
        executionId,
      });
      this.dataset.evidenceByFindingId.set(findingId, timeline);
      return execution;
    }

    // Approved: full deterministic evidence chain. Provider readback and Config
    // convergence are SEPARATE events per SPEC.md.
    const execution: ExecutionState = {
      executionId,
      findingId,
      remediationId: remediation.id,
      status: "SUCCEEDED",
      mode: "MOCK",
      createdAt: now,
      updatedAt: now,
      approved: true,
    };
    this.executionsById.set(executionId, execution);

    const chain: Array<{ kind: EvidenceEvent["kind"]; actor: string; summary: string }> = [
      {
        kind: "APPROVED",
        actor: "human-approver",
        summary: "Remediation approved at approval gate.",
      },
      {
        kind: "EXECUTED",
        actor: remediation.capabilityId,
        summary: `Executed remediation: ${remediation.proposedActionSummary}`,
      },
      {
        kind: "PROVIDER_READBACK",
        actor: "provider-api",
        summary: `Provider API confirms target ${remediation.targetResourceId} now matches desired state.`,
      },
      {
        kind: "CONFIG_CONVERGENCE",
        actor: "config-recorder",
        summary: `AWS Config re-evaluation reports ${finding.ruleId} COMPLIANT.`,
      },
      {
        kind: "VERIFIED",
        actor: "agent-evidence-report",
        summary: "Provider readback and Config convergence agree; remediation verified.",
      },
    ];

    chain.forEach((entry, idx) => {
      const ts = new Date(
        Date.parse(now) + (idx + 1) * 1000,
      ).toISOString();
      timeline.push({
        id: `${findingId}-ev-${timeline.length}`,
        findingId,
        remediationId: remediation.id,
        timestamp: ts,
        kind: entry.kind,
        actor: entry.actor,
        summary: entry.summary,
        executionId,
      });
    });
    this.dataset.evidenceByFindingId.set(findingId, timeline);

    return execution;
  }

  async getExecution(executionId: string): Promise<ExecutionState | null> {
    return this.executionsById.get(executionId) ?? null;
  }

  async getEvidenceTimeline(findingId: string): Promise<EvidenceEvent[]> {
    // Return a copy so callers cannot mutate internal state.
    return [...(this.dataset.evidenceByFindingId.get(findingId) ?? [])];
  }

  private nextExecutionId(): string {
    this.executionCounter += 1;
    return `exec-${this.executionCounter.toString().padStart(8, "0")}`;
  }
}
