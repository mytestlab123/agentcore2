# Preview B · ChatGPT Sites MOCK showcase

A portable companion to Contextual Copilot v1.1. This is **MOCK SHOWCASE**:
synthetic findings, deterministic replies and simulated evidence. It has no
AWS, bridge, model, SDK or runtime connection. The live application is unchanged.

## Open locally

Download this directory from PR #5's `issue-3/agentcore-lab` branch. Open
`index.html` directly in a current browser (double-click works). No install,
build, server or Internet access is required. All CSS, JS and fixture data are
embedded in that one file; there are no fonts, images or scripts to download.
The only external link is an explicit navigation to the separate engineering demo.

1. Select a finding; try Explain and Investigate.
2. Choose **Require encrypted transport**, then Preview Fix → Reject: zero
   simulated writes; the finding stays NON_COMPLIANT.
3. Reset synthetic demo; Preview Fix → Approve Once: one simulated write,
   separate provider readback and compliance result. The proposal is consumed.
4. Try status/fixability/search, the illustrative three-model selector, and theme.

AUTOMATED is derived only from NON_COMPLIANT plus remediationCapabilityId;
otherwise MANUAL. Approval changes only in-memory mock state. Reload/reset
restores fixtures. No state is saved to browser storage.

## Use with ChatGPT Sites

1. In Amit's ChatGPT workspace, select **@Sites** if that integration is available.
2. Attach `index.html` as the implementation reference. If the composer will not
   accept HTML, paste its complete contents into the conversation as a code block.
3. Copy the entire contents of `site-prompt.md` into the same message and send it.
4. Explicitly ask to **save a version without deploying it**. Review the MOCK
   badge, synthetic data, all controls and approve/reject timeline before
   choosing any deployment/publish action yourself.
5. Keep this package as the authoritative reference. If Sites cannot import or
   preserve the file directly, ask it to reproduce the same static behavior from
   the attached source; do not add a backend to work around import limitations.

These are source handoff instructions, not a claim that Sites supports a specific
upload/import button or an automated deployment API. Integration availability
and the actual generated site's behavior must be checked in Amit's workspace.
**No Site was created or published by this mission.**
Official [OpenAI Sites guidance](https://learn.chatgpt.com/docs/sites) supports
starting with @Sites and adding reference files, and says deployment URLs are
production deployments. The prompt therefore requests a saved version without
deployment. Exact raw HTML import compatibility still needs workspace review.

## Files and proof

- `index.html`: standalone implementation and synthetic fixture.
- `site-prompt.md`: one copy/paste request for @Sites.
- `ARCHITECTURE.md`: showcase boundary and real engineering architecture.
- `smoke.cjs`: one focused offline Playwright check.
- `proof.json`: sanitized local Chromium render/interaction receipt, not proof
  that a generated ChatGPT Site has been imported, tested or published.

To repeat with an existing local Playwright installation and Chromium:

```sh
node showcases/chatgpt-sites-preview-b/smoke.cjs
```

Or pass the local Playwright module path as the first argument. Playwright is
validation tooling only; opening or using the showcase requires no dependencies.
For an already installed Chromium at a different version, set SHOWCASE_BROWSER
to its executable path rather than installing another browser for this package.
The smoke opens a file URL with browser networking offline and verifies filters,
bounded actions, manual refusal, reject-zero-write, approve-once, separate evidence,
model labels, themes and mobile layout. No live engineering endpoint is fetched.

Authority: [Issue #3 approval](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5931467199).
Delivery remains in [PR #5](https://github.com/mytestlab123/agentcore2/pull/5), draft/open/unmerged.
