# Two separate surfaces

The Site runs in the browser: generated synthetic records, filter/selection,
deterministic context, frozen proposal, one consumed decision and simulated
evidence. It contains no AWS client, bridge, model or backend implementation.
`connect-src 'none'` denies application connection requests. Reset/reload
restores in-memory data; no browser storage or credentials are required.

The **separate engineering application** has this explanatory architecture:

```mermaid
flowchart TD
  A[Amplify Preview B] --> B[Private bridge]
  B --> C[AgentCore Harness]
  C --> D[Governed backend]
  D --> E[AWS]
```

The Harness investigates through registered tools. The governed backend owns
target checks, fixed capabilities and explicit single-use approval. Provider
readback and compliance evaluation are different observations. This Site only
explains that architecture; no arrow represents a connection from the Site.

## Simulated authority

Selection → compatible scope → immutable exact-target proposal → Approve Once
or Reject → evidence. Commands change filters/selection only. The assistant
cannot approve, expand a frozen target set or run arbitrary commands.

Rejection records zero writes for every target and skips readback/evaluation.
Approval changes only invented in-memory records. Optional blocked targets
fail before writing and remain NON_COMPLIANT. VERIFIED / PARTIAL / REJECTED
are mock outcomes, never evidence of an AWS write or Config convergence.
Evidence replay cannot execute. Switching filters/context invalidates pending
authority; existing run evidence remains explicitly scoped to its own targets.

The separate engineering demo is an ordinary explicit navigation link.
It may require private operator setup to use LIVE LAB. The Site never embeds,
prefetches or calls it. No bridge address, token or deployment identity is copied
into this portable package.

## Operations Campaign (Issue29)

The campaign derives inventory totals and four 25-target queues from the existing
synthetic records. Open/Preview uses the same selection, scope, proposal, human
decision and fixed-tool executor. A queue is never approval for another queue.

The session journal copies and freezes recorded runs at the evidence boundary.
Identity is inventory epoch + run ID + proposal ID. Up to 12 recent records survive
inventory reset in memory; reload clears them. Only the current interrupted run
can resume through its existing consumed proposal. Final snapshots never change
when another finding/run is selected. No new persistence or transport exists.

Selected complete snapshots feed both audit formats through the existing Blob
export mechanism. Counts distinguish evaluations from unique targets within each
epoch, and unresolved from verified evaluations. Provider readback and compliance
remain separate; no incident record is inferred or attached. An incomplete record
cannot be selected for the final packet. Historical proof files retain their own
source digests and do not verify the campaign release.
