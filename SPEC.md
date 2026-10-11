# Issue31 — Offline Shift Review Desk

ACTIVE; one saved Codex Cloud writer, branch review/issue31-shift-desk, one PR.
Base32b36f31ab3083b1fdd0eb5a433922d6951e16e3; accepted Issue29 source preserved.

M1 explicit local JSON import: bounded size/runs/evaluations/text, strict v1 schema,
identities, complete evidence, duplicate and totals consistency. Treat all text as
untrusted display-only; provenance is self-reported, not attestation. No imported
execution/approval authority; reject active/incomplete/inconsistent packets.
M2 exact evaluation inbox/filtering from imported evidence only; distinguish unique
resources and evaluations, unresolved outcomes, and supported severity mapping.
M3 bounded memory-only operator notes keyed by exact source identity. Never change
original outcomes, provider/compliance evidence, incident state or campaign state.
M4 JSON/Markdown overlay includes source identity, exact selection, untouched
original evidence, notes/outstanding actions and honest totals including unreviewed.
M5 four-minute demo/docs, minimal existing checks, one final Cloud desktop smoke,
source-bound receipts, exact-head CI and independent source review before merge.

No provider/AWS/model/ServiceNow calls, credentials, infrastructure/cost, publication,
Site/auth troubleshooting, mobile, new framework/dependency/test suite/CI machinery.
Issue29 hosted E2E is separate and remains open. Source merge authorized only after
independent review and repository/exact-head CI gates; preserve rollback evidence.
