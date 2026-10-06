# Agentic Operations Lab — Issue22

Unpublished, portable **SHOWCASE / MOCK** source for Work + @Sites. Open
`index.html` directly: no install, server, network, model or provider is needed.
Existing public Sites and engineering deployments are unchanged. PR24 holds the
five milestone source changes; G review and roadmap acceptance remain gates.

## Four-minute demo

1. Catalogue: choose Compliance or Security. Inspect purpose, resource, agent/tool
   boundaries, approval and evidence. Eight capabilities: six MOCK READY, access
   logging MOCK PARTIAL, snapshot exposure PLANNED. Readiness means local behavior,
   never a live AgentCore resource.
2. Incident story: link a synthetic Northstar archive finding, triage and propose.
   Review in Copilot. Explain/Investigate are scripted, bounded MOCK reasoning.
3. Inspect the exact policy diff and target. Approve Once or Reject. Evidence
   separates simulated operation, provider readback and independent compliance.
4. Return to the incident and update from evidence. Rejection stays OPEN; only
   the matching verified run resolves it. Export the synthetic audit record.
5. Agent Platform: change between Copilot, CLI, API, event and ticket presentations.
   Each reads the same proposal/run and calls the same preview function. No shell,
   endpoint, scheduler or ServiceNow instance exists.

## Governance scenarios

In Governance, select and load a scenario, then Preview Fix and decide. Options:
normal/reject, unauthorized (zero writes), stale snapshot (zero writes), policy
block, 34-target partial batch, three-target interruption/resume and provider /
compliance mismatch. Try consumed approval records refusal without another write.
Resume continues the same in-memory run after its recorded cursor; reload/reset
clears session state. This is not durable recovery or a provider exactly-once claim.
Mismatch records NEEDS_REVIEW even when provider parameters match.

## Contract and source

`packages/contracts/src/backend.ts` and `remediation.ts` define the source contract
vocabulary: capabilities, exact proposal targets, decision, run and evidence.
The portable HTML models those semantics locally; it does not import the compiled
backend or claim an API integration. Its existing `preview`, `decide`, `runChunk`
and `history` are the single implementation shared by channel/incident views.
Agent responsibility is explanation and capability selection. The registered
executor owns fixed mutations and policy checks; selecting a model grants nothing.

The deterministic generator inside `index.html` provides 58 invented LAB accounts,
49,476 baseline findings and S3/SG/EC2 resources. No private data is required.
Only compatible explicit selections share approval. JSON exports remain local.

## Portable handoff

Provide `index.html`, `RELEASE.json` and `site-prompt.md` to Work/@Sites.
RELEASE.json binds the HTML bytes and embedded source fingerprint. Historic
proof files/screenshots describe earlier versions and are not Issue22 acceptance.
The document title retains the old Preview B compatibility label; the visible
product is Agentic Operations Lab. No mobile milestone is included.

`issue22-validation.json` and its desktop screenshot remain evidence for their
original HTML digest. The later model/cost follow-up restores explicit zero-agent
wording, refreshes RELEASE.json and corrects the existing state check's stale
architecture nodes/link count; it does not claim a new browser acceptance run.

Small existing check: `node showcases/chatgpt-sites-preview-b/check-state.cjs`.
Per milestone stop after syntax and the smallest useful state/manual check.
One desktop smoke and existing build/test/typecheck belong at major finish.
No new browser, dependencies or CI machinery is required. New AWS cost: $0.
