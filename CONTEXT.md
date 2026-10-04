# Current context

## Issue #16 offline recovery (2026-10-04)

PR #15 merged at `41bd3a3e0dc6bacbd5db7318fbab32f38487be98`; this is the
clean base for Issue #16. Earlier draft/open wording below is historical.
The helper now has bound versioned receipts, offline inspection and an
observation-only resume path; synthetic lifecycle tests check no duplicate writes.
Parent #14 remains preparation, not live acceptance. Draft PR #17 implementation
head `313674d94e4351f6fc791f5933a261a0b538b427` passed CI 37165163502:
fast with 31 preflight/recovery tests, plus browser. Repository milestone PASS;
live recovery/deployment NOT_RUN. Final documentation head and CI are recorded
in PR #17/handoff. Next: owner review of remaining private gates in
[the recovery guide](docs/cloud-deployment-recovery.md). No activation or merge.

## Issue #14 deployment readiness (2026-10-03)

PR #13 merged at `098e0254c2d5167a985073f0dc40dccf731c183b`; Issue #12
cloud pilot PASS. Its final head `17feaeb58a4a6747efaf856482b88574e5942b4c`
passed CI run 37018552864 (fast and browser). Earlier draft/open statements
below are historical. Issue #12 remains open; this task does not close it.

Issue #14 starts from that merged main. Existing Issue #7 / draft PR #8 stays
independent and unchanged. Repository-only C1 deployment readiness is active:
shared preflight, offline tests, existing workflow reuse and an owner approval
packet. Draft PR #15 implementation head `f8763c27eeaa4fcab6b03f2ce339e77e540cfbc5`
passed CI 37116329915: fast with 14 offline preflight tests, plus browser.
Repository preparation PASS; live identity/OIDC/deployment NOT_RUN. Next: owner
review of the private identity/trust/target/revision gates in
[the packet](docs/cloud-deployment-readiness.md). No merge or activation.
Final documentation head and its CI are recorded in PR #15 and the handoff.

## Issue #12 cloud pilot update (2026-10-02)

PR #5 is merged at `e2f64c522b005ada178c2c98fc2318dac2ab7dcd`, confirmed
by Issue #12's gate-release comment 5950622930 and current remote main.
The older Issue #3 closeout/unmerged statements below are historical.

The new saved cloud environment's original GitHub CLI repository read succeeded
with its existing configured credentials. No alternate route or authentication
was used. The preserved Issue #12 patch was restored exactly from the approved
base and committed as `d0ce9c9`; this preserves file content, not original commit
identities. Transfer length/SHA256 and original base/head are recorded in
[the pilot evidence](docs/dot-cloud-pilot.md). Root npm ci and the complete fast lane passed in this task (23 contract +
12 Python tests, build, typecheck and state/safety).
The fast/browser verification lanes and read-only PR workflow are prepared.
Cloud-environment browser installation remains owner-deferred; CI browser
execution is approved. Draft PR #13 is open. Cloud verification run 37018266868 passed both fast
(29 s) and browser (52 s) at `6fa16b3d04591edebf18789adbcc974a3bdcf18d`.
Desktop/mobile browser smoke reported one local document request and zero
unexpected requests, browser errors, model calls or real writes. Phase 1 PASS;
next action is owner review of the draft PR, with no merge authorization.
The final documentation-only head and its CI result are in the PR/handoff.
No AWS, IAM, OIDC, deployment, live Preview B, Home/office work or merge belongs
to this task.

Authority: Issue #3 and [G executor decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5923329299).
Repository: mytestlab123/agentcore2. Final closeout branch: issue-3/agentcore-lab.
Primary PR: #5. PR #10 is merged into this branch. Owner explicitly authorized
validated repository closeout into `main` on 2026-10-02. Kiro remains review-only.
Home Crew is not used for this closeout and its security rules remain unchanged.

## Bootstrap / continuation note

