# Prove Governed Canary Remediation (task 10/15)

Agent: `prove-governed-canary-remediation`
Date: 2026-10-01 (UTC 2026-09-30 19:35)
Scope: BOUNDED AWS MUTATION under the single overnight personal-LAB approval.

## Summary

- **Reject-zero-write half: PROVEN (deterministic, in-code).** Unauthorized /
  unproven-ownership target => ZERO writes, even under a valid `APPROVE_ONCE`;
  `REJECT` => zero writes. Locked in by tests against the real
  `ComplianceBackend` seam a live adapter implements.
- **Approved live-remediation half: BLOCKED (safe progress stop).** No Issue
  #3-owned canary exists to remediate — task 9 could not create it
  (`create-bucket` denied at the approval gate; `$0`). The task's own stop
  condition — *"Stop if the target cannot be proven Issue #3-owned"* — fires,
  so no bounded AWS mutation, provider readback, or compliance convergence was
  performed against a real target. No AWS write; `$0`.

## Workdir / identity guard (satisfied)

- `TASK_WORKDIR` (pwd -P): `/home/dev/git/.kirocrew-work/plan_1790794585945378650`
  — a Kiro Crew task worktree, NOT `/home/dev/git/agentcore2`. No `cd` to the
  source repo occurred.
- Branch: `kirocrew/task/plan_1790794585945378650`.
- Read-only AWS re-verification of the target's existence was attempted this
  turn (`sts get-caller-identity`, `head-bucket`, `list-buckets` filtered to
  `issue3-canary*`); the calls were **denied at the interactive approval gate**,
  consistent with task 9. The gate denial is respected as a policy decision and
  was not rewritten to dodge the check.

## Why the live remediation half cannot run

Task 10 targets *"the exact Issue #3-owned canary created by the immediately
preceding task."* Task 9's evidence (`docs/provision-disposable-s3-canary.md`)
records that the single `s3api create-bucket` was DENIED at the approval gate
and **no bucket was created** (post-deny `head-bucket` → 404; `$0`). Therefore:

- There is no resource to prove Issue #3-owned → the explicit stop condition
  fires.
- `NON_COMPLIANT -> proposal -> APPROVE_ONCE -> deterministic remediation ->
  provider readback -> compliance convergence` has no live target and no
  operator `Approve Once` to consume, so it cannot be executed truthfully.

Fabricating a run id, readback, or convergence for a non-existent bucket would
violate the truthful-mode invariant the whole roadmap enforces. Halted instead.

## What WAS proven this task (deterministic governance, no cloud)

The governance a live canary run would depend on is proven directly against the
`ComplianceBackend` seam (mock + live adapter share it), so it is real code, not
a description:

1. **Target-authorization guard added** to `MockComplianceBackend`
   (`packages/contracts/src/mock-backend.ts`): an optional
   `isAuthorizedTarget(target, proposal)` predicate. When it returns false,
   `execute()` refuses BEFORE any write — even with a valid `APPROVE_ONCE` —
   and records a zero-write `REJECTED` run carrying `reason: "unauthorized-target"`
   and NO `providerExecutionId` and NO execution/readback/convergence evidence.
   Default-allow when omitted (back-compat; existing previews/tests unchanged).

2. **Proof tests** (`packages/contracts/src/target-authorization.test.ts`, 4
   new; 17/17 suite total green):
   - `unauthorized target => ZERO writes even under APPROVE_ONCE` — the exact
     reject-zero-write invariant this task names, target scope.
   - `REJECT decision => ZERO writes` — decision-scope reject-zero-write.
   - `authorized target converges NON_COMPLIANT -> COMPLIANT with SEPARATE
     provider + compliance readback` — proves the governed remediation shape and
     that **provider readback is kept a distinct, earlier evidence entry from
     compliance convergence** (as the task requires).
   - `run is durable/resumable by runId after simulated session loss` — the
     `runId` is the persisted handle a live run would retry against.

## AWS-native identifiers

None persisted: no live run occurred, so there is no SSM Automation execution
id / API call id / run id to record. The durable `runId` handle exists only in
the in-memory governed flow and is exercised by the resumability test.

## Guardrails honored

- No AWS resource created, modified, or deleted; `$0`.
- Gate denial respected, not circumvented.
- No `cd` to the source repo; stayed in the Crew task worktree.
- No IAM / principal permission changes; no cross-account assumption.
- Provider readback kept separate from compliance convergence (enforced by
  test).

## Next action

When task 9's `create-bucket` is approved and the tagged disposable canary
exists, re-run this task: read back its tags to prove Issue #3 ownership, then
drive one bounded `APPROVE_ONCE` remediation (re-enable the S3 Public Access
Block) via the governed backend, capturing the provider readback and compliance
convergence as separate evidence entries with their AWS-native execution ids.
