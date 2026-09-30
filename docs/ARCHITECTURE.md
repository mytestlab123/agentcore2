# Architecture

Mock-first experiment lab that proves many Amplify operator GUIs can share one
governed compliance/remediation backend seam. Delivered at M1.

## The seam: replaceable GUI vs durable backend

- `packages/contracts` (`@agentcore2/contracts`) is the ONE durable contract:
  domain types (`Finding`, `Remediation`, `Evidence`/`EvidenceEvent`,
  `ExecutionState`, `AgentDefinition`, `LabMode`), the `BackendAdapter`
  interface, a `MockBackendAdapter`, a deterministic synthetic dataset
  generator (5000 findings, seeded, no AWS calls), and the `AGENT_CATALOGUE`.
- `apps/*` are disposable UI experiments. They depend on the contract via
  `"@agentcore2/contracts": "workspace:*"` and consume the `BackendAdapter`
  interface only. They never copy or redefine domain logic.
- `BackendAdapter` is the mock <-> real swap point. Today `MockBackendAdapter`
  serves synthetic data; later a real AgentCore adapter implements the same
  interface and only the adapter wiring changes (in Preview A that is the single
  file `apps/preview-a/src/backend.ts`).

## Data flow (prose diagram)

```
Finding -> BackendAdapter -> (MockBackendAdapter now / real AgentCore later) -> EvidenceEvent[]
```

A UI reads findings via `adapter.listFindings(query)`, proposes a fix via
`previewFix`, and gates execution through `requestRemediation(id, {approve})`.
The adapter returns an `ExecutionState` and appends an evidence timeline. Swapping
the adapter changes the backing brain without touching any UI component.

## MOCK / RECORDED / LIVE LAB labeling

`adapter.mode()` returns a `LabMode` of `MOCK`, `RECORDED`, or `LIVE_LAB`. Every
preview MUST render this prominently (Preview A uses a `LabModeBadge` in the
header). At M1 the mode is always `MOCK`. This keeps synthetic runs from ever
being mistaken for live evidence.

## Agent catalogue

`AGENT_CATALOGUE` lists 7 planned specialists: S3 SSL, S3 logging, S3 backup,
Security Group specialist, and EBS backup specialist (readiness `MOCK`), plus a
finding triage/explanation assistant and an evidence/report assistant (readiness
`PLANNED`). Each agent exposes capabilities whose ids match `Remediation.capabilityId`.
No agent is `LIVE` at M1.

## Provider readback is separate from Config convergence

The evidence timeline keeps `PROVIDER_READBACK` and `CONFIG_CONVERGENCE` as two
DISTINCT event kinds. Provider readback confirms the target service applied the
change; Config/compliance convergence confirms the compliance state re-evaluated
to compliant. A full approved remediation produces:

```
DETECTED -> EXPLAINED -> FIX_PROPOSED -> APPROVED -> EXECUTED
  -> PROVIDER_READBACK -> CONFIG_CONVERGENCE -> VERIFIED
```

A rejected remediation (`approve: false`) mutates nothing and appends a single
`REJECTED` event.