- Main bootstrap commit `274308dbccd8fea0176aa981c7970cb03cfd032a` is preserved.
- Its earlier inactive-lab snapshot is historical and superseded by Issues #3, #9 and #12.
- For future work, use the owning Issue/PR, latest authorized delta and current HEAD;
  do not infer a task from neighboring repositories or old conversation history.

## Current truth

- The prior v4.2 run reached final task 15/15. M1/M2 code and M5 documents passed;
  live resources were blocked. Prior provider claims and evidence are historical
  in docs/final-handback.md. PR #5 base for this follow-up was 7495283.
- F1 adds the smallest managed Harness S3 specialist custom ARM64 environment,
  registered read-only tool and deterministic SSL-only ComplianceBackend RPC.
  The model cannot approve or execute mutations. Stable intent IDs, ownership
  tags, policy drift checks and durable write-intent/request-ID evidence guard
  execution. See harness/README.md and docs/focused-followup.md.
- Current-tree account identifiers have been scrubbed. Historical exposure is
  retained as a known repo-history issue by owner decision; no force push.
- Static Preview A/B/C remain MOCK until connected to authenticated live transport.
  Provider identifiers alone cannot enable a LIVE badge.
- Selected runtime identity: Home Dell, profile amit, region ap-southeast-1;
  personal LAB identity checked locally. Never publish its account identifier.
- Model gate resolved by [G Nova decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5924722893).
  Exactly Nova Micro APAC, Nova Lite APAC (default) and Nova 2 Lite global are
  allowed. Synthetic model inference may cross Regions; resources stay Singapore.
  No Anthropic subscription or agreement is authorized or used.
- F2–F5 PASS: one ARM64 ECR image, one new narrow role, one managed Harness
  and one runtime (READY). All three Nova models made a real registered-tool
  call. Managed memory is disabled; its service-created child is retained for
  lifecycle review, with ownership verified. No pre-existing resource changed.
- Three Amplify previews are SUCCEED, revision 87f468b, with Economy/Default/
  Enhanced and relative input-price labels. Real Chromium validation connected
  each to the private operator bridge; Preview A invoked Nova Lite and observed
  the actual compliant canary. Bridge is stopped; ephemeral token removed.
- F4: CLI REJECT and unauthorized target proved zero writes. APPROVE_ONCE
  produced VERIFIED with native PutBucketPolicy ID, separate provider and SSL
  compliance reads. This is a custom evaluator, not AWS Config convergence.
  CLI getRun resumed the saved result after SSH loss without another mutation.
- The exact tagged disposable canary was deleted after proof; provider HeadBucket
  returned absent. All four Block Public Access settings stayed true during proof.
- Remaining new resources have cleanup=review and lifecycle date 2026-10-02.
  Private execution journal and scratch build/browser artifacts are retained.
  Resource ownership/retention is in docs/resource-record.csv. No automatic TTL
  deletion is authorized. Actual total billing is not yet reconciled; recorded
  model usage provides only a partial cost estimate, within the ~USD 10 experiment.
- Home Docker buildx and qemu-user-static were installed under the explicit
  tooling approval; ARM64 binfmt registration is verified. SDK 1.43.104 is
  isolated in private task state. Crew security/configuration is unchanged.
- Local .kiro state is preserved. It must remain untracked and must not be ignored
  broadly or included in commits.

## Next action

Repository closeout is authorized. PR #10 (Sites v1.2.1 semantic P1 sync) is now
merged into the Issue #3 branch. Build, 35 tests, typecheck, state/safety,
offline desktop/mobile smoke and leak checks passed before this docs-only main
reconciliation. True mobile public-Site proof is owner-waived as a blocker.

G now reconciles the preserved main bootstrap/context and merges PR #5 to `main`.
After that merge, Issue #12 is the next active experiment: Dot + Codex Cloud must
start from the exact merged `main` SHA recorded in Issue #12 and prove a normal
cloud-only checkout/install/build/test/typecheck/smoke -> small PR -> CI loop,
without Home/office execution fallback. No AWS/OIDC/deployment belongs to #12.

