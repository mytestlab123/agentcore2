# Context

Status: active — executing Issue #3 (M1–M5 autonomous roadmap)

Source of truth: https://github.com/mytestlab123/agentcore2/issues/3

## Current Truth

- Branch `issue-3/agentcore-lab` off `main` (f70102e0). Primary PR (draft):
  https://github.com/mytestlab123/agentcore2/pull/5 — do not merge; do not
  write to `cloudscape-remediation`.
- M1 delivered: npm-workspaces monorepo; `@agentcore2/contracts` shared domain
  + `ComplianceBackend` seam + synthetic dataset + `MockComplianceBackend`
  (governed flow, 6 passing tests); `apps/preview-a` Config-style baseline
  builds to a static bundle with a truthful MOCK badge. `amplify.yml` +
  `ARCHITECTURE.md` establish the build/preview convention.
- M2 delivered (code/build): `apps/preview-b` (contextual copilot) and
  `apps/preview-c` (generative action cards) build on the same seam — three
  distinct interaction models; `docs/preview-comparison.md` written; `amplify.yml`
  covers all three. Stable preview URLs remain BLOCKED on Amplify permission.
- No AWS resources created yet. Spend so far: $0.
- Runtime AWS identity (owner decision, 2026-10-01): IAM user `amit` via the
  local `amit` profile on the Home Crew host, region `ap-southeast-1`.
  `u-tf-role/dev` is no longer used. The account ID lives in host runtime
  config, not in this public repo.
- Owner-approved exception: `amit` has `AdministratorAccess`. Agent guardrails
  still apply: verify caller account + region before every write; never modify
  its own or any existing principal's permissions; issue-owned least-privilege
  execution roles only; no cross-account role assumption; touch only
  issue-owned, tagged, disposable resources; stop before material spend.
- Pre-existing resources in the account (e.g. 5 AgentCore runtimes, 18 S3
  buckets as of 2026-10-01) are not issue-owned: read-only, never modify.
- `.kiro/` remains untracked local state and is excluded from commits; only
  JS build-output ignores were added to `.gitignore`.

## Next Action

- Permission gate RESOLVED by owner decision (use `amit`). Read-only probes
  under `amit` in `ap-southeast-1` pass: Amplify `ListApps`, AgentCore
  `ListAgentRuntimes`, Bedrock `ListFoundationModels`, S3 `ListBuckets`.
- Repo state validated from the Task Runner worktree (2026-10-01): `npm install`
  (74 pkgs), `npm run build` (contracts + Preview A/B/C static bundles),
  `npm test` (6/6 contract regression), `npm run typecheck` (all workspaces, 0
  errors) all PASS. Fixed non-deterministic ordering: root `test`/`typecheck`
  now build `@agentcore2/contracts` first (its `dist/` provides the types the
  previews import), so validation is green from a clean checkout regardless of
  entry point. All three previews confirmed to depend only on the shared
  `ComplianceBackend` seam via `MockComplianceBackend`.
- Preview URL verification (task 6/15) run 2026-10-01: BLOCKED. Authoritative
  `aws amplify list-apps --profile amit --region ap-southeast-1` = `[]` — no
  Amplify apps exist, so no stable URLs, no deployed revision, and no live
  badge to verify. Upstream deploy (task 5) did not perform the AWS write.
  Locally, Preview A/B/C bundles are built from revision `765479d` and each
  emits a truthful MOCK badge (badge enum also carries RECORDED/LIVE). No
  winning UI declared. Evidence: `docs/preview-verification.md`.
- AgentCore S3 specialist deploy (task 7/15) run 2026-10-01: BLOCKED. Identity
  re-verified (`user/amit`, `ap-southeast-1`); 5 pre-existing runtimes and 3
  pre-existing ECR repos inventoried read-only and treated OFF-LIMITS. No
  deployable Issue #3-owned harness artifact exists: the worktree builds only
  static preview UIs + `@agentcore2/contracts`, with no agent container /
  Dockerfile / ECR image. `create-agent-runtime` needs a `containerUri`, so the
  bounded write cannot proceed without first authoring+publishing an Issue
  #3-owned harness image. Stopped rather than fabricate a runtime, reuse an
  off-limits image/role, or expand IAM. No AWS write; $0. Evidence:
  `docs/agentcore-s3-specialist-deploy.md`.
