/**
 * BackendAdapter — the single seam between preview apps and a backend.
 *
 * The MockBackendAdapter implements this today. Later milestones swap in a real
 * AgentCore adapter that implements the exact same interface, so preview apps
 * never change when the backend becomes live.
 */
import type {
  ComplianceStatus,
  EvidenceEvent,
  ExecutionState,
  Finding,
  LabMode,
  Remediation,
  ServiceName,
  Severity,
} from "./domain.js";

/** Filters + pagination controls for listing findings. */
export interface FindingQuery {
  complianceStatus?: ComplianceStatus;
  severity?: Severity;
  service?: ServiceName;
  resourceType?: string;
  /** Free-text search over title / resourceId / ruleId. */
  search?: string;
  /** 1-based page number. Defaults to 1. */
  page?: number;
  /** Page size. Defaults to an adapter-defined value. */
  pageSize?: number;
}

/** A page of results plus the totals needed to drive UI pagination. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Options for {@link BackendAdapter.requestRemediation}. */
export interface RemediationRequest {
  /** Human approval gate. false => deterministic REJECTED, zero mutation. */
  approve: boolean;
}

/**
 * The backend seam. Every method is async so the mock and a real remote
 * backend are interchangeable.
 */
export interface BackendAdapter {
  /** Lab state this adapter operates in (drives the LabModeBadge). */
  mode(): LabMode;

  listFindings(query?: FindingQuery): Promise<Paginated<Finding>>;
  getFinding(id: string): Promise<Finding | null>;

  getRemediationForFinding(findingId: string): Promise<Remediation | null>;
  previewFix(findingId: string): Promise<Remediation>;

  /**
   * Request remediation, gated by approval.
   * - approve:false => REJECTED ExecutionState, no mutation, REJECTED event.
   * - approve:true  => SUCCEEDED ExecutionState with a persisted executionId
   *   and the full EXECUTED -> PROVIDER_READBACK -> CONFIG_CONVERGENCE ->
   *   VERIFIED evidence chain.
   */
  requestRemediation(
    findingId: string,
    request: RemediationRequest,
  ): Promise<ExecutionState>;

  getExecution(executionId: string): Promise<ExecutionState | null>;
  getEvidenceTimeline(findingId: string): Promise<EvidenceEvent[]>;
}