C1 cloud portability comparison prepared under Issue #3 comment 5949449667.
Canonical MOCK HTML at accepted68aa168 remains byte-identical; its digest and
two-file build wrapper are recorded in docs/cloud-portability-c1.md/.json.
Sites/Pages are OWNER_UI_REQUIRED: no authenticated supported provider surface
or confirmed Cloudflare owner binding exposed here. Amplify is BLOCKED: existing
GitHub OIDC provider, but zero role trusts name this repo/branch; isolated branch
absent. Narrow symbolic policy/trust and inert manual-dispatch workflow prepared;
no IAM/cloud changes or hosted-success claims. Dispatch registration on default
branch is a separate owner gate; do not merge draft PR #5 to bypass it.
Local offline desktop/mobile smoke and normal build/test/typecheck pass.
Next: G/Amit reviews exact owner gates; no new hosting resources or Preview B
changes are authorized by this handback alone. See C1 comparison for owner steps.

ChatGPT Sites MOCK showcase PASS under Issue #3 comment 5931467199.
The self-contained showcases/chatgpt-sites-preview-b/index.html opens offline,
with synthetic findings, truthful fixability, bounded contextual actions,
consumed approve/reject proposals, five separate simulated evidence steps,
unchanged three-model labels/input cost indices, themes and architecture.
One offline Chromium smoke proves desktop/mobile rendering and all interactions,
zero network requests/browser errors/model calls/real writes. Package scans pass.
README.md and site-prompt.md give Amit the source handoff for @Sites; no Site
was created or published and import availability remains workspace-dependent.
Live Preview B, bridge, AWS, resources and existing assignments are unchanged.
PR #5 stays draft/open/unmerged. Next: G/Amit reviews the portable package and
manually imports/previews it in Sites if available. No automatic publication.

Demo Readiness E2E PASS under Issue #3 comment 5929211062. Full runtime preflight,
one operator lifecycle, authenticated local readiness and sanitized diagnostics
are implemented. Native Windows Python/OpenSSH/Chrome proves deployed B HTTP200,
MOCK → LIVE LAB, theme/fixability/contextual shell and zero unexpected browser
errors, with only the readiness method. No AWS client/model is used by readiness;
attempts remain 17/18. Missing harness.json in clean Dell scratch fails before
bridge/browser. Full build, 23 contract + 12 Python tests and typecheck pass.
Existing B job4 serves source58a7600; A/C are not redeployed. Bridge PID2350309
remains loopback-only and ready; existing token retained, test-owned tunnel
closed. G/Amit can review docs/demo-readiness.md and its sanitized evidence.
Readiness is not a new provider-compliance claim; deleted canary yields explicit
NO_LIVE_FINDINGS. Model smoke needs separate approval; no new canary/resources.

Prior Preview B v1.1 handback (deployment superseded by the gate above): PASS
under Issue #3 comment 5928077026; it is the primary demo
direction. Existing B deployment job 2 SUCCEED serves source e50e78d (HTTP 200).
Theme, truthful fixability, contextual summary and actual-run evidence timeline
pass deployed Chromium checks. Full build, 23 contract + 9 Python tests and
typecheck pass. Native Windows Chrome authenticated through Windows OpenSSH
127.0.0.1:8443 → Dell 127.0.0.1:8703 (HTTP 200), with no model or remediation
call. The owned bridge/tunnel stopped and exact ephemeral token was removed.
Only theme preference is stored in the browser. A/C deployments are unchanged.
See docs/preview-b-v1.1.md and docs/preview-b-v1.1-evidence.json. G/Amit can now
review v1.1. Do not redo F1–F5 or recreate the deleted canary. PR #5 stays
draft/open/unmerged. Kiro remains review-only.
Retained resource review remains due 2026-10-02; no automatic deletion is
authorized. The portable learning harvest is docs/learning-harvest.md.

Validation: npm run build; npm test; npm run typecheck. Evidence: docs/focused-followup.md.
