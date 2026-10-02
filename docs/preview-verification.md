# Preview A/B/C URL Verification — Task 6/15 (`verify-preview-evidence`)

Status: **BLOCKED — no preview URLs to verify (upstream deploy did not run)**
Date: 2026-10-01
Issue: https://github.com/mytestlab123/agentcore2/issues/3
PR #5: https://github.com/mytestlab123/agentcore2/pull/5 (draft; do not merge)

This task is a READ-ONLY verification of the deployed Preview A/B/C: stable
URLs, deployed revision/build identity, and visible execution-mode badges. It
does not create resources and does not declare a winning UI.

## Guard checks (PASS)

- `TASK_WORKDIR` (`pwd -P`): `/home/dev/git/.kirocrew-work/plan_1790794585945378650`
  — a Kiro Crew task worktree, NOT `/home/dev/git/agentcore2`. Did not `cd` to source.
- Current branch: `kirocrew/task/plan_1790794585945378650`.
- Origin: `https://github.com/mytestlab123/agentcore2.git`.

## Verification result: BLOCKED

The dependency task (5/15 `deploy-previews-a-b-c`) was supposed to create new
Issue #3-owned Amplify apps and deploy Preview A/B/C, capturing stable URLs.
That AWS write did not happen — the recorded task-5 output was a git-publish
checkpoint doc only, not an Amplify deployment.

Because there is nothing deployed, there are **no stable URLs to open, no
deployed revision to identify, and no live execution-mode badge to screenshot**.
This is recorded as BLOCKED rather than fabricating URLs or evidence.

### Authoritative check — no Amplify resources exist

- `aws amplify list-apps --profile amit --region ap-southeast-1` → `[]`
  (zero Amplify apps in the account; no Issue #3-owned preview app present).

## What IS verifiable locally (build identity + badge)

Read-only inspection of the built static bundles in the worktree confirms the
three previews are the artifacts the deploy would have shipped:

| Preview | Bundle title (`dist/index.html`)                          | JS bundle           | Badge default |
|---------|-----------------------------------------------------------|---------------------|---------------|
| A       | AgentCore Lab — Preview A (Config-style baseline)         | `index-B5BxY_hq.js` | MOCK          |
| B       | AgentCore Lab — Preview B (Contextual Copilot)           | `index-BEtyl8XB.js` | MOCK          |
| C       | AgentCore Lab — Preview C (Generative action cards)      | `index-DWQ6c_tM.js` | MOCK          |

- Built from repo revision `765479d` (current PR #5 head / Task Runner HEAD).
- Each JS bundle contains the `MOCK` execution-mode badge string; the badge
  component's CSS carries the full `MOCK` / `RECORDED` / `LIVE` mode enum, so
  the badge can truthfully represent whichever data path is active. With no
  live backend wired, the active/default mode is **MOCK** for all three — no
  preview can misrepresent synthetic data as live.
- These are build-identity facts only. They are NOT a substitute for verifying
  a live deployed URL, its served revision, and its rendered badge — that
  verification remains outstanding until previews are actually deployed.

## Operator comparison notes

No new comparison is produced here. The prior build-time observations remain
the only substantiated comparison and stand unchanged:
`docs/preview-comparison.md`. No winning UI is declared (correct — premature
without live URLs and a real agent trace in M3/M4).

## Next action (for the deploy owner, not this task)

1. Re-run the Preview A/B/C Amplify deploy (task 5 scope) to create the
   Issue #3-owned apps and capture ≥3 stable URLs.
2. Then re-run this verification against the live URLs: open each, record the
   served revision/build id, screenshot the rendered MOCK badge, and append the
   URLs + evidence here and to `ROADMAP.md`.
