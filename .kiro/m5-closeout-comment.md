## M5 Closeout — evidence, lessons, cost & harvest (task 12/15)

Repository/GitHub work + read-only cost/resource inventory. **PR #5 NOT merged. No AWS resource deleted.**

Full evidence doc committed to the branch: `docs/m5-closeout.md`.

### Repository validation (this task, from the Task Runner worktree)
- `npm run build` — PASS (contracts + Preview A/B/C static bundles).
- `npm test` — **22/22 PASS**, 0 fail / 0 skipped.
- `npm run typecheck` — PASS across all workspaces, 0 errors.

### Stable preview URLs — status: NONE (deploy BLOCKED)
- Authoritative read-only check: `aws amplify list-apps` ⇒ `[]`. No Issue #3-owned Amplify apps ⇒ no stable URLs, no deployed revision, no live badge to capture, and **no live screenshots or winning-UI decision possible**.
- Preview A/B/C build locally and each renders a **truthful MOCK** execution-mode badge (enum also carries RECORDED / LIVE_LAB, never synthesized).

### Truthful agent catalogue
- `@agentcore2/contracts` shared domain + `ComplianceBackend` seam — built, 22/22 tests.
- `MockComplianceBackend` (+ target-authorization guard) — working.
- `LiveAgentCoreBackend` + `wireLiveOrFallbackToMock()` — LIVE wiring seam; unwired ⇒ fails closed to MOCK.
- CLI/SDK headless channel (`cli-channel.ts` + `run-cli.ts`) — working, drives the SAME governed flow as the GUI.
- Preview A (Config-style baseline) / B (contextual copilot) / C (generative action cards) — built locally.
- **Deployed AgentCore runtime (Issue #3-owned): NONE** (deploy BLOCKED — no harness container).
- **Disposable S3 canary: NONE** (create-bucket denied at approval gate).
- Pre-existing account resources (5 AgentCore runtimes, 18 S3 buckets, ECR repos) are NOT Issue #3-owned — inventoried read-only, OFF-LIMITS, never modified.

### Cost / usage summary
- **Total AWS spend for the entire run: $0.00.** Every bounded write was either BLOCKED upstream or denied at the approval gate. Read-only API calls only; local Node build/test compute.

### Lessons (condensed)
- Approval gates are load-bearing: denied create calls were recorded + stopped at $0, never rewritten to dodge the check.
- "No artifact" beats "wrong artifact": runtime deploy stopped rather than reuse an off-limits image/role.
- One seam, many channels: CLI reached governance parity with the GUI with no duplicated code.
- Fail closed on partial evidence: LIVE_LAB only when runtime+model+session+tool are ALL present.

### Cleanup / retention plan
- **Nothing to delete.** No Issue #3-owned disposable resource was created; task 13 will confirm-and-noop (empty Amplify list, canary `head-bucket` ⇒ 404) and record the zero-delete result.
- Retain repo, PR #5, and all `docs/*.md` evidence in Git as the durable audit trail.

### Harvest recommendations (to unblock live proof)
1. Author + push an Issue #3-owned harness container to a new ECR repo, `create-agent-runtime`, capture ids.
2. Inject ids as Preview A `VITE_AGENTCORE_*` ⇒ seam flips to LIVE_LAB; run the bounded live invocation.
3. Approve the bounded `create-bucket` (name/tags already selected) ⇒ run approved deterministic remediation + CLI channel against the real target.
4. Re-run Amplify deploy for ≥3 stable URLs, re-verify served revision + rendered badge; then screenshots + winning-UI decision become possible.

**Verdict:** M5 closeout ASSEMBLED (PASS for the in-scope deliverable). Live-cloud deliverables (stable URLs, deployed runtime, canary, screenshots, winning-UI) remain BLOCKED exactly as recorded in tasks 5–11 — reported truthfully, at $0, with replay-ready unblock steps.
