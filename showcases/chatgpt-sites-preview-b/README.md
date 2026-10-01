# Preview B · Contextual Copilot v1.2

The portable source of the accepted ChatGPT Work / Sites **SHOWCASE / MOCK**.
[Open the public Site](https://contextual-copilot-mock.amit-6719.chatgpt.site/).
All resources, proposals and evidence are synthetic. This page has no AWS,
AgentCore, bridge, model, SDK or backend connection. The separate Amplify
engineering demo and its source remain unchanged.

## Source and version

`index.html` is a byte-for-byte copy of the accepted Site's `dist/index.html`,
not an independently rebuilt UI. See `RELEASE.json` for the exact source commit,
saved Site version, HTML SHA-256 and GUI fingerprint. The release label is
`v1.2.0`; no upstream Git tag is claimed. GUI: **Preview B · Contextual Copilot v1.2**.
Internal hosting configuration, credentials and opaque deployment IDs are omitted.

The baseline package is in unmerged PR #5 at
`68aa168f764531697ef34c472f87468ad738e36a`. Issue #9's single source-sync PR
targets `issue-3/agentcore-lab` from that exact commit. This preserves the baseline
without duplicating the lab changes in a second PR against main. PR #5 stays
untouched. After #5 merges, retarget the same PR to main and review its diff.
Do not create another implementation PR or merge without Amit's approval.

## Demo in five minutes

1. Open `index.html` directly in a browser, or open the Site. No install, server,
   build or Internet connection is required for the downloaded page.
2. Open **Commands** (Ctrl+K), search `s3 bpa`, and choose the BPA filter.
3. Open Commands again, search `1000`, and select up to 1,000 compatible findings.
   Selection is only preparation; it never approves or executes a fix.
4. **Preview Fix** freezes exact target IDs, accounts, regions, revisions and
   fixed parameters. Expand the target list or download the full snapshot.
5. **Reject** consumes the proposal: zero simulated and real writes, unchanged
   findings. The Change tab shows a consumed decision; Evidence records the run.
6. Reset, repeat, and **Approve Once**. Progress and five evidence stages show
   simulated writes, separate provider readback and separate compliance result.
7. Under **Learn / Demo**, enable every-17th-target blocking before previewing.
   A 1,000-target approval yields 942 verified / 58 blocked, with no auto retry.
8. Try filters, search `ssh`, account scope, sortable columns, pagination,
   row selection, inspector, Context/Change/Evidence tabs and light/dark themes.

## Honest scale and bounded behavior

The baseline contains **58 invented LAB accounts and 49,476 unique resources**:
32,076 S3 buckets, 10,440 security groups and 6,960 EC2 instances. Each resource
has one illustrative control finding; this is not a complete compliance scan.
Baseline S3 counts vary deterministically from 100–1,000 per account. The
uniform scenario can reach 75,400 records. Only 25 findings render per page.
Overview values describe the entire synthetic inventory; table values describe
filtered matches. These counts are computed from records, not cosmetic numbers.

A batch shares resource type, control, registered mock capability and fixed
parameter version. Only actionable NON_COMPLIANT findings can be selected.
Page selection, all compatible matches and the up-to-1,000 command are distinct.
Changing filters/context cancels pending authority. A consumed or stale proposal
cannot execute. A model choice changes neither target scope nor approval.
Current finding state is separate from the last run's exact scope. Replay only
highlights recorded evidence; it never performs another simulated write.

The three Nova choices show an illustrative **Input Cost Index**, not total
request cost, and invoke no model. The assistant uses a compact deterministic
transcript. A finding (or explicit compatible selection) is the context;
there is no generic chatbot composer.

## Files and checks

- `index.html`: exact accepted single-file Site source, including CSS/JS.
- `RELEASE.json`: version, source identity and rollback mapping.
- `check-state.cjs`: actual page script tested in a Node VM/minimal DOM harness.
- `smoke.cjs`: offline desktop/mobile Playwright smoke and network/error checks.
- `proof.json`: sanitized evidence with separate PASS and unverified results.
- `ARCHITECTURE.md`: explanation of the separate engineering system.
- `site-prompt.md`: reusable Work / @Sites instruction for this UI.
- `evidence/desktop-light.jpg`: inspected public Site desktop screenshot.
- [Reusable MOCK-first practice](../../docs/mock-first-ui-pattern.md).

To run with existing Node and Playwright tooling:

```sh
node showcases/chatgpt-sites-preview-b/check-state.cjs
node showcases/chatgpt-sites-preview-b/smoke.cjs
```

The smoke accepts an installed Playwright module path as its first argument.
`SHOWCASE_BROWSER` may point to an already-installed Chromium executable.
No browser or dependency is installed by the showcase itself. Playwright is
test tooling only. The smoke keeps browser networking offline and opens a file
URL; it never navigates to the engineering demo.

Node VM state/safety checks and focused public-Site desktop browser interactions
passed. A desktop light-theme screenshot was inspected. Offline Chromium smoke
and mobile visual review remain unverified in this execution environment;
do not reuse the old five-fixture receipt as v1.2 proof. The managed cloud
download wait timed out, so full browser download completion is also unverified.

## Rollback and updates

Keep the existing Site and its saved versions. Roll back by redeploying saved
Site version 2 (source `68c6a19df90a5be7a5a423d4be817c8fb78df50d`) using @Sites,
preserving the audience currently set by the owner. Do not reset Git history.
The owner made the Site public on 2026-10-01; that audience was verified,
not changed by this source sync. Publishing future edits follows the owner's
current explicit instructions. Repository merging still needs explicit approval.

Authority: [Issue #9](https://github.com/mytestlab123/agentcore2/issues/9), plus
Amit's accepted Work v1.2 expansion and request for code, docs and one PR.
