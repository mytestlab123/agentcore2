/**
 * The single seam between Preview A and its backend.
 *
 * Today this is the MockBackendAdapter from @agentcore2/contracts (5000
 * deterministic synthetic findings, no AWS calls, no credentials). When a real
 * AgentCore adapter exists it is swapped in HERE and nowhere else — every
 * component consumes the BackendAdapter interface, never a concrete adapter.
 */
import { MockBackendAdapter, type BackendAdapter } from "@agentcore2/contracts";

let adapter: BackendAdapter | null = null;

/** Returns the process-wide BackendAdapter, constructing it once. */
export function getBackend(): BackendAdapter {
  if (adapter === null) {
    adapter = new MockBackendAdapter();
  }
  return adapter;
}
