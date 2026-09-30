# Prove Non-GUI Channel (task 11/15)

Agent: `prove-non-gui-channel`
Date: 2026-10-01 (UTC 2026-09-30 19:41)
Scope: No new infrastructure, no new canary, no cloud mutation. `$0`.

## Summary

**PROVEN.** A second, headless (CLI/SDK) invocation channel drives the SAME
governed `ComplianceBackend` seam the GUI previews use, through the SAME flow
and the SAME evidence model — and is bound by the SAME governance by
construction, because both channels funnel through `backend.execute`. No new
backend, no extra infrastructure, no additional canary was created.

The bounded LIVE half (a real AWS mutation on the tagged canary) remains BLOCKED
for the same reason as tasks 8–10: task 9's `create-bucket` was denied at the
approval gate, so no Issue #3-owned canary exists to remediate. The non-GUI
channel is therefore proven against the MOCK backend, reporting a truthful
`MOCK` mode — it never fabricates `LIVE_LAB`.

## Workdir / identity guard (satisfied)

- `TASK_WORKDIR` (`pwd -P`): `/home/dev/git/.kirocrew-work/plan_1790794585945378650`
  — a Kiro Crew task worktree, NOT `/home/dev/git/agentcore2`. No `cd` to the
  source checkout occurred.
- Branch: `kirocrew/task/plan_1790794585945378650`. Clean tree at start.

## What was added

- `packages/contracts/src/cli-channel.ts` — the non-GUI channel:
  `invokeViaCli(backend, { findingQuery?|findingId?, decision, actorClass })`
  runs one governed remediation headlessly:
  `listFindings -> proposeRemediation -> decide -> execute -> evidence`.
  It reuses the SAME `RemediationRun` / `EvidenceEntry` model and the SAME
  bounded canary/remediation capability. `formatCliResult()` emits a secret-free
  one-line audit record. `NoMatchingFindingError` makes the channel refuse to
  invent a target.
- `packages/contracts/src/run-cli.ts` — a runnable headless entrypoint:
  `node dist/run-cli.js [--reject]`. No new infra; drives the MOCK backend.
- `packages/contracts/src/cli-channel.test.ts` — 5 governance-equivalence proofs.
- `packages/contracts/src/index.ts` — exports the channel (`cli-channel.js`).
  `run-cli.ts` is intentionally NOT exported (it is a bin with entry side
  effects, not library API).

## Proof (deterministic, no cloud)

Full suite green: **22/22** (`npm run contracts:test`; root `npm test` and
`npm run typecheck` also green across all workspaces).

New tests (`cli-channel.test.ts`) prove the headless channel is governed
identically to the GUI:

1. `non-GUI APPROVE_ONCE (authorized) converges with SEPARATE provider +
   compliance readback` — the happy path: `VERIFIED`, provider execution id
   present, provider readback a DISTINCT, earlier evidence entry than compliance
   convergence, run resumable by `runId`, truthful `MOCK` mode.
2. `non-GUI REJECT => ZERO writes` — decision-scope reject-zero-write over the
   CLI (`REJECTED`, no provider id, "zero writes" evidence).
3. `non-GUI APPROVE_ONCE against an UNAUTHORIZED target => ZERO writes` —
   reuses the EXACT canary-ownership guard task 10 proved for the GUI; even a
   valid `APPROVE_ONCE` writes nothing to a target the run does not own.
4. `non-GUI channel refuses to invent a target when no finding matches` —
   `NoMatchingFindingError`.
5. `formatCliResult is a secret-free, auditable one-liner`.

## Real headless invocations (this task)

```
$ node packages/contracts/dist/run-cli.js
[non-gui:cli] mode=MOCK finding=f-00000 proposal=prop-1 decision=APPROVE_ONCE \
  run=run-2 state=VERIFIED wrote=true providerExecutionId=mock-exec-run-2 \
  evidence=PROPOSAL>APPROVAL>EXECUTION>PROVIDER_READBACK>COMPLIANCE_READBACK   (exit 0)

$ node packages/contracts/dist/run-cli.js --reject
[non-gui:cli] mode=MOCK finding=f-00000 proposal=prop-1 decision=REJECT \
  run=run-2 state=REJECTED wrote=false providerExecutionId=none evidence=NOTE   (exit 0)
```

## AWS-native identifiers

None persisted: no live run occurred (LIVE half blocked; no canary). The
provider execution id shown is the MOCK backend's synthetic `mock-exec-*`,
truthfully labelled `MOCK`. A wired live adapter would surface a real
SSM Automation / API execution id here and report `LIVE_LAB`.

## Guardrails honored

- No AWS resource created, modified, or deleted; `$0`. No new canary.
- No new infrastructure — a pure library/CLI path over the existing seam.
- Truthful mode preserved: the CLI reports `backend.mode`, never a synthesized
  `LIVE_LAB`.
- No `cd` to the source repo; stayed in the Crew task worktree.

## Next action

When the tagged disposable canary exists (task 9 `create-bucket` approved), run
`invokeViaCli` against a wired `LiveAgentCoreBackend` with `findingId` set to the
canary's finding to perform the SAME governed remediation over the non-GUI
channel with real AWS-native execution ids and a `LIVE_LAB` mode — no code
change to the channel is required, only a live backend and an authorized target.
