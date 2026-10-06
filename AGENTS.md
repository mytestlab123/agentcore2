# AGENTS.md

## Bootstrap / Recovery Order

Use this order only for cold start, recovery, materially changed governing context, or stale/incomplete/contradictory state. There is currently no active task to continue.

1. `AGENTS.md`
2. `CONTEXT.md`
3. `SPEC.md` when work changes a trusted contract, release, environment, or
   external system.

## Rules

- Follow KISS: one problem, one happy path, one command, one proof, one result.
- Preserve existing work. Do not revert unrelated changes or use destructive
  Git commands without explicit approval.
- Keep durable code, decisions, and reports in Git. Do not put secrets,
  credentials, large dependencies, or copied repositories in temporary paths.
- Create a temporary directory or worktree only when isolation is needed.
  A terminal result or `.done` marker alone never authorizes deletion. Remove
  an exact worktree or temporary directory only with owner/controller
  acceptance and explicit cleanup authority; preserve work that is active,
  held, dirty, or unknown.
- Update `CONTEXT.md` when current truth or the next action changes.
- Keep `SPEC.md` small. A worker proceeds inside an approved SPEC and stops on
  a safety, scope, authorization, or evidence failure.
- When a future objective is named, use its owning Issue/PR, latest relevant authorized delta, and current HEAD for warm continuation; do not invent a task from repository history.

## Testing / Demo Policy

- Canonical test-economy policy: `amitkarpe/dotfiles/agent/.agent/TESTING.md`.
- Default to **zero new tests**. Run the smallest existing validation that can
  prove or disprove the change; stop once the changed behavior is proven.
- This repository is primarily a MOCK/demo/learning lab unless an owning Issue
  explicitly says otherwise. Do not schedule deep or repeated E2E for each small
  demo/UI fix.
- Full E2E is normally a **major-PR finish gate** when one PR closes roughly
  **5+ milestones**, or when a concrete high-risk/security regression justifies
  focused end-to-end evidence.
- Prefer focused smoke/state/safety checks for small increments.
- **Mobile is out of scope for this project.** Do not create mobile-specific QA,
  viewport gates, responsive acceptance criteria, or mobile fixes unless Amit
  explicitly changes this rule later. Historical mobile evidence may remain but
  is not an ongoing requirement.

## Global Guidance

When available, use `~/.agent/CORE.md` as the shared machine-wide operating
contract. `~/.codex/AGENTS.md` is a Codex-specific adapter only. Agent OS is
reusable guidance, never automatic project authority; local repository rules
and approved SPECs remain authoritative.
