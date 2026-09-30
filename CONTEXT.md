# Context

Status: ACTIVE — Issue #3 Roadmap Autopilot
Updated: 2026-09-30

## Current Truth

- Repository: `mytestlab123/agentcore2`.
- Owning roadmap: Issue #3.
- Execution mode: M1-M5 continuously without repeated `go`.
- Preferred delivery: one large long-lived implementation PR with milestone checkpoints.
- Development order: mock-first -> 3+ Amplify previews -> real AgentCore Harness -> one bounded LAB remediation -> closeout/harvest.
- Crew is not currently an execution dependency. Use local Crew only after durable evidence says exactly `CREW_READY=YES`.
- Until then, Kiro Web may execute independently. System-level Crew/Kiro/Codex/MCP configuration belongs in `amitkarpe/dotfiles`.

## Safety Boundary

- Personal disposable LAB only.
- Primary Region: `ap-southeast-1`.
- Verify runtime account allowlist and remaining cost envelope before the first AWS write.
- No office/GovTech/GCC/PROD/cross-account scope.
- Public repository: no secrets, private findings, internal exports, or confidential architecture.

## Active Outcome

Build multiple operator experiences over one shared governed compliance/remediation backend, then prove the smallest real AgentCore remediation path with approval, deterministic execution, provider readback, compliance convergence, evidence, and cleanup.

## Continuation

Read `AGENTS.md`, this file, `SPEC.md`, Issue #3, and the active implementation PR. Use GitHub as durable truth and continue until Issue #3 acceptance or a hard stop gate.
