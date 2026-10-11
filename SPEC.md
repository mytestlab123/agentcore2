# Issue35 — Shift Handoff Reconciliation

ACTIVE; same sole saved Cloud writer, one branch review/issue35-reconciliation/PR.
Base e76028e1cfb74211fc45c093b454fab2068b156d. Preserve accepted prior receipts.

M1: separate local comparison overlay, existing strict bounded v1 admission. Whole
embedded original packet must match the loaded original structurally (record order
included), not just fingerprint/IDs. Classify available exact unresolved notes as
SAME/INCOMING_ONLY/LOCAL_ONLY/CONFLICT; display bounded/paged notes and provenance.
M2: individual Keep current / Use incoming choices; no blanket/automatic winner.
Guard current original, comparison instance and exact current note before applying.
Only current bounded operator notes change. Incoming/baseline/original evidence,
campaigns, incident and export selection unchanged. Session choices are not audit
history. Clear comparison cancels pending reads/choices but keeps applied notes;
full desk clear resets all. Never infer missing notes or delete by absence.
M3: current flat v1 JSON/Markdown export/reopen proof, compact demo/docs/source
receipt, syntax/smallest existing checks, one focused Cloud desktop smoke and
exact-head CI. Parent independent source review before a new merge decision.

No Site/auth/publication, AWS/provider/model/ServiceNow calls, credentials, storage,
backend/infra/cost/mobile/dependency/framework/CI machinery/dispatch. Issue29 hosted
gate separate. Only implementation authorized; PR34 merge approval not reusable.
