# Architecture — AgentCore Compliance Lab

**Principle: backend capability is the value; UI is the experiment.**
The durable asset is the shared contract + backend seam. Every preview UI is a
disposable experiment plugged into that seam.

```
                 +--------------------------------------+
   Preview A ----|                                      |
   Preview B ----|   ComplianceBackend  (the seam)      |
   Preview C ----|                                      |
   Preview D ----|   listFindings / propose / decide /  |
                 |   execute / getRun / listAgents      |
                 +------------------+-------------------+
                                    |
              +---------------------+----------------------+
              |                     |                      |
       MockComplianceBackend   RecordedBackend       LiveAgentCoreBackend
          (MOCK)                (RECORDED)              (LIVE_LAB)
       no AWS needed          captured fixtures      real Harness agent + SSM/API
```

Each response carries an `ExecutionMode` (`MOCK` / `RECORDED` / `LIVE_LAB`) so
the UI badge is always truthful. A UI cannot tell mock from live except by that
mode — which is exactly the point.

## Packages

- `packages/contracts` — **durable.** Domain types (`Finding`, `ResourceRef`,
  `RemediationCapability`, `RemediationProposal`, `RemediationRun`,
  `EvidenceEntry`), the `ComplianceBackend` interface, the agent catalogue type,
  the synthetic dataset generator, and `MockComplianceBackend`. Harvest target
  for `cloudscape-remediation`.
- `apps/preview-a` — **disposable.** Config/Security-Hub-style operator baseline
  (little/no AI). First preview; proves the mechanism.

## Governed remediation model (from Issue #3)

```
finding
  -> agent understands context
  -> chooses a REGISTERED capability (never invents shell commands)
  -> server validates policy / exact target
  -> Approve Once / Reject      (REJECT => zero writes)
  -> deterministic execution (SSM Automation / AWS API / Lambda)
  -> provider readback          (distinct from...)
  -> compliance convergence readback
  -> evidence (durable, resumable by runId)
```

`MockComplianceBackend` enforces this today: a run without `APPROVE_ONCE`
performs zero writes and carries no provider execution id. See
`packages/contracts/src/mock-backend.test.ts`.

## Preview / branch strategy

- One long-lived implementation PR from `issue-3/agentcore-lab` (Issue #3).
- Amplify preview branches may be separate deployment branches; the owning
  engineering work stays under this Issue and PR.
- `amplify.yml` maps `appRoot` per preview app. MOCK previews need no AWS creds.

## Commands

```bash
npm install                              # install workspaces
npm run build -w @agentcore2/contracts   # build the durable contract layer
npm test  -w @agentcore2/contracts       # governed-seam regression tests
npm run build -w @agentcore2/preview-a   # build the static preview bundle
npm run dev   -w @agentcore2/preview-a   # local dev server (127.0.0.1:5173)
```

## Safety posture

- Public repo: no secrets, no real account IDs, no private findings. Mock data
  uses a placeholder account (`000000000000`).
- LAB only, `ap-southeast-1`. Live proof (M3/M4) uses only clearly owned
  disposable canaries, resolved from runtime config — never hard-coded.
