# Preview comparison notes (M2)

All three previews consume the **same** `@agentcore2/contracts` seam and the
same synthetic dataset. They differ only in interaction model. No winner is
declared yet — these are working observations from building and exercising each
against the mock backend.

## Preview A — Config-style baseline (little/no AI)

- **Immediately understandable:** yes. A findings table with severity/status
  filters is the mental model every Ops engineer already has from AWS Config /
  Security Hub. Zero learning curve.
- **Clicks to remediate:** select row → Preview Fix → Approve Once → read
  evidence timeline. Four deliberate steps; the exact target is always on screen.
- **Where it's weak:** no help understanding *why* a finding matters or what the
  blast radius is — the operator brings that knowledge.
- **Trust:** high. Everything is explicit and deterministic; nothing is inferred.
- **Should stay deterministic:** the table, filters, the exact-target approval,
  and the evidence timeline.

## Preview B — Cloudscape + contextual Copilot

- **AI helps:** Explain/Investigate turn a terse rule id into plain language
  bound to the *selected* finding, so the assistant can never drift into a
  generic chatbot — the finding + resource stay pinned as context.
- **AI gets in the way if:** it were allowed to free-type actions. Here it can
  only Preview Fix / Approve / Reject through the same governed seam, so the
  assistant proposes but the deterministic backend disposes.
- **Clicks:** fewer to *understand* (Explain is one click), same governed count
  to *act*.
- **Trust:** medium-high, conditional on the approval step staying explicit and
  the exact target being shown before Approve Once.
- **Should stay deterministic:** approval, execution, and both readbacks.

## Preview C — Agent action / generative UI

- **Immediately understandable:** the card format ("impacted resource / tool
  selected / approval state / run state / evidence") reads like a work item, not
  a chat log. Good for triaging many proposed actions at a glance.
- **Where it helps:** the *tool selected* line makes the agent's capability
  choice legible — you see it picked a registered capability, not an arbitrary
  command.
- **Where it's weak:** a dense grid can hide the long tail; needs paging/bulk
  controls (Preview D territory) at real scale.
- **Trust:** medium. The structured card makes the proposed change auditable
  before approval, which is reassuring; the risk is a card implying more
  autonomy than the governed seam actually grants.
- **Should stay deterministic:** which capability a card may invoke, and the
  approval/execution/readback chain behind each card.

## Cross-cutting

- The **same governed seam** powers all three — a REJECT anywhere is zero
  writes, an APPROVE_ONCE anywhere produces distinct provider vs compliance
  readback. That is the durable win: interaction model is swappable; governance
  is not re-implemented per UI.
- **MOCK badge** is visible on all three, so no preview can misrepresent
  synthetic data as live.

## Open questions for the live milestones (M3/M4)

- Does the contextual copilot (B) still feel bounded once a *real* agent trace
  and latency are involved?
- Do action cards (C) scale, or do they need the Ops control room (D) paging?
- Which surface best exposes a durable, resumable run id after session loss?
