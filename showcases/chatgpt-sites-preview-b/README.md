# Agentic Operations Lab — story packs / Issue27

Portable **SHOWCASE / MOCK** source based on accepted main
`693cf09942041ea935bacbc50249b0bf16df2328`. Open `index.html` directly. All data,
reasoning and operations are synthetic; no install, server, model or AWS is needed.
The existing private Agentic Operations Lab Site is unchanged. This PR prepares
source for a later explicit Work + @Sites visual-polish action, not publication.

## Three stories and one teaching mode

| Audience / duration | Open | Tell the story |
| --- | --- | --- |
| Compliance / 3–5 min | Story packs → Compliance | Load S3 finding; Explain/Investigate; inspect exact frozen policy diff; Approve Once or Reject; narrate operation, provider readback and independent compliance. |
| SecOps / 3–5 min | Story packs → Security | HIGH internet-open SSH exposure; fixed public-SSH removal only; show Unauthorized actor or Stale proposal with zero writes; load Normal for the successful comparison. |
| Management / ~3 min | Incident story | Synthetic ServiceNow-style intake, triage and exact proposal; human decision in Copilot; return and Update from evidence. Executive brief names problem/action/control/outcome/evidence. Reject/mismatch/missing evidence stays OPEN. |
| Engineers / 2–3 min | Learning mode | Nine read-only architecture stages explain AI limits, registered tools, validation, approval, fixed execution, independent evidence and matching audit. Five channels are views of the same contract. |

Story scenario selection takes effect when **Load bounded story** is pressed.
Enterprise Evidence branch freezes at triage/preview. Presenter cues are embedded
in each view. Inspect in Copilot retains the same finding/proposal. Read existing
evidence never executes. Changing context cancels authority; load again to rehearse.
Changing inventory resets in-memory state. Retained story records cannot attach a
new run merely because reset reused an ID. No durable-provider recovery is claimed.

## One implementation

Story controls call the existing `scope`, `preview`, `decide`, `runChunk` and run
history. The incident executive summary reads only matching proposal/run evidence.
Learning mode changes explanatory selection only. No story owns another backend.
The portable simulation uses contract vocabulary from `packages/contracts`; it is
not a compiled backend integration. Agent/model labels grant no authority.

Eight registry entries retain truthful readiness: six MOCK READY, logging partial,
snapshot exposure planned. The generator provides 58 invented LAB accounts and
49,476 baseline records. Only fixed registered controls have automatic proposals.
Provider success with failing compliance remains NEEDS_REVIEW. No live parity
claim or new AWS resource is implied; Issue23 separately governs retained costs.

## Compact handoff

- `index.html`: complete UI, synthetic generator, story definitions and executor.
- `RELEASE.json`: exact HTML digest and embedded source fingerprint.
- `story-packs.json`: compact story/teaching copy extracted from this source,
  plus enterprise narration; a handoff snapshot, not a second runtime.
- `site-prompt.md`: exact brief for later polish of the existing private Site.
- `story-validation.json` / `evidence/story-desktop.png`: local source-bound proof.
  Older Issue22/Sites proof files remain historical and do not verify new bytes.

Validation stays economical: syntax plus existing `check-state.cjs`, useful
milestone visuals, and one final desktop smoke. No new suite/dependencies/CI or
mobile work. G review and roadmap acceptance remain required; no automatic merge.
