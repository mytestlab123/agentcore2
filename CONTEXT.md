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
- Next: M1/M2 Amplify preview deploy (>=3 stable URLs), then M3 real Harness
  agent. Unattended Home Crew execution still waits on the repo-access
  Task Runner smoke test.
- Independent mock-first work available while gated: M3/M4 backend adapter
  scaffolding (a `LiveAgentCoreBackend` seam implementation + recorded-mode
  fixtures) can be written and unit-tested without cloud.

## Evidence

- Lane report: `RESULT.md`.
- Contract regression: `npm test -w @agentcore2/contracts`.
