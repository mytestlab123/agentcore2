# M5 Closeout — Evidence, Lessons, Cost & Harvest

Task 12/15 (`assemble-m5-closeout`). Repository/GitHub work + read-only
cost/resource inventory only. **No PR #5 merge. No AWS resource deletion.**

- Run date: 2026-10-01 (UTC 2026-09-30 19:xx)
- Execution host: Home Crew, Task Runner worktree
  `/home/dev/git/.kirocrew-work/plan_1790794585945378650` on branch
  `kirocrew/task/plan_1790794585945378650` (WORKDIR guard verified with
  `pwd -P`; never touched source-only `/home/dev/git/agentcore2`).
- Source of truth: https://github.com/mytestlab123/agentcore2/issues/3 · PR #5
- Runtime identity (read-only re-verified this task): `iam::<ACCOUNT_ID>:user/amit`,
  region `ap-southeast-1`. Account ID kept out of the public repo.

## 1. Repository validation (this task, from the Task Runner worktree)

- `npm run build` — PASS. `@agentcore2/contracts` compiled; **all three**
  preview bundles built to static output (Preview A/B/C ~150–155 kB JS, gzip
  ~49–50 kB).
- `npm test` — **22/22 PASS** (contract governance + target-authorization +
  CLI-channel suites), 0 fail / 0 skipped.
- `npm run typecheck` — PASS across all workspaces (contracts, preview-a/b/c),
  0 errors.
- Determinism: root `test`/`typecheck` build `@agentcore2/contracts` first, so
  validation is green from a clean checkout regardless of entry point.

## 2. Stable preview URLs — status: NONE (deploy BLOCKED)

Authoritative read-only check this task:
`aws amplify list-apps --profile amit --region ap-southeast-1` ⇒ `[]`.

- There are **no Issue #3-owned Amplify apps**, therefore **no stable preview
  URLs**, no deployed revision, and no live-served badge to capture.
- The Amplify deploy (task 5/15) did not perform the AWS write (recorded
  BLOCKED); URL verification (task 6/15) confirmed BLOCKED against the empty
  app list. Evidence: `docs/preview-verification.md`.
- What DOES exist: Preview A/B/C build locally from the shared
  `ComplianceBackend` seam and each renders a **truthful MOCK** execution-mode
  badge. No screenshots of live URLs can be produced because no URL exists;
  producing a fabricated "live" screenshot would violate the truthfulness
  guardrail.

## 3. Five-minute demo script (local, MOCK mode — honest to current state)

1. `npm install && npm run build` (0:00–1:00) — one monorepo, contracts +
   three preview UIs build clean.
2. Preview A — Config-style compliance baseline (1:00–2:00): open the built
   `apps/preview-a` bundle; point out the **MOCK** badge (badge enum also
   carries RECORDED / LIVE_LAB, never synthesized).
3. Preview B — contextual copilot, and Preview C — generative action cards
   (2:00–3:00): same seam, three distinct interaction models; see
   `docs/preview-comparison.md`.
4. Governance walk-through (3:00–4:00): `npm test` — show
   `execute WITHOUT any decision => zero writes`, `REJECT => zero writes`,
   `unauthorized target => zero writes even under APPROVE_ONCE`, and
   provider-readback kept SEPARATE from compliance-readback.
5. Non-GUI parity (4:00–5:00): `node packages/contracts/dist/run-cli.js` and
   `--reject` — the headless channel drives the SAME governed flow and SAME
   evidence model as the GUI. See `docs/prove-non-gui-channel.md`.

## 4. Truthful agent catalogue (what actually exists)

