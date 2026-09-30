# agentcore2

Mock-first experiment lab that proves multiple Amplify operator GUIs can share
one governed AgentCore compliance/remediation backend seam (Issue #3).

## Start Here

1. Read `AGENTS.md` for repository rules.
2. Read `CONTEXT.md` for current truth and the next action.
3. Read `SPEC.md` before work that changes a trusted contract.

## Commands

Run from the repo root. No AWS credentials are required (M1 is entirely
mock/synthetic).

```sh
pnpm install                              # install + link the workspace
pnpm -r build                             # build shared contracts, then previews
pnpm -r test                              # run all package tests (Vitest)
pnpm --filter @agentcore2/preview-a dev   # Preview A at http://localhost:5173
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — shared contract + BackendAdapter
  seam, MOCK/RECORDED/LIVE LAB labeling, agent catalogue, provider readback vs
  Config convergence.
- [docs/PREVIEW_STRATEGY.md](docs/PREVIEW_STRATEGY.md) — Amplify branch/preview
  strategy and how to add a new preview without copying the app.
