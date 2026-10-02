/**
 * Non-GUI invocation channel (Issue #3, task 11).
 *
 * The GUI channel is a preview UI (React) that drives the `ComplianceBackend`
 * seam. This module proves a SECOND, headless channel — a CLI/SDK path — that
 * drives the SAME seam through the SAME governed flow, with NO new
 * infrastructure and NO new canary:
 *
 *   listFindings -> proposeRemediation -> decide(APPROVE_ONCE|REJECT)
 *   -> execute -> (provider readback, compliance convergence) -> evidence
 *
 * It reuses the SAME evidence model (`RemediationRun` / `EvidenceEntry`) and the
 * SAME bounded canary/remediation capability the GUI uses. Because both channels
 * call one interface, the governance (reject-zero-write, exact-target
 * authorization, truthful mode) is identical by construction — a headless caller
 * cannot bypass the approval or ownership gate the GUI enforces.
 *
 * TRUTHFUL-MODE INVARIANT: the channel's result mode is whatever the backend
 * reports (`backend.mode`). Against the MOCK backend it is `MOCK`; against a
 * wired live adapter it would be `LIVE_LAB`. The CLI never fabricates a mode and
 * never dresses a mock run as live.
 *
 * DURABLE asset — candidate for harvest into cloudscape-remediation.
 */

import type { ComplianceBackend } from "./backend.js";
import type { ExecutionMode, FindingQuery } from "./finding.js";
import type { ApprovalDecision, RemediationRun } from "./remediation.js";

/** How the operator's decision is supplied to a headless run. */
export interface CliInvocationRequest {
  /** Optional filter to select the finding to remediate. Defaults to first NON_COMPLIANT S3 finding. */
  findingQuery?: FindingQuery;
  /** Explicit finding id; when set it wins over `findingQuery`. */
  findingId?: string;
  /** The governed decision the headless operator supplies. Required — never defaulted to APPROVE. */
  decision: ApprovalDecision;
  /** Caller identity CLASS (e.g. "lab-operator-cli"), never raw credentials. */
  actorClass: string;
}

/** The structured, auditable result of one non-GUI invocation. */
export interface CliInvocationResult {
  channel: "cli";
  /** Truthful mode, taken from the backend — never synthesized. */
  mode: ExecutionMode;
  findingId: string;
  proposalId: string;
  decision: ApprovalDecision;
  run: RemediationRun;
  /** True only when a real, converged remediation occurred (VERIFIED + provider id). */
  wrote: boolean;
}

/** Raised when no finding matches the request — the CLI refuses to invent a target. */
export class NoMatchingFindingError extends Error {
  constructor(detail: string) {
    super(`Non-GUI channel: no finding to remediate (${detail}). Refusing to invent a target.`);
    this.name = "NoMatchingFindingError";
  }
}

const DEFAULT_QUERY: FindingQuery = { status: "NON_COMPLIANT", resourceType: "AWS::S3::Bucket" };

/**
 * Run ONE governed remediation over the CLI channel against the given backend.
 *
 * This is the whole non-GUI path: it selects a finding, proposes an exact-target
 * remediation, records the operator's decision, executes through the governed
 * backend, and returns the durable run + evidence. Governance is the backend's —
 * a REJECT or an unauthorized target yields a zero-write REJECTED run here just
 * as it does in the GUI, because both go through `backend.execute`.
 */
export async function invokeViaCli(
  backend: ComplianceBackend,
  req: CliInvocationRequest,
): Promise<CliInvocationResult> {
  // 1. Select the exact finding (explicit id wins; else first match of the query).
  let findingId = req.findingId;
  if (!findingId) {
    const matches = await backend.listFindings(req.findingQuery ?? DEFAULT_QUERY);
    const first = matches[0];
    if (!first) {
      throw new NoMatchingFindingError(JSON.stringify(req.findingQuery ?? DEFAULT_QUERY));
    }
    findingId = first.id;
  } else {
    const exists = await backend.getFinding(findingId);
    if (!exists) throw new NoMatchingFindingError(`unknown finding id ${findingId}`);
  }

  // 2. Propose an exact-target remediation through the same seam the GUI uses.
  const proposal = await backend.proposeRemediation(findingId);

  // 3. Record the governed decision. The CLI NEVER defaults this to APPROVE.
  await backend.decide(proposal.proposalId, req.decision, req.actorClass);

  // 4. Execute. The backend enforces reject-zero-write + exact-target ownership.
  const run = await backend.execute(proposal.proposalId);

  const wrote = run.state === "VERIFIED" && Boolean(run.providerExecutionId);

  return {
    channel: "cli",
    mode: backend.mode,
    findingId,
    proposalId: proposal.proposalId,
    decision: req.decision,
    run,
    wrote,
  };
}

/** Human-readable, secret-free one-line summary of a CLI invocation (for logs / stdout). */
export function formatCliResult(r: CliInvocationResult): string {
  const providerId = r.run.providerExecutionId ?? "none";
  return (
    `[non-gui:${r.channel}] mode=${r.mode} finding=${r.findingId} ` +
    `proposal=${r.proposalId} decision=${r.decision} run=${r.run.runId} ` +
    `state=${r.run.state} wrote=${r.wrote} providerExecutionId=${providerId} ` +
    `evidence=${r.run.evidence.map((e) => e.kind).join(">")}`
  );
}
