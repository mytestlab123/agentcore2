# Specification

Status: approved (Issue #3 handoff, 2026-09-30)

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
- Merge the primary PR, or write to `amitkarpe/cloudscape-remediation`.
- Touch office/GovTech/PROD/cross-account resources, or move sensitive
  execution cross-Region.
- Let the agent invent and run arbitrary destructive commands; remediation is
  deterministic and capability-registered.
- Track `.kiro/` local state or add a broad `.kiro/` ignore rule.

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
