# Agentic Operations Lab — reported backend receipts / Issue39

## Issue42 Cloudflare Worker release — NOT DEPLOYED

Owner authorization selects one dedicated Worker, `agentic-operations-lab`, in
the personal `dev1` account, with owner-only Access. This defines the approved
scope; it does not prove which account an active session is authenticated to,
that the proposed name is still unused, or that an Access policy is configured.
Provider identity and exact target readbacks are separate release evidence.

The accepted source package remains bound to Core2 `7c97d69fe31d5ae312f9c0922006422a5c3ee08a`
and SHA-256 `f1121283673b2070cdb3801c6950b61d9bd6eee56fbae7a8ee2d44e2724e6f1b`.
It serves exactly one allowlisted file, `index.html`; it adds no runtime
services, bindings or new UI. The package command checks the release constant,
GUI fingerprint and HTML SHA against `RELEASE.json`. Its source receipt is not a
deployment receipt. Current status remains `SOURCE_PACKAGE_ONLY_NOT_DEPLOYED`.
The app remains browser-local MOCK with no AWS/backend/model access or secrets.

### Private release sequence

1. Reuse the reviewed package receipt and inspect the staged asset list; require
   exactly `index.html`. Do not upload environment files, credentials, generated
   evidence or other assets. No CI credential is needed unless a separate CI
   deployment is explicitly adopted.
2. Using a separately verified safe interactive identity, confirm the session's
   account is the authorized personal `dev1` account. Read the current Worker
   inventory and verify `agentic-operations-lab` is absent. If it exists or the
   account/identity does not match, stop without overwriting anything. Preserve
   every other Worker.
3. Create only the new Worker with an unconditional deny handler that returns
   HTTP 403 and contains no demo content, bindings, secrets, cron, routes or
   custom domain. Keep `workers_dev:false` and `preview_urls:false`. Record the
   returned immutable Worker/version IDs and source hash privately; these IDs
   do not exist until the provider returns them. Read back the code/version and
   both routing flags before continuing.
4. Attach Cloudflare's **Worker-level Access** to this Worker only, targeting
   its exact provider `worker_id`. Use an Allow policy with an Include rule for
   the authenticated owner's exact verified email selector. Do not use an email
   domain, Everyone, Bypass, or an account-wide `all_workers` destination.
   This requires an identity with Access Apps and Policies Write permission;
   do not widen an existing token. Read back the application destination and
   policy, confirm it names only this Worker and that the selector matches the
   separately verified owner identity. A missing permission or failed
   readback leaves the Worker unrouted and deny-only.
5. Only after Access is attached and its readback is correct, upload the one
   reviewed `index.html` package. Keep `workers_dev` and previews disabled until
   the new Worker and Access policy have both been re-read. Then, if needed for
   the owner-only review, enable only this Worker's `workers.dev` route; keep
   preview URLs disabled. Do not add a custom domain, zone route, DNS record or
   account-wide Access policy.
6. Check the exact endpoint anonymously and require an Access challenge/deny
   with no application content. Separately, the owner interactively signs in
   and confirms the expected app/version. Never place credentials or secret
   values in command arguments, logs, evidence, or GitHub.

