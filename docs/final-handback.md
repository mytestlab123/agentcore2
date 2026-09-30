# Final M1–M5 Handback — Issue #3 (`agentcore2`)

Task 15/15 (`final-handback`). **No AWS mutation. PR #5 NOT merged.**

- Run date: 2026-10-01 (UTC 2026-09-30 20:xx)
- Execution host: Home Crew, Task Runner worktree
  `/home/dev/git/.kirocrew-work/plan_1790794585945378650` on branch
  `kirocrew/task/plan_1790794585945378650` (WORKDIR guard verified with
  `pwd -P`; source-only `/home/dev/git/agentcore2` never touched).
- Runtime identity: IAM `user/amit`, region `ap-southeast-1` (account ID kept
  out of the public repo).

## Final repository validation (this task)

- `npm run build` — **PASS**. `@agentcore2/contracts` + Preview A/B/C static
  bundles (Preview A ~152.8 kB JS / gzip ~49.3 kB).
- `npm test` — **22/22 PASS**, 0 fail / 0 skipped.
- `npm run typecheck` — **PASS** across all workspaces, 0 errors.

## PR #5

- [PR #5](https://github.com/mytestlab123/agentcore2/pull/5) — **OPEN (draft),
  NOT merged**, head branch `issue-3/agentcore-lab`. Do not merge automatically;
  do not write to `cloudscape-remediation`.
- All final Crew commits fast-forwarded (non-force) onto the PR head.

## Preview URLs

- **NONE** — stable preview URLs are BLOCKED. Authoritative read-only check:
  `aws amplify list-apps --profile amit --region ap-southeast-1` ⇒ `[]`. No
  Issue #3-owned Amplify apps, so no deployed revision, no live badge, and no
  live screenshots or winning-UI decision are possible.
- What exists: Preview A/B/C build locally from the shared `ComplianceBackend`
  seam and each renders a **truthful MOCK** execution-mode badge.

## M1–M5 PASS / BLOCKED

| Milestone | Scope | Status |
|---|---|---|
| **M1** | Monorepo, `@agentcore2/contracts` seam + `MockComplianceBackend`, Preview A baseline | **PASS** (code/build/tests) |
| **M2** | Preview B (copilot) + Preview C (action cards) on the same seam; comparison doc | **PASS** (code/build); stable URLs **BLOCKED** |
| **M3** | Real Issue #3-owned AgentCore Harness S3 specialist runtime | **BLOCKED** — no harness container/ECR image authored; `create-agent-runtime` needs a `containerUri`. LIVE wiring seam delivered & fails closed to MOCK |
| **M4** | Bounded live invocation + governed canary remediation (reject-zero-write + approved deterministic remediation) | **PARTIAL/PASS**: reject-zero-write **PROVEN** deterministically in-code; live remediation **BLOCKED** (no canary — create-bucket denied at gate) |
| **M5** | Closeout: evidence, demo, lessons, cost, cleanup, harvest | **PASS** (assembled); live-cloud deliverables **BLOCKED** as recorded |

## Real AgentCore proof

- **No live AgentCore runtime was created or invoked** (M3 BLOCKED). Truthful
  status, not a fabricated LIVE.
- Durable seam delivered: `LiveAgentCoreBackend` + `wireLiveOrFallbackToMock()`
  in `@agentcore2/contracts`; Preview A selects its backend via the seam from
  `VITE_AGENTCORE_*` env. `LIVE_LAB` is emitted **only** when
  runtimeArn+modelId+sessionId+toolId are ALL present; any blank ⇒ discarded,
  unwired adapter fails closed to MOCK (`RuntimeNotWiredError`). Synthetic
  success can never render as live. Evidence: `docs/wire-and-verify-live-agent.md`.

## Real remediation proof

- **Reject-zero-write governance PROVEN deterministically in-code.**
  `MockComplianceBackend` gained an `isAuthorizedTarget(target, proposal)` guard;
  `execute()` refuses an unauthorized/unproven-ownership target BEFORE any write
  even under a valid `APPROVE_ONCE`, recording a zero-write `REJECTED` run (no
  `providerExecutionId`, no execution/readback/convergence evidence). Tests:
  `packages/contracts/src/target-authorization.test.ts` — unauthorized-target ⇒
  zero writes; REJECT ⇒ zero writes; authorized-target convergence with provider
  readback kept SEPARATE from compliance readback; runId resumability.
- Approved **live** remediation half **BLOCKED**: task 9 never created the canary
  (create-bucket denied at the interactive gate; $0), so there is no Issue
  #3-owned target to prove ownership of — the explicit stop condition fired.
  Evidence: `docs/prove-governed-canary-remediation.md`.

## Non-GUI proof

- **PROVEN** — headless CLI/SDK channel (`packages/contracts/src/cli-channel.ts`
  `invokeViaCli` + `formatCliResult` + runnable `run-cli.ts`,
  `node dist/run-cli.js [--reject]`) drives the **SAME** `ComplianceBackend`
  seam, **SAME** governed flow, **SAME** evidence model as the GUI previews. 5
  proof tests (`cli-channel.test.ts`): authorized-target convergence with
  separated readbacks, REJECT ⇒ zero-writes, unauthorized-target ⇒ zero-writes,
  refuse-to-invent-a-target, secret-free audit line. Truthful `MOCK` mode.
  Evidence: `docs/prove-non-gui-channel.md`.

## Spend / cleanup / retention

- **Total AWS spend for the entire run: $0.00.** No Amplify app, AgentCore
  runtime, S3 canary, ECR image or execution role was created — every bounded
  write was BLOCKED upstream or denied at the approval gate. Read-only API calls
  only; local Node build/test compute.
- **Cleanup: confirm-and-noop (zero deletions).** Deletion allowlist built from
  durable evidence is EMPTY; canary `head-bucket` ⇒ 404, `amplify list-apps` ⇒
  `[]`, run-created runtimes ⇒ `[]`. No pre-existing (OFF-LIMITS) resource
  touched. Evidence: `docs/cleanup-issue3-disposables.md`.
- **Retention:** repo, PR #5, and all `docs/*.md` evidence kept in Git as the
  durable audit trail; `.kiro/` stays untracked local state. Exact replay-ready
  create commands (canary + runtime, with tags) preserved in their step docs.

## Strongest lessons (10)

1. **Approval gates are load-bearing, not obstacles.** Denied `create-bucket`
   (task 9) and `create-agent-runtime` (task 7) were recorded (identity, name,
   tags, exact replay) and stopped at $0 — never rewritten to dodge the check.
2. **"No artifact" beats "wrong artifact."** M3 stopped rather than reuse an
   off-limits image/role to fabricate a runtime.
3. **Verify against authority, not intent.** Preview URL verification read the
   live `list-apps` result (`[]`) instead of assuming an upstream deploy ran.
4. **One seam, many channels.** The whole governed flow behind
   `ComplianceBackend` let the CLI channel reach GUI parity with zero duplicated
   governance code.
5. **Fail closed on partial evidence.** `LIVE_LAB` only when
   runtime+model+session+tool are ALL present; any blank ⇒ MOCK.
6. **Keep provider readback SEPARATE from compliance readback.** Convergence is
   only asserted when both agree, preventing a provider "success" from masking a
   compliance miss.
7. **Determinism first.** Building `@agentcore2/contracts` before preview
   typecheck/test removed a clean-checkout ordering flake.
8. **Truthfulness is a hard guardrail.** No fabricated "live" screenshot or
   badge was ever produced for a resource that does not exist.
9. **Pre-existing account resources are OFF-LIMITS by default.** 5 AgentCore
   runtimes / 18 S3 buckets / ECR repos were inventoried read-only and never
   modified because none are Issue #3-owned.
10. **WORKDIR discipline.** All work stayed in the Crew task worktree; the
    source-only checkout was never entered, avoiding cross-tree contamination.

## Exact reusable pieces for `cloudscape-remediation`

1. **`ComplianceBackend` seam** (`@agentcore2/contracts`) — the single governed
   execution path (propose → decision gate → target-authorization → execute →
   provider readback + compliance readback → convergence + audit). Reuse as-is.
2. **`isAuthorizedTarget` target-authorization guard** + its test matrix
   (`target-authorization.test.ts`) — drop-in reject-zero-write enforcement for
   any remediation target.
3. **`LiveAgentCoreBackend` + `wireLiveOrFallbackToMock()`** — LIVE wiring seam
   that fails closed to MOCK on partial evidence; inject real
   runtime/model/session/tool ids to flip to LIVE_LAB.
4. **Headless CLI/SDK channel** (`cli-channel.ts` + `run-cli.ts`) — proves
   non-GUI parity; reuse for CI/automation-driven remediation.
5. **Determinism fix** — root `test`/`typecheck` build contracts first; carry
   into any multi-workspace remediation repo.

## Verdict

M1/M2 (code/build) and M5 (closeout) **PASS**; non-GUI and reject-zero-write
governance **PROVEN**. M3 (real runtime), the live invocation, the canary, live
remediation, stable preview URLs, screenshots and a winning-UI decision remain
**BLOCKED** exactly as recorded in tasks 5–11 — reported truthfully, at $0, with
replay-ready unblock steps in the step docs. PR #5 left OPEN and unmerged.
