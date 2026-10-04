# Specification

Status: Issue #14 repository-only deployment readiness approved (2026-10-03)

## Current bounded milestone

Authority: Issue #14 and Amit's delegated request after Issue #12 / merged PR #13.
Base: `098e0254c2d5167a985073f0dc40dccf731c183b`.
Reuse C1 static Amplify packaging/manual workflow and cloud verification CI.
Share fail-closed artifact, exact identity and isolated-target checks with the
existing deployment script; prove them offline and prepare the minimal owner
approval packet. Publish one draft PR and verify exact-head CI.
No AWS calls/mutations, IAM/OIDC changes, secrets handling, deployment dispatch,
private identity publication, live Preview B changes, Home/office work or merge.
Preparation PASS is not live acceptance. Provider verification, exact private
identity/trust approval, execution branch/revision activation and one deployment
are separate later gates. See `docs/cloud-deployment-readiness.md`.

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