Current Cloudflare reference: [Worker-level Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
covers all domains and previews for one Worker; its API destination is `worker`
with that Worker's ID. [Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)
require an Include rule and distinguish the Allow action from Bypass. [Worker
routing](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)
documents per-Worker `workers.dev` availability. The source config keeps both
`workers_dev` and `preview_urls` false until those checks pass.

### Rollback

If any Access or content check fails, first disable only this Worker's
`workers.dev` route and previews. Return this dedicated Worker to the immutable
deny-only version recorded during placeholder creation, read back that version
and the disabled route flags, then confirm an anonymous request cannot return
application content. Record actual provider version IDs privately; before
creation there is no deny-version ID to cite as proof. Never delete or modify
another Worker, change DNS, or widen Access during rollback. A generated source
receipt or planned version identifier is not deployment or rollback evidence.

Current source v1.12.0-mock carries imported-finding provenance into the main
bulk-review table and batch context, and adds a guided three-group synthetic SSH
story alongside the existing S3 path. It also includes **Defence Factory · backend
receipt review** and **compare two observations**. Load the downloadable synthetic receipt example, or a sanitized
JSON array of canonical Batch/Decision/Run/Evidence envelopes. Exact scope/count
checks run locally; every file remains IMPORTED_ASSERTION with origin/live
acceptance NOT_VERIFIED. No backend connection, AWS authority or real local writes.
Uncertain execution can retain the producer's attempted-call count as UNKNOWN
and NEEDS_REVIEW; it never becomes VERIFIED without independent evidence.
See [receipt use and trust limits](../../docs/reported-backend-evidence.md).
The local MOCK executor stays separate. This fingerprint is not published and
the prior private Site/real-viewer gates are unchanged.

## Four-minute synthetic observation-delta walkthrough · Issue17

1. **0:00–1:00 — Load the pair.** Open **Defence Factory · compare two
   observations**, download the synthetic observation pair and load that JSON.
   Both immutable snapshots use the same bounded mock account/resource/control
   scope, strict increasing UTC timestamps and content fingerprints.
2. **1:00–2:30 — Read the delta.** The summary shows NEW 1, RESOLVED 1,
   UNCHANGED 2 and UNKNOWN 2. Inspect B: explicit later COMPLIANT means a
   resolved *observation*, not evidence of remediation. C stays UNKNOWN and D
   is missing from partial later coverage, so neither is treated as resolved.
   Use the group filter and exact key table to inspect each row.
3. **2:30–4:00 — Hand off and reopen.** Download JSON and Markdown. Clear the
   comparison, reopen the downloaded delta JSON, and confirm the counts and
   fingerprints remain internally consistent. The report says
   IMPORTED_ASSERTION / NOT_VERIFIED, REAL_WRITES=0 and hosted NOT_TESTED.

All timestamps and statuses are fictional. Fingerprints identify content only;
they are not signatures, freshness evidence, provider readback or approval. The
comparison does not change an existing decision, run or finding. No AWS scan,
remediation, Site publication or hosted viewer was used; the private hosted
viewer remains NOT_RUN.

## Preserved reconciliation journey / Issue35

Portable **SHOWCASE / MOCK** source based on accepted main
`e76028e1cfb74211fc45c093b454fab2068b156d`. Open `index.html` directly. All data,
reasoning and operations in the local demo are synthetic; reported receipt files
are untrusted assertions. No install, server, model or AWS is needed.
The existing private Agentic Operations Lab Site is unchanged. This PR prepares
source for a later explicit Work + @Sites visual-polish action, not publication.

## Three-minute handoff reconciliation demo

1. **0:00–0:45 — Two reviews.** Choose `shift-review-overlay-example.json` in
   Prior review overlay JSON, then Continue review. In **Compare another
   operator's notes**, choose `reconciliation-incoming-sample.json`. Both share
   the identical original packet; merely matching a fingerprint is insufficient.
2. **0:45–1:45 — Inspect and choose.** The sample shows one CONFLICT, one LOCAL_ONLY
   and one INCOMING_ONLY note. Compare exact identities/revisions and note text.
   Use incoming for the conflict, Keep current for the local-only note, and Use
   incoming for the incoming-only note. Each choice changes only that operator
   note; absence never means delete. No bulk apply or last-writer-wins exists.
3. **1:45–2:30 — Check scope.** Set Note difference to All available notes to see
   the applied choices. Original outcomes/provider/compliance and carried baseline
   remain unchanged. Export selection stays explicit; use Include all saved notes
   if needed. Choices are a session summary, not authenticated/durable history.
4. **2:30–3:00 — Hand off.** Download review JSON/Markdown, clear the desk and reopen
   the downloaded overlay. The example has three notes and one untouched original
   exception. Original evidence is identical. Clear comparison alone would retain
   applied notes; Clear import & notes removes the whole desk.

Comparison uses existing bounded v1 admission and then structural equality of the
entire original packet, including ordered records. Different packet scope/content
is rejected even with the same self-reported fingerprint. Note cards are paged at
10 pairs and filterable. Unavailable/omitted incoming annotations are disclosed,
never reconstructed. Incoming text is inert and exported Markdown stays escaped.

Individual actions recheck comparison identity, original packet identity and the
current note captured when rendered. Stale actions are refused. A later manual
edit makes the earlier choice visibly out of date. Applying an incoming note does
not alter the original packet, incoming overlay, carried baseline, campaign,
incident or export selection. There is no assignment, execution, storage or sync.

## Prior next-shift continuation demo

1. **0:00–0:45 — Stage.** In Shift Review Desk, choose the accepted v1.7 sample
   `shift-review-overlay-example.json` using **Prior review overlay JSON**.
   Read its declared original/review sources and available/omitted note counts.
   Staging loads no notes and grants no authority. Press **Continue review**.
2. **0:45–1:30 — Continue.** Filter Review progress to Carried unchanged.
   Inspect one note, compare its immutable carried baseline, change its next
   action and save. It becomes Edited from carried; original BLOCKED/NEEDS_REVIEW
   and separate provider/compliance assertions remain unchanged.
3. **1:30–2:15 — Preserve scope.** Clear export selection and select one row.
   Read the excluded-note warning. Use **Include all saved notes** if all saved
   notes should carry forward. This action only changes file export selection.
   Previously claimed but omitted note contents are unavailable, never invented.
4. **2:15–3:00 — Round trip.** Download review JSON/Markdown, clear the desk,
   choose the newly downloaded JSON as a prior overlay, then Continue review.
   Available saved notes now form the next session baseline. No mutation,
   assignment, incident closure, provider attestation or durable history occurred.

Continuation accepts only the existing `agentcore2.synthetic-shift-review-overlay.v1`
contract, up to **4 MiB**; its embedded original still has the 2 MiB/12-run/2,000-
evaluation limits. Selected identities/revisions, copied evidence, annotation flags,
notes, totals and next actions are reconciled against the original packet. Strict
bounds/shape checks fail closed. The two file controls distinguish original evidence
from prior operator notes; clear before replacing an active desk. Clear also cancels
staged/in-flight input. Input is untrusted; source labels and any omitted-note count
remain self-reported declarations rather than authenticated proof.

Only annotations actually present in the selected overlay evaluations can be
restored. Unselected prior notes have no identities/content in the v1 format;
their bounded reported count is disclosed, not treated as available evidence.
The new export recalculates current counts from the available desk notes. It
keeps the same v1 schema and original packet, with no nested overlay history or
fabricated parent chain. Progress comparison is in-memory against this import
only; edit-back to the baseline appears Carried unchanged again.

## Prior Shift Review Desk demo

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
  Overlay schema is `agentcore2.synthetic-shift-review-overlay.v1`; only the
  separate continuation input accepts it as operator notes. It cannot be imported
  as original execution evidence. Notes do not resolve exceptions.
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
| SecOps / 3–5 min | Story packs → Security | Three exact synthetic groups across LAB-01–LAB-03; freeze IDs/revisions; remove public TCP 22 only and retain unrelated ingress; one Approve Once or Reject decision covers the group. Optional stale, unauthorized, provider/compliance mismatch and final-target partial scenarios retain zero real writes. |
| Management / ~3 min | Incident story | Synthetic ServiceNow-style intake, triage and exact proposal; human decision in Copilot; return and Update from evidence. Executive brief names problem/action/control/outcome/evidence. Reject/mismatch/missing evidence stays OPEN. |
| Engineers / 2–3 min | Learning mode | Nine read-only architecture stages explain AI limits, registered tools, validation, approval, fixed execution, independent evidence and matching audit. Five channels are views of the same contract. |

Story scenario selection takes effect when **Load bounded story** is pressed.
Enterprise Evidence branch freezes at triage/preview. Presenter cues are embedded
in each view. Inspect in Copilot retains the same finding/proposal. Read existing
evidence never executes. Changing context cancels authority; load again to rehearse.
Changing inventory resets active inventory/proposal state. Retained story records cannot attach a
new run merely because reset reused an ID. No durable-provider recovery is claimed.

## Four-minute S3 + SSH walkthrough

1. **0:00–1:45 — S3 story.** Open Story packs → Compliance, load the synthetic
   finding, explain/investigate, preview the fixed TLS policy, then Approve Once
   or Reject. Read the separate simulated provider and compliance evidence.
2. **1:45–3:15 — Grouped SSH story.** Select Security and load. Inspect the three
   LAB aliases and exact group IDs/revisions. The fixed diff removes only public
   TCP 22 ingress; unrelated ingress stays. Preview and make one decision for
   this frozen three-group set.
3. **3:15–4:00 — Handoff.** Open Operations Campaign, select the two complete
   story runs, download JSON and Markdown, then open Shift Review Desk and import
   the JSON. This checks the exported source-bound packet offline. Both runs are
   synthetic; imported review does not create authority. Hosted viewer remains
   NOT RUN and real writes remain zero.

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

- `reconciliation-incoming-sample.json`: synthetic counterpart exported by the
  current desk for the comparison demo; same original packet as the v1.7 sample.
- `reconciliation-validation.json`, `evidence/reconciliation-desktop.png` and
  `reconciliation-overlay-example.json` / `.md`: focused Cloud proof and actual
  downloaded reconciled outputs bound to current v1.9 source.


- `continuation-validation.json` and `evidence/continuation-desktop.png`: current
  historical v1.8 source-bound focused Cloud round-trip proof.
- `continuation-overlay-example.json` / `.md`: actual next-shift downloaded outputs.


- `shift-review-sample.json`: real synthetic v1.6.0 exporter output from
  `main@32b36f31ab3083b1fdd0eb5a433922d6951e16e3`, not live/provider data.
- `shift-review-validation.json` and `evidence/shift-review-desktop.png`: final
  Historical Cloud desktop proof tied to the v1.7.0 HTML digest, not current bytes.
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
