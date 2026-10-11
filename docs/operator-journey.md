# One bucket, one decision, an honest handoff

**Purpose:** help an operator decide on one bounded change and leave the next
shift evidence of what still needs attention. Feature expansion is paused.
[Issue37](https://github.com/mytestlab123/agentcore2/issues/37) owns the real-viewer
follow-up. **Viewer validation: NOT RUN.** This document is a script, not results.

## Presenter setup — before the four-minute clock

Use the [existing private Agentic Operations Lab](https://agentic-operations-lab.amit-6719.chatgpt.site)
only through already-permitted access. Parent reports
it serves **Issue31 v1.7**; this task has not inspected the hosted page. Start a fresh
synthetic session, open **Story packs**, choose **Compliance · S3 encrypted
transport**, choose **Provider succeeds · compliance needs review**, then press
**Load bounded story**. Leave the proposal uncreated. If the controls/version differ
or access is unavailable, record that mismatch and stop; do not troubleshoot login,
change sharing, publish, or substitute another version and call it hosted proof.

Say once: “This is a scripted simulation with invented data and zero real writes.
We chose an example where a change matches its parameters but compliance still
needs review.” Do not narrate release numbers, agents, schemas or inventory totals.

## Four-minute script

| Time | Show / do | Say |
| --- | --- | --- |
| 0:00–0:40 | Point to the single loaded finding and its NON_COMPLIANT status. | “This bucket can accept insecure transport. I need to decide whether to make a narrow change before handing it to the next shift.” |
| 0:40–1:20 | Press **3 · Preview exact fix**. Point to the one target ID/revision and BEFORE / PROPOSED diff: deny insecure transport; retain public-access protection. | “This proposal covers this bucket and this fixed change only. Nothing has run yet.” |
| 1:20–2:00 | Inspect the frozen target, then press **Approve Once** once. | “I approve this one simulated change. The approval cannot expand the target or be reused. I could reject it without any writes.” |
| 2:00–3:00 | Read **Outcome: NEEDS_REVIEW** and the separate **Provider readback** / **Independent compliance** lines. | “The simulated change matched its parameters. The independent compliance check still says noncompliant, so I cannot call this fixed. One simulated write; zero real writes.” |
| 3:00–4:00 | Open **Operations Campaign** → **Session journal & shift handoff**. Select only this complete NEEDS_REVIEW record; use **Inspect record**, then **Download selected Markdown**. Open the downloaded text. | “The next shift gets the exact target, my decision, both checks, and the unresolved result. They can investigate the remaining exception without guessing what ran. This file records evidence; it does not grant permission to run anything.” |

End there. Do not tour other workspaces or demonstrate another scenario.
Expected scripted record: **one target evaluation, one unresolved evaluation,
one simulated write, zero real writes**. A complete recorded run can still need
review; completion is not the same as compliance. Read the actual record—never
substitute these expected numbers if the session differs.

## Five-minute real-viewer card — facilitator copy

Parent selects a real viewer; no viewer or session is booked by this document.
Prefer someone who might receive an operations handoff and did not implement the
UI. Use the same prepared, unapproved single-finding scenario. Record whether the
viewer already saw the four-minute demo. Read only the task aloud; do not show
expected answers or coach button choices. Do not include sensitive personal data.

**0:00–3:00 — Task, read verbatim:**

> “You are ending your shift. This bucket has an insecure-transport finding.
> Decide what you would do with the proposed change, then leave a handoff another
> operator could use. Tell me what you are looking for as you go. You may choose
> not to make the change.”

Wait before helping. If needed, use only neutral prompts: “What are you looking
for?”, “What do you think that means?”, or “What would you try next?” Log every
prompt and any direct assistance. Reject is a legitimate decision; do not steer
toward approval just to reach the scripted outcome.

**3:00–4:30 — Ask without correcting answers:**

1. “What did your decision authorize, and for which resource?”
2. “What happened, and what evidence would you use to say it is or is not fixed?”
3. “What, if anything, changed in a real system?”
4. “What would the next operator learn from your handoff, and what remains to do?”

**4:30–5:00 — Ask:** “Where did you hesitate?” and “What could we remove or make
clearer?” Capture the viewer's words before discussing improvements.

**Success criteria — score from observed behavior and answers, not a satisfaction
rating:**

- Viewer inspects the one target/fixed change and makes an explicit bounded decision.
- If approved, distinguishes matching provider parameters from failing compliance
  and leaves the item unresolved. If rejected, explains that no change/readback/
  compliance check was performed and the original finding remains unresolved.
- Describes the experience as synthetic with zero real writes; does not infer live
  AWS activity, a fleet-wide fix or approval for future actions.
- Locates/exports the selected run's handoff and explains a useful unresolved next
  step from its evidence. No direct button coaching is needed to complete the task.

If a critical distinction needs explanation, record **NEEDS CLARIFICATION**, not a
pass. If access or controls prevent the task, record **ACCESS/VERSION BLOCKED**,
not viewer failure. One viewer informs the next simplification; it is not broad
product validation or an automatic release/merge gate pass.

### Blank observation record

| Field | Actual observation / feedback |
| --- | --- |
| Viewer alias / relevant experience | |
| Facilitator / date / mode (hands-on or observed) | |
| Site/version observed; access available? | |
| Saw scripted demo beforehand? | |
| Task start/end; decision chosen | |
| First action / hesitation points | |
| Neutral prompts and direct hints given | |
| Exact answer: decision scope | |
| Exact answer: outcome and evidence | |
| Exact answer: real-system changes | |
| Exact answer: handoff value / unresolved next step | |
| Export obtained / selected run identity | |
| Criterion results and supporting observations | |
| Viewer quote: what to remove or clarify | |
| Result: PASS / NEEDS CLARIFICATION / ACCESS-VERSION BLOCKED | |
| Smallest documentation/UI follow-up suggested (not authorized here) | |

## Source and deployment compatibility — facilitator reference

| Reference | What is established |
| --- | --- |
| [v1.7 source, Issue31 merge `b95d4c7d`](https://github.com/mytestlab123/agentcore2/blob/b95d4c7d3469460bf1cb26a5b972cbfb5d3c924a/showcases/chatgpt-sites-preview-b/index.html#L325) | Source inspection confirms Story packs, the single-target preview/decision, mismatch evidence, campaign journal and selected Markdown export. These are the only controls used above. |
| [v1.7 source receipt](https://github.com/mytestlab123/agentcore2/blob/b95d4c7d3469460bf1cb26a5b972cbfb5d3c924a/showcases/chatgpt-sites-preview-b/RELEASE.json) | Release v1.7.0-mock; HTML SHA256 `710d46d30caaa7ce2d34d397ab2cb62bbf981c3f54d1c41f8b9605b6b3f5b482`. Parent reports this as deployed, not freshly verified here. |
| [Current main `5c5849d`](https://github.com/mytestlab123/agentcore2/blob/5c5849d7389c94de3040ec5a2fab40f44d355939/showcases/chatgpt-sites-preview-b/RELEASE.json) | v1.9 source includes later continuation/reconciliation. Those features are not assumed available on the v1.7 Site and are not required by this journey. |
| Hosted behavior / real viewer | NOT VERIFIED by this docs task. No browser rerun, Site call, login attempt or viewer session occurred. [Issue29](https://github.com/mytestlab123/agentcore2/issues/29) remains a separate hosted gate. |

**Known mismatch:** main is v1.9; reported deployed source is v1.7. No required
control mismatch was found in source. Actual hosted version, accessible controls,
download behavior and viewer comprehension still need observation. Source receipts
and earlier automated smoke results are not substitutes for a real viewer.

**Optional appendix, after feedback only:** JSON is available beside Markdown if
someone needs structured evidence. Shift Review Desk imports, note continuation
and two-file reconciliation have their own reference guides in the showcase
README; do not introduce them during this four-minute story or five-minute test.

**Minimal next action:** parent chooses one viewer with permitted access and runs
this card once, recording actual observations in the blank fields. If access is
unavailable, record the block; do not manufacture a viewer result or widen access.
