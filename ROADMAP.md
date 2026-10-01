# Roadmap — current focused follow-up

F1–F5 PASS. The prior Crew roadmap state below is historical and superseded by
[focused proof and closeout](docs/focused-followup.md),
[live evidence](docs/focused-live-evidence.json) and [GUI proof](docs/focused-gui-proof.json).

- F1: Harness/container/governance source and current-tree account scrub.
- F2: one ARM64 image, narrow role and Harness/runtime; three real Nova/tool calls.
- F3: three stable Amplify previews with a model picker and input cost index;
  real-browser MOCK → authenticated LIVE LAB verification.
- F4: exact SSL-only canary; reject/unauthorized zero-write proof; approve once,
  native mutation ID, provider readback and distinct compliance evaluation.
- F5: same CLI/backend proof and resumable result, full validation, canary deletion,
  resource retention record and sanitized learning harvest. PR #5 stays draft/open.

Preview B v1.1 PASS under Issue #3 comment 5928077026; Contextual Copilot is now
the primary demo direction. Theme, fixability, remediation summary, evidence
timeline and private Windows tunnel proof are in
[v1.1 runbook](docs/preview-b-v1.1.md) and [evidence](docs/preview-b-v1.1-evidence.json).
Only existing B was redeployed (job 2, source e50e78d); A/C remain unchanged.
Next: G/Amit reviews v1.1 and retained resources; lifecycle review 2026-10-02.
No automatic merge or new cloud work is implied.

## Historical v4.2 Crew run

## Now

- **Disposable-resource cleanup (task 13/15): COMPLETE — confirm-and-noop.**
  Deletion allowlist built from durable evidence is EMPTY (every bounded AWS
  write in tasks 5/7/9/10 was BLOCKED, $0 footprint). Provider readback under
  `amit`/`ap-southeast-1`: disposable canary `head-bucket` ⇒ HTTP 404, run-tagged
  `list-buckets` ⇒ `[]`, `amplify list-apps` ⇒ `[]`, run-created AgentCore
  runtimes ⇒ `[]`. **Zero deletions; no pre-existing AgentCore runtime / S3
  bucket / IAM identity / unrelated resource touched.** Evidence:
  `docs/cleanup-issue3-disposables.md`.
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
