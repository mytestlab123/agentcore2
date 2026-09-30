# Overnight Live-LAB Run — Single Human Approval Gate

Status: **PENDING HUMAN APPROVAL**
Task: 2/15 — `authorize-one-overnight-live-lab-run`
Issue: https://github.com/mytestlab123/agentcore2/issues/3
Primary PR: https://github.com/mytestlab123/agentcore2/pull/5 (do not merge)
Date recorded: 2026-10-01

## Purpose

This is the ONE human gate for the entire bounded overnight run. All
subsequent AWS-write tasks (Groups 4–13) run unattended under Issue #3
standing authority ONLY after a human grants this approval. An autonomous
agent MUST NOT self-approve this gate — self-grant is an explicit hard stop.

## Preconditions (from task 1 preflight, must already be true)

- Execution host: Home Crew (not office-laptop Crew).
- Source repo: `/home/dev/git/agentcore2`, origin
  `https://github.com/mytestlab123/agentcore2.git` (source-only, never `cd`).
- Task worktree: `/home/dev/git/.kirocrew-work/plan_1790794585945378650`,
  branch `kirocrew/task/plan_1790794585945378650`.
- PR #5 open, head branch `issue-3/agentcore-lab`; Task Runner HEAD based on
  PR #5 head (`PR5_BASE_SHA` recorded in preflight evidence).
- Runtime identity: IAM user `amit` via the `amit` profile, region
  `ap-southeast-1` (account ID kept in host config, not this repo).
- Read-only probes pass: Amplify ListApps, AgentCore ListAgentRuntimes,
  Bedrock ListFoundationModels, S3 ListBuckets.

## THIS APPROVAL AUTHORIZES (Issue #3 personal-LAB scope only)

1. Repository work on PR #5 (fast-forward publish of Crew task commits).
2. Creation/update of NEW Issue #3-owned Amplify preview resources (A/B/C).
3. Creation of ONE NEW Issue #3-owned AgentCore Harness S3 specialist/runtime.
4. Creation of only the NEW least-privilege service/runtime IAM role(s)
   STRICTLY required by that Issue #3-owned runtime — no edits to any
   pre-existing IAM identity/policy, and NO permission self-grant.
5. Creation of ONE NEW disposable Issue #3-owned S3 canary.
6. Deterministic remediation ONLY of that canary.
7. Cleanup ONLY of resources created by this run and explicitly marked
   disposable.

## THIS APPROVAL DOES NOT AUTHORIZE

- Touching any pre-existing AgentCore runtime, bucket, IAM user/role/policy,
  or unrelated resource.
- IAM self-grant, permission expansion, cross-account work, or
  office/GovTech/PROD.
- Public anonymous mutation endpoints.
- Spend beyond the existing ~USD 10 envelope.
- Force-push, history rewrite, merge of PR #5, or a competing implementation PR.

## Hard Stops (abort immediately if any occur)

- Identity mismatch (caller account/region not the approved personal LAB).
- Target-ownership uncertainty (resource not provably Issue #3-owned).
- IAM expansion or unsafe PassRole.
- Destructive action on any non-canary resource.
- Public exposure / anonymous mutation.
- Budget risk beyond the ~USD 10 envelope.

## Approval Record

- Approver: __________________ (human owner)
- Decision: [ ] APPROVED   [ ] REJECTED
- Timestamp: __________________
- Note: ______________________________________________________________

Until a human records APPROVED above, Groups 2–13 AWS-write tasks MUST NOT
proceed. This record is the audit trail for the single overnight gate.
