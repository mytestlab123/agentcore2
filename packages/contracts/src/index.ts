/**
 * @agentcore2/contracts — the one shared domain contract, backend seam,
 * deterministic mock dataset + adapter, and planned agent catalogue for the
 * AgentCore compliance-remediation experiment platform.
 */

// Domain contract (finding / remediation / evidence / execution / lab mode).
export type {
  LabMode,
  ComplianceStatus,
  Severity,
  ServiceName,
  Finding,
  Remediation,
  EvidenceKind,
  EvidenceEvent,
  Evidence,
  ExecutionStatus,
  ExecutionState,
} from "./domain.js";

// Backend adapter seam (mock <-> real AgentCore).
export type {
  BackendAdapter,
  FindingQuery,
  Paginated,
  RemediationRequest,
} from "./adapter.js";

// Mock dataset generator + seeded PRNG.
export {
  generateDataset,
  DEFAULT_DATASET_SIZE,
  DEFAULT_SEED,
  type MockDataset,
  type GenerateDatasetOptions,
} from "./mock/dataset.js";
export { SeededRandom } from "./mock/prng.js";

// Mock adapter.
export {
  MockBackendAdapter,
  type MockBackendAdapterOptions,
} from "./mock/adapter.js";

// Planned agent catalogue.
export {
  AGENT_CATALOGUE,
  findCapability,
  type PlannedRuntime,
  type AgentReadiness,
  type AgentCapability,
  type AgentDefinition,
} from "./agents/catalogue.js";
