# Current context

Authority: Issue #3 and [G executor decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5923329299).
Repository: mytestlab123/agentcore2. Branch: issue-3/agentcore-lab. Primary PR: #5,
draft/open/unmerged. X/core2 is primary executor; Kiro is review-only. Home Crew
is not used for this follow-up and its security rules remain unchanged.

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

Demo Readiness E2E is approved by Issue #3 comment 5929211062. X/core2 is adding
runtime preflight, one helper lifecycle, authenticated no-model readiness,
friendly connection diagnostics and a real deployed-B browser gate. Build,
23 contract + 12 Python tests and typecheck pass. No new model invocation is
authorized: attempts remain 17/18. Complete the real lifecycle proof and update
only existing Preview B. See docs/demo-readiness.md.

Preview B v1.1 PASS under Issue #3 comment 5928077026; it is the primary demo
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
