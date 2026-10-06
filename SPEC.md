# Specification

## Active Issue #12 failure-artifact follow-up (2026-10-06)

Amit authorized one cloud-only synthetic browser failure proof: reuse the smoke
and existing CI, check capture/sanitization, distinguish fixture exit 1 from job
failure, and preserve normal assertions. Necessary harness/tests may be published
in one draft PR. No merge before independent review. No AWS/provider calls,
credentials/security/settings changes, deployments, external activation, new
costs or external Sites changes. No local browser installation is performed.
The Issue #16 acceptance record below remains historical and unchanged.

Status: Issue #16 source/offline acceptance complete (2026-10-06)

PR #17 merged at `3213ec56f6204dbe31fa883a7d9de746e5ca4186` after
independent review and exact-head CI PASS. Amit's later source-only merge
authority superseded the earlier no-merge restriction for this acceptance.
The bounded milestone below is retained as its historical scope. No AWS,
identity/credential/OIDC/security changes, deployment, external activation,
material cost or Sites work is authorized. Live acceptance remains NOT_RUN;
the private packet in `docs/cloud-deployment-readiness.md` is still required.

## Current bounded milestone

Authority: Issue #16 and Amit's delegated continuation; parent #14 remains
preparation. Base: `41bd3a3e0dc6bacbd5db7318fbab32f38487be98` (merged PR #15).
Reuse helper/preflight and CI for versioned receipts, offline inspection and
observation-only recovery, proven with synthetic uncertain lifecycle tests and
zero duplicate writes. One draft PR, full applicable tests and exact-head CI.
No AWS calls, IAM/OIDC changes, secrets handling, deployment dispatch, live
Preview B, Home/office execution, activation or merge. Private identity/target,
budget/lifecycle and one live run remain separate owner gates. See
`docs/cloud-deployment-recovery.md` and the parent readiness packet.

The Issue #3 specification below is historical and grants no authority to this
milestone.

## Problem

Prove that one governed AgentCore/remediation backend can power multiple,
meaningfully different operator UIs for compliance findings, and learn which
interactions help an Ops engineer investigate and safely remediate.

## Scope

Detailed roadmap (M1–M5) lives in the source of truth:
https://github.com/mytestlab123/agentcore2/issues/3

This repo is a rapid experimentation LAB. Deliver a shared mock-first contract
layer and Preview A first, then ≥3 Amplify previews, one real AgentCore Harness
S3 specialist, and one governed disposable-S3-canary remediation, with truthful
evidence and a harvest list for `cloudscape-remediation`.

## MUST

- Keep one shared contract (`@agentcore2/contracts`) powering UI and backends.
- Show a truthful MOCK / RECORDED / LIVE_LAB badge on every preview.
- Enforce the governed flow: Approve Once / Reject, where REJECT yields zero
  writes; keep provider readback distinct from compliance convergence.
- Keep mock/recorded modes working with no AWS credentials.
- Tag/name/TTL every AWS resource per `~/.agent/AWS.md`; keep LAB spend near the
  ~USD 10 envelope.

## MUST NOT

- Commit secrets, credentials, real account IDs, or private/CloudSCAPE data.
- Write to `amitkarpe/cloudscape-remediation`.
- Touch office/GovTech/PROD/cross-account resources, or move sensitive
  execution cross-Region.
- Let the agent invent and run arbitrary destructive commands; remediation is
  deterministic and capability-registered.
- Track `.kiro/` local state or add a broad `.kiro/` ignore rule.

## Closeout authority

Amit explicitly authorized merging the completed, validated Issue #3 / Issue #9
repository work into `main` on 2026-10-02. That repository merge does not grant
new AWS, IAM, hosting, model, Site-publication, PROD, office or cross-account authority.

## Verification

- `npm test -w @agentcore2/contracts` proves the governed seam (reject = zero
  writes, approve = converge, runs resumable).
- `npm run build -w @agentcore2/preview-a` produces a static preview bundle.
- Live milestones (M3/M4) require fresh provider + compliance readback and a
  captured execution/session/trace id — screenshots alone are not proof.

## Stop Gates

The Issue #3 hard gates: office/GovTech/PROD/cross-account access; destructive
changes to non-canary resources; broad AdministratorAccess or unsafe PassRole;
secret publication or credential rotation; anonymous/public mutation; material
recurring spend beyond the envelope; cross-Region execution with residency
impact; unrelated architecture expansion; or a failed safety/identity check.
