@Sites

Create a polished, responsive **MOCK SHOWCASE** of Preview B — Contextual Copilot
v1.1 from the attached index.html. Preserve its behavior, fixture and visual
language: blue operator controls, bounded finding context, clear evidence,
dark/light theme. Use simple static HTML/CSS/JS, with no interaction dependencies
on network requests, external assets, frameworks or services.

Use only the five synthetic findings in the reference. Keep a prominent MOCK
SHOWCASE badge and the statement “No AWS connection in this Sites version.”
Never claim that this showcase is LIVE or that a simulated write occurred in AWS.

Include:

- Findings table, status/fixability filters and finding/resource search.
- AUTOMATED only when NON_COMPLIANT and remediationCapabilityId exists; MANUAL
  otherwise. Do not invent GUIDED or ASYNC.
- Contextual assistant bounded to the selected finding: Explain, Investigate,
  Preview Fix. Use deterministic canned text, not a real chat/model integration.
- Exact-target mock SSL-only proposal. Approve Once consumes one proposal and
  simulates one write, provider readback, then separate compliance evaluation.
  Reject consumes the proposal with zero simulated writes and leaves the finding
  NON_COMPLIANT. Disable Preview Fix for manual/non-actionable findings. Clear
  pending proposal/run state when selection changes. Reset restores fixtures.
- Five-step MOCK evidence timeline: Proposal → Approval → Provider write →
  Provider readback → Compliance result. Label simulated evidence and missing
  steps truthfully; do not infer success.
- Exactly three illustrative model labels: Nova Micro — Economy — 1.0x;
  Nova Lite — Default — 1.7x (selected by default);
  Nova 2 Lite — Enhanced — 8.7x. These are relative INPUT cost indices compared
  with Micro, not total request prices or “free” models. Selection never makes a
  model call, changes permissions or changes approval authority.
- Accessible buttons/selects, dark/light toggle and narrow-screen layout.
- A concise “How the real system works” section:
  Amplify Preview B → private bridge → AgentCore Harness → governed backend → AWS.
  Explain that this architecture belongs to the separate engineering demo and
  none of those connections exist in the showcase.
- An ordinary explicit link to the real Preview B engineering demo:
  https://main.d2rar4n3w1jdwz.amplifyapp.com
  Do not embed it, prefetch it or make calls to it.

Do not add SDKs, credentials, account IDs, ARNs, tokens, bridge addresses, private
identifiers, storage of secrets, localhost/private-network access, runtime
dependencies, model calls, or any real remediation. Keep all fixture and state
in the static page. No external fonts/scripts/images are needed.

Save a version WITHOUT deploying it for Amit to review. Do not deploy or publish
automatically: Sites deployment URLs are production deployments. Report any
feature of the reference that could not be preserved rather than replacing it
with a live integration.
