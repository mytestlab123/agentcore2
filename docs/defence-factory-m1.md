# Issue39 M1 — source, story and UI contract

Updated 2026-10-15. Implementer: dot using native tools under updated #39.
Source baseline: main 5c5849d7389c94de3040ec5a2fab40f44d355939 (v1.9).
Existing PR38 remains draft, its five Markdown files unmodified. Its real-viewer
acceptance is intentionally not inferred; this milestone adds separate files.
PR8 identity-only draft is unrelated and not resumed. No active overlapping M1
implementation PR was found at reconciliation.

## One supported four-minute story

Reuse [PR38's pinned script](https://github.com/mytestlab123/agentcore2/blob/a5c2ee666b8a4f6262aab3254999d5d435b97586/docs/operator-journey.md):
1. 0:00–0:40: one synthetic S3 encrypted-transport finding.
2. 0:40–1:20: Preview exact fix; inspect one target/revision and before/after.
3. 1:20–2:00: one human Approve Once (Reject is equally legitimate).
4. 2:00–3:00: provider parameters match, independent compliance NEEDS_REVIEW.
5. 3:00–4:00: select that complete journal record and export Markdown handoff.

One simulated write, zero real writes; completion does not mean compliance.
Controls exist in source v1.7 and v1.9. This document is not a viewer observation.

## Version/evidence matrix

| Layer | Evidence | Limit |
|---|---|---|
| Repository | PR30/32/34/36 merged, current v1.9 source | Merge is not publication |
| Private Site | [11 Oct publication receipt](https://github.com/mytestlab123/agentcore2/pull/32#issuecomment-6105943302): v1.7, b95d4c7d | Historical verified release; no fresh hosted page inspection in M1 |
| Hosted journey | [Issue29 access receipt](https://github.com/mytestlab123/agentcore2/issues/29#issuecomment-6103715474) | ACCESS_BLOCKED at owner login; no app defect proven |
| Real viewer | Issue37 and PR38 blank card | NOT_RUN; no fabricated person, answers or pass |
| #39 shared boundary | [v1 contract](../contracts/defence-factory/README.md), synthetic example | Not yet wired to UI/backend; no live calls or approval authority |
| Backend | awsops#86 real read-only proof, awsops#90 new scope | This UI remains MOCK; #89 fixtures cannot be changed |

Use the existing [private Site](https://agentic-operations-lab.amit-6719.chatgpt.site)
only with verified permitted access. No Site call, publication, sharing/login
change, browser rerun or alternative hosting occurs in this source milestone.

## Integration plan / next

M2 maps bounded sanitized input to the versioned safe alias projection, distinct
from official synthetic fixtures. Candidate controls are a catalog target, never
claimed live coverage. M3 reuses the standalone showcase's stronger frozen scope
and consumed-decision logic; legacy optional-guard mock backend is not promoted.
M4 exports exact selected results with REAL_WRITES=0 and independent freshness.
M5 records actual release separately; source may finish while hosted access is
blocked. Keep PR38/Issue37 observation truthful and independent.

M1 changes only shared schema, invented fixture, semantics and this baseline.
No new frontend engine/framework, AWS/model/provider calls or infrastructure.
