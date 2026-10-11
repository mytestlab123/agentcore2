# Agentic Operations Lab — Shift Review Desk / Issue31

Portable **SHOWCASE / MOCK** source based on accepted main
`32b36f31ab3083b1fdd0eb5a433922d6951e16e3`. Open `index.html` directly. All data,
reasoning and operations are synthetic; no install, server, model or AWS is needed.
The existing private Agentic Operations Lab Site is unchanged. This PR prepares
source for a later explicit Work + @Sites visual-polish action, not publication.

## Four-minute Shift Review Desk demo

1. **0:00–0:45 — Import.** Open Shift Review Desk and choose the bundled
   `shift-review-sample.json` through **Local campaign JSON**. This is an actual
   v1.6.0 campaign export from the accepted prior source, with two complete runs,
   21 evaluations, 17 synthetic VERIFIED results and four unresolved exceptions.
   Declared source release/fingerprint are self-reported, not a signature.
2. **0:45–1:45 — Triage.** Filter Target outcome to BLOCKED. Inspect its exact
   epoch/run/proposal/target/revision, skipped provider write and unevaluated
   compliance. Then inspect NEEDS_REVIEW: the simulated provider matched, while
   the separate compliance result did not. Severity uses the bundled control
   mapping; it is not an imported cloud risk metric.
3. **1:45–2:45 — Notes.** Save INVESTIGATING with an optional owner label and
   next action for the blocked evaluation, and FOLLOW_UP for one NEEDS_REVIEW
   evaluation. These are memory-only operator notes. No assignment is sent;
   REVIEWED never changes the original unresolved evidence or incident state.
4. **2:45–4:00 — Next shift.** Clear filters to All unresolved, select filtered
   unresolved, then download review JSON and Markdown. Compare the four original
   exceptions, two notes and two untouched evaluations. The JSON `originalPacket`
   is unchanged; annotations are a separate overlay with exact source references.
   Clear import & notes to demonstrate session-only continuity.

## Admission and review boundaries

- Explicit local file selection only: original `agentcore2.synthetic-shift-handoff.v1`
  campaign JSON, maximum **2 MiB / 12 complete runs / 2,000 total evaluations**.
  Larger valid campaign exports must be split into smaller source selections.
- Admission rejects unknown fields, unsupported controls/outcomes, duplicate
  runs/proposals/targets/results, mismatched identities/sources/counters,
  inconsistent per-target provider/compliance evidence and incomplete runs.
  VERIFIED evaluations inside PARTIAL runs receive the same checks. All supplied
  totals and exception lists must match the records. Structural consistency is
  not source authenticity, provider attestation or proof of real compliance.
- Imported text uses DOM text APIs; Markdown escapes imported text and notes.
  Imported decisions are historical assertions, never approvals or authority.
  Files, notes and exports cannot execute a tool, alter inventory or close incidents.
- Every unresolved evaluation keeps its full epoch/run/proposal/target identity.
  Repeated evaluations are not deduplicated; unique targets within epoch are
  counted separately. Verified assertions can be inspected but not annotated.
  Unsupported manual/unknown outcomes fail closed rather than being called compliant.
- Select unresolved evaluations explicitly. Filters do not silently change export
  selection. JSON overlays retain the entire original packet; Markdown lists the
  selected exact evidence and honest totals, including untouched/unselected items.
  Overlay schema is `agentcore2.synthetic-shift-review-overlay.v1`; it cannot be
  reimported as original execution evidence. Notes do not resolve exceptions.
- Owner labels ≤80 characters; next-action notes ≤1,000. Nothing is stored or sent.
  Clear cancels pending file reads and removes notes; a loaded import must be
  cleared before replacement. Inventory reset cannot change imported evidence.
  Page reload clears all review state; no durable task tracking is claimed.

Issue29's actual Site and its separately blocked hosted E2E are unchanged and are
not prerequisites. This roadmap delivers portable source only; no Site calls,
login troubleshooting or publication is part of Issue31.

## Accepted campaign four-minute demo

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

- `shift-review-sample.json`: real synthetic v1.6.0 exporter output from
  `main@32b36f31ab3083b1fdd0eb5a433922d6951e16e3`, not live/provider data.
- `shift-review-validation.json` and `evidence/shift-review-desktop.png`: final
  Cloud desktop proof tied to the v1.7.0 HTML digest.
- `shift-review-overlay-example.json` / `.md`: actual downloaded review overlays
  from that smoke. JSON retains the unchanged sample packet; both record four
  unresolved evaluations, two notes and two untouched exceptions.


- `index.html`: complete UI, synthetic generator, story definitions and executor.
- `RELEASE.json`: exact HTML digest and embedded source fingerprint.
- `story-packs.json`: compact story/teaching copy extracted from this source,
  plus enterprise narration; a handoff snapshot, not a second runtime.
- `site-prompt.md`: exact brief for later polish of the existing private Site.
- `campaign-validation.json` / `evidence/campaign-desktop.png`: historical v1.6.0
  campaign proof; its source identity is preserved, not rebound to v1.7.0.
- `story-validation.json`, `story-packs.json`, and earlier Issue22/Sites evidence
  retain historical source identities; they do not verify the campaign bytes.

Validation stays economical: syntax plus existing `check-state.cjs`, useful
milestone visuals, and one final desktop smoke. The existing state check includes focused regressions for the new untrusted-input
boundary; no new suite/dependencies/CI or mobile work. Independent review and
exact-head CI are required before the owner-authorized source merge.
