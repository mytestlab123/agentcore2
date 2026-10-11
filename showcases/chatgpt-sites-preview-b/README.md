# Agentic Operations Lab — Operations Campaign / Issue29

Portable **SHOWCASE / MOCK** source based on accepted main
`01f8676f88e8015c291857f18d9445834b99f11a`. Open `index.html` directly. All data,
reasoning and operations are synthetic; no install, server, model or AWS is needed.
The existing private Agentic Operations Lab Site is unchanged. This PR prepares
source for a later explicit Work + @Sites visual-polish action, not publication.

## Four-minute operator demo

1. **0:00–0:45 — Overview.** Open Operations Campaign. Explain the current
   inventory/control/severity totals. Reviewed overlaps other outcomes; blocked
   and manual are not compliant. All 58 accounts and findings are invented.
2. **0:45–1:30 — Exact scope.** Inspect a recommended queue's 25 IDs/revisions.
   Open only selects them; Preview freezes the exact proposal and fixed parameters.
   There are four deterministic queues and no campaign-wide approval.
3. **1:30–2:15 — Human choice.** Reject one proposal to record zero writes.
   Return to Campaign, preview another queue and Approve Once. Each queue needs
   its own decision; consumed approval cannot execute again.
4. **2:15–3:00 — Result.** Return to Campaign and inspect both journal records.
   Narrate the provider operation, separate readback and independent compliance.
   Optional scenario alternatives: unauthorized/stale zero writes, partial block,
   provider match with NEEDS_REVIEW, or interruption with explicit same-run resume.
5. **3:00–4:00 — Handoff.** Select complete journal records and download Markdown
   and JSON. Compare target evaluations versus unique targets within epoch,
   unresolved results, simulated writes and **0 real writes**. Incomplete records
   cannot be selected. This packet describes selected evidence, not fleet compliance.

## Session boundaries

The journal retains the last 12 recorded runs as copied, frozen snapshots. It
survives inventory reset with distinct epoch/run/proposal identities; page reload
clears it. Eviction removes a record from selection and the packet. A stale preview
is refused before a run exists; it appears in the governance guard log, not as a
fabricated run. An interrupted run remains incomplete until explicitly resumed
through the existing consumed proposal; journal inspection never restores authority.
Final packets include exact frozen scopes/revisions, decisions, parameters,
per-target outcomes and separate provider/compliance evidence. Repeated evaluations
are counted separately and older unresolved evidence is not silently overwritten
by a later success. No unrelated incident or later run is attached.

## Accepted Issue27 stories and teaching mode

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
Changing inventory resets active inventory/proposal state. Retained story records cannot attach a
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

## Source and evidence

- `index.html`: complete UI, synthetic generator, story definitions and executor.
- `RELEASE.json`: exact HTML digest and embedded source fingerprint.
- `story-packs.json`: compact story/teaching copy extracted from this source,
  plus enterprise narration; a handoff snapshot, not a second runtime.
- `site-prompt.md`: exact brief for later polish of the existing private Site.
- `campaign-validation.json` / `evidence/campaign-desktop.png`: campaign desktop
  proof bound to the current HTML digest.
- `story-validation.json`, `story-packs.json`, and earlier Issue22/Sites evidence
  retain historical source identities; they do not verify the campaign bytes.

Validation stays economical: syntax plus existing `check-state.cjs`, useful
milestone visuals, and one final desktop smoke. No new suite/dependencies/CI or
mobile work. G review and roadmap acceptance remain required; no automatic merge.