| Component | Kind | State | Evidence |
|---|---|---|---|
| `@agentcore2/contracts` | shared domain + `ComplianceBackend` seam | Built, 22/22 tests | source + tests |
| `MockComplianceBackend` | governed mock backend (+target-auth guard) | Working | `target-authorization.test.ts` |
| `LiveAgentCoreBackend` + `wireLiveOrFallbackToMock()` | LIVE wiring seam | Built, unwired ⇒ fails closed to MOCK | `docs/wire-and-verify-live-agent.md` |
| CLI/SDK channel (`cli-channel.ts` + `run-cli.ts`) | headless governed channel | Working, 5 proof tests | `docs/prove-non-gui-channel.md` |
| Preview A / B / C | static UIs on the seam | Built locally, MOCK badge | `docs/preview-comparison.md` |
| Deployed AgentCore runtime (Issue #3-owned) | — | **NONE** (deploy BLOCKED) | `docs/agentcore-s3-specialist-deploy.md` |
| Disposable S3 canary | — | **NONE** (create denied at gate) | `docs/provision-disposable-s3-canary.md` |

Pre-existing account resources (5 AgentCore runtimes, 18 S3 buckets, ECR repos)
are **NOT Issue #3-owned** — inventoried read-only, treated OFF-LIMITS, never
modified.

## 5. Architecture

Single npm-workspaces monorepo. `@agentcore2/contracts` owns the domain model
and the `ComplianceBackend` seam (single governed execution path:
propose → decision gate → target-authorization → execute → provider readback +
compliance readback → convergence + audit). Both the GUI previews and the
headless CLI channel drive that one seam, so governance is identical across
channels. `LiveAgentCoreBackend` is the only place cloud is reached; unwired it
fails closed to MOCK so synthetic success can never render as live. Details:
`ARCHITECTURE.md`.

## 6. Preview comparison

Three distinct interaction models over one backend seam — Config-style baseline
(A), contextual copilot (B), generative action cards (C). No winning UI is
declared: that decision needs live URLs + operator trials, which are BLOCKED.
Full comparison: `docs/preview-comparison.md`.

## 7. Lessons

### Ops lessons
- **Approval gates are load-bearing, not obstacles.** create-bucket (task 9)
  and create-agent-runtime (task 7) were denied at the interactive gate. The
  correct move each time was to record identity/name/tags/exact replay commands
  and STOP at $0 — not to rewrite the call to dodge the check.
- **"No artifact" beats "wrong artifact."** M3 runtime deploy needs an Issue
  #3-owned harness container (Dockerfile + ECR image); none was authored, so
  the runtime step correctly stopped rather than reuse an off-limits image/role.
- **Verify against authority, not intent.** Preview URL verification read the
  live `list-apps` result (`[]`) instead of assuming task 5 had deployed.

### Developer lessons
- **One seam, many channels.** Putting the whole governed flow behind
  `ComplianceBackend` let the CLI channel reach LIVE parity with the GUI with no
  duplicated governance code.
- **Fail closed on partial evidence.** LIVE_LAB is emitted only when
  runtimeArn+modelId+sessionId+toolId are ALL present; any blank ⇒ MOCK.
- **Determinism first.** Building contracts before preview typecheck/test
  removed a clean-checkout ordering flake.

## 8. Cost / usage summary

- **Total AWS spend for the entire run: $0.00.** No Amplify app, no AgentCore
  runtime, no S3 canary, no ECR image, no execution role was created — every
  bounded write was either BLOCKED upstream or denied at the approval gate.
- Read-only API calls only (STS, Amplify ListApps, AgentCore
  ListAgentRuntimes, S3 HeadBucket/ListBuckets, Bedrock ListFoundationModels):
  negligible/no charge.
- Compute: local Node build/test on the Home Crew host; no cloud compute
  provisioned.

## 9. Cleanup / retention plan

- **Nothing to delete.** No Issue #3-owned disposable AWS resource was created,
  so task 13/15 cleanup will confirm-and-noop (re-verify $0 footprint: empty
  Amplify app list, canary `head-bucket` ⇒ 404, no new runtimes/roles), delete
  nothing pre-existing, and record the zero-delete result.
- Retention: keep the repo, PR #5, and all `docs/*.md` evidence in Git as the
  durable audit trail. `.kiro/` stays untracked local state.
- The exact, replay-ready create commands (with tags) for the canary and
  runtime are preserved in their step docs so a future authorized run can
  execute them unchanged.

## 10. Harvest recommendations (to unblock M3–M5 live proof)

1. Author an Issue #3-owned harness container (Dockerfile) and push to a **new**
   ECR repo; then `create-agent-runtime` with that `containerUri` and capture
   runtime/model/session/tool ids.
2. Inject those ids as Preview A `VITE_AGENTCORE_*` env ⇒ seam flips to LIVE_LAB;
   perform the bounded model + registered-tool invocation (re-run task 8 live).
3. Approve the bounded `create-bucket` for the tagged disposable canary
   (name/tags already selected, collision-free) ⇒ then run the approved
   deterministic remediation (task 10 live half) and re-run the CLI channel
   against the real target (task 11 live half).
4. Re-run the Amplify deploy to create ≥3 Issue #3-owned apps, capture stable
   URLs, and re-verify served revision + rendered badge — then screenshots and
   a winning-UI decision become possible.

## Verdict

**M5 closeout ASSEMBLED (PASS for the deliverable that was in scope).** All
code-side artifacts (three previews, governed seam, LIVE wiring seam, CLI
channel) are built, typechecked and covered by 22/22 tests. The live-cloud
deliverables (stable URLs, deployed runtime, canary, screenshots, winning-UI)
remain **BLOCKED** exactly as recorded in tasks 5–11 — reported truthfully, at
$0, with replay-ready unblock steps. No PR #5 merge; no AWS deletion.