- Next: re-run M1/M2 Amplify preview deploy (>=3 stable URLs), then re-verify
  served revision + badge against live URLs, then M3 real Harness agent
  (requires authoring + pushing an Issue #3-owned harness container to a new
  ECR repo before any runtime deploy can occur).
- Wire preview to real agent (task 8/15) run 2026-10-01: PARTIAL. Durable LIVE
  wiring seam delivered — `LiveAgentCoreBackend` + `wireLiveOrFallbackToMock()`
  in `@agentcore2/contracts`; Preview A (`apps/preview-a/src/App.tsx`) now
  selects its backend via the seam, reading `VITE_AGENTCORE_*` env. A LIVE_LAB
  badge is emitted ONLY when all of runtimeArn+modelId+sessionId+toolId are
  present and non-blank; partial/blank evidence is discarded and an unwired
  adapter reports MOCK with every op failing closed (`RuntimeNotWiredError`), so
  synthetic success can never be shown as live. 13/13 tests pass (7 new
  invariant tests + 6 governance), build + typecheck green. Bounded LIVE
  invocation BLOCKED: no Issue #3-owned runtime exists (task 7 blocked; the 5
  account runtimes are pre-existing, OFF-LIMITS). Identity re-verified
  (`user/amit`, `ap-southeast-1`). No AWS write; no new infra; $0. Evidence:
  `docs/wire-and-verify-live-agent.md`.
- Independent mock-first work available while gated: M3/M4 backend adapter
  scaffolding (a `LiveAgentCoreBackend` seam implementation + recorded-mode
  fixtures) can be written and unit-tested without cloud.
- Disposable S3 canary (task 9/15) run 2026-10-01: BLOCKED (safe progress
  stop). Identity + region re-verified (`user/amit`, `ap-southeast-1`).
  Read-only inventory: 18 pre-existing buckets, none Issue #3-owned (all
  OFF-LIMITS). A collision-free canary name was selected
  (`issue3-canary-disposable-20260930193359-333438771545-ap-southeast-1`,
  `head-bucket` → 404) with full disposable/ownership tags planned and a single
  deliberate non-compliant control (S3 Public Access Block disabled). The
  bounded `create-bucket` call was DENIED at the interactive approval gate;
  respected as a policy decision, not rewritten to dodge the check. No AWS
  resource created (post-deny `head-bucket` → still 404); $0. Exact replay
  commands recorded. Evidence: `docs/provision-disposable-s3-canary.md`.
- Governed canary remediation (task 10/15) run 2026-10-01: SPLIT result.
  * Reject-zero-write half PROVEN deterministically in-code: added an optional
    `isAuthorizedTarget(target, proposal)` guard to `MockComplianceBackend`;
    `execute()` now refuses an unauthorized/unproven-ownership target BEFORE any
    write even under a valid `APPROVE_ONCE`, recording a zero-write `REJECTED`
    run (no `providerExecutionId`, no execution/readback/convergence evidence).
    New proof tests (`packages/contracts/src/target-authorization.test.ts`):
    unauthorized-target⇒zero-writes, REJECT⇒zero-writes, authorized-target
    convergence with provider readback kept SEPARATE from compliance
    convergence, and runId resumability. Suite 17/17 green; root build +
    typecheck + test green.
  * Approved live-remediation half BLOCKED (safe progress stop): task 9 never
    created the canary (create-bucket denied at gate; $0), so there is no Issue
    #3-owned target to prove ownership of and the explicit stop condition
    ("Stop if the target cannot be proven Issue #3-owned") fires. Read-only AWS
    re-verification this turn was also denied at the approval gate. No AWS
    write; $0. Evidence: `docs/prove-governed-canary-remediation.md`.

## Evidence

- Lane report: `RESULT.md`.
- Contract regression: `npm test -w @agentcore2/contracts`.
