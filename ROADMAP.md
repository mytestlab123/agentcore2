# Roadmap

## Now

- **M5 closeout assembled (task 12/15): PASS (in-scope deliverable).** Full
  build + 22/22 tests + typecheck green from the Task Runner worktree.
  Read-only inventory re-confirms $0 footprint (Amplify apps `[]`, 5 pre-existing
  off-limits runtimes, canary `head-bucket` ⇒ 404). Evidence, 5-minute demo
  script, truthful agent catalogue, lessons, cost, cleanup/retention and harvest
  recommendations packaged in `docs/m5-closeout.md`. Live-cloud deliverables
  (stable URLs, runtime, canary, screenshots, winning-UI) remain BLOCKED exactly
  as recorded in tasks 5–11. PR #5 NOT merged; no AWS deletion.
- **Wire preview to real agent (task 8/15): PARTIAL.** The durable LIVE wiring
  seam is delivered — `LiveAgentCoreBackend` + `wireLiveOrFallbackToMock()` in
  `@agentcore2/contracts`, Preview A wired to it, 13/13 tests pass. A LIVE_LAB
  badge is only ever shown with complete real runtime/model/session/tool
  evidence; with none deployed the adapter is unwired → MOCK, so synthetic
  success can never be shown as live. The **bounded LIVE invocation is BLOCKED**:
  task 7 produced no Issue #3-owned runtime to invoke. Evidence:
  `docs/wire-and-verify-live-agent.md`.
- **Verify Preview A/B/C URLs (task 6/15): BLOCKED.** No Amplify apps exist
  (`aws amplify list-apps` = `[]`), so there are no stable URLs, no deployed
  revision, and no live badge to verify. Upstream deploy (task 5) did not
  perform the AWS write. Evidence: `docs/preview-verification.md`.
- Preview A/B/C are built locally, each emitting a truthful **MOCK**
  execution-mode badge. No winning UI declared (premature).

## Next

- Unblock task 7: author + push an Issue #3-owned harness container to a new
  ECR repo, `create-agent-runtime`, capture runtime/model/session/tool ids.
- Inject those ids as Preview A `VITE_AGENTCORE_*` env → seam flips to LIVE LAB,
  then perform the bounded model + registered-tool invocation (re-run task 8).
- Re-run the Preview A/B/C Amplify deploy to create Issue #3-owned apps and
  capture ≥3 stable URLs, then re-verify served revision + rendered badge.

## Later

- M4/M5: governed live invocation, disposable S3 canary + remediation proof,
  non-GUI channel, closeout evidence, and exact-resource cleanup.
