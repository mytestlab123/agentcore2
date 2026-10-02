# Repository closeout — G owns GitHub merges

Authority: current Amit mission and [Issue #9 closeout decision](https://github.com/mytestlab123/agentcore2/issues/9#issuecomment-5949698282).
X/core2 prepares/pushes PR #10; **no GitHub merge is performed by X**.
Kiro remains review-only. No cloud/model/Sites action is part of this closeout.

## Accepted source sync

Work reported saved Site version 4, v1.2.1 source
`219515a8514b1a9e058458087fbed6b2f7484f74`, fingerprint prefix `15b9d93b5f`.
Exact Work export bytes are not available to this controller. This repository
therefore records **semantic P1 sync**, not byte equality. RELEASE.json contains
the distinct local HTML digest/fingerprint. The public Site was not edited or
republished, and its previous incomplete TinyFish gate is not upgraded by local
tests. True mobile browser proof is owner-waived as a blocker; no P2 is included.

Only three product behaviors changed from the v1.2.0 export:

1. Every changed search/filter resets to page 1; unchanged refresh preserves
   the current valid page. Regression cases cover all seven filter inputs.
2. Retained Copilot guidance names its resource and tells the operator that
   selecting a resource name changes finding context.
3. One no-run/pending-proposal message replaces repetitive empty-stage text;
   the five evidence labels and real recorded mock-run evidence are preserved.

PR #10 incorporates the current PR #5 base `bb95e9547597138ef1657eef311137e35f9b586d`
without modifying the PR #5 branch. Its CONTEXT conflict preserves both the
Issue #9 closeout and Issue #3/C1 history. Its smoke conflict preserves v1.2
validation in the package and the prior pinned C1 validation in
`ops/showcase-c1-smoke.cjs`. The C1 wrapper reads accepted68aa168 from Git rather
than failing on the newer package HTML. Checkout/build guidance ensures the
accepted commit is available. C1 remains an inert proposal with its original
external gates; no cloud permission or publication decision changed.

## Safe merge sequence

Known reconciliation targets: main `274308dbccd8fea0176aa981c7970cb03cfd032a`,
PR #5 `bb95e9547597138ef1657eef311137e35f9b586d`, PR #10 updated by this closeout.
Re-read remote heads before each operation; changed heads require a new diff.
Do not force-push, merge both PRs against main independently, or drop either side.

1. **G verifies PR #10's reported final head**, tests/scans, diff and base
   `issue-3/agentcore-lab`, marks it ready if needed, then merges #10 into that
   base. There is exactly one Issue #9 source-sync PR; do not retarget/create one.
2. Fetch origin in the exact checkout; preserve unrelated untracked `.kiro/`.
   Switch to `issue-3/agentcore-lab` and fast-forward only to the merged remote
   base. Do not overwrite dirty/divergent work. Record the new PR #5 head.
3. Merge `origin/main` **into the issue-3 branch** without squash/reset/ours/theirs
   shortcuts. The bootstrap commit changes only AGENTS.md and CONTEXT.md.
   AGENTS.md should merge automatically: retain main's Bootstrap / Recovery
   Order and warm-continuation/no-invented-task guidance, plus existing project
   safety rules. No other bootstrap file should be overwritten.
4. Resolve **CONTEXT.md only**, using the post-#10 lab context as the current
   body. Retain main's bootstrap intent in an explicit continuation section:
   completed work is evidence, not a new task; after handback stay read-only
   until Amit names a new objective; use owning Issue/PR/latest authorized delta
   for warm continuation. Retain repository identity and record main's bootstrap
   commit as history. Do not restore stale “not started”, “no active task yet” or
   old merged-main SHA as current project status. Preserve all F1–F5, Demo
   Readiness, Issue #9 source/waiver and C1 owner gates. Current next action is
   final validation and G review/merge, not additional implementation or cloud work.
5. Check no unresolved markers/files; inspect the actual merge diff. Confirm
   main's AGENTS.md bootstrap additions are intact and all Issue #3/C1/Issue #9
   outputs remain. Run final validation below on the resolved merge tree.
6. Commit/push that normal reconciliation merge to PR #5. Recheck exact remote
   head, draft/open state and checks. **G**, not X, performs the final #5 merge
   into main after the reported tested head matches. Re-read merged-main SHA
   and final Issue/PR states; do not claim merged completion before readback.

Expected conflict after #10: CONTEXT.md only. Any other conflict, stale remote
head, failed validation or unexplained diff stops automatic resolution for review.
No IAM, provider, deployment or model permission is implied by Git closeout.

## Final validation commands

```sh
npm run build
npm test
npm run typecheck
node showcases/chatgpt-sites-preview-b/check-state.cjs
node --check showcases/chatgpt-sites-preview-b/smoke.cjs
node --check ops/showcase-c1-smoke.cjs
git diff --check
```

Run current source/account/private-identifier scan and verify RELEASE/proof
digests. Existing installed Playwright/Chromium may run the offline smoke;
the published Site's true mobile/browser gap is owner-waived, not a reason to
install services or access AWS. C1's pinned-source packager and local smoke
remain separate. No network/provider call is required by either MOCK app.

Receipt: package proof.json and RELEASE.json, plus the final Issue #9 / PR #10
handback with exact head. Historical v1.2.0 proof and desktop image remain labeled
historical; the current fingerprint is not the Work fingerprint.
