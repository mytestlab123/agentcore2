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
- No AWS resources created yet. LAB identity confirmed: account 672172129528,
  role `u-tf-role/dev`, region `ap-southeast-1`. Spend so far: $0.
- `.kiro/` remains untracked local state and is excluded from commits; only
  JS build-output ignores were added to `.gitignore`.

## Next Action

- BLOCKED on Amit's decision (hard gate): grant the LAB role scoped Amplify
  permissions, or approve an alternative static host (S3/CloudFront). This gates
  stable preview URLs (M1/M2 acceptance) and the live M3/M4 milestones.
- Independent mock-first work available while gated: M3/M4 backend adapter
  scaffolding (a `LiveAgentCoreBackend` seam implementation + recorded-mode
  fixtures) can be written and unit-tested without cloud.

## Evidence

- Lane report: `RESULT.md`.
- Contract regression: `npm test -w @agentcore2/contracts`.
