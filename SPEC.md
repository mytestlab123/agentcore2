# Specification — Defence Factory MVP

## MVP-FIRST DEVELOPMENT POLICY

Owner override, 16 October 2026. Defence Factory is an MVP / advanced prototype,
not an enterprise production platform. **BUILD → DEMONSTRATE → IMPROVE.**

1. Working functionality before enterprise hardening.
2. Deliver the smallest complete end-to-end vertical slice.
3. Fix real defects; defer hypothetical future problems.
4. Reuse existing code, tools, roles and workflows.
5. No unnecessary frameworks, layers or infrastructure.
6. Minimal meaningful tests and evidence only; reuse completed proof.
7. Do not repeatedly request GO for routine development.
8. Manager owns cross-repository technical delivery and technical acceptance.
   Home Core2 X remains the sole writer until Manager records its release in
   Issue19; only then may Manager admit one identified repository-bound cloud
   successor. Never allow concurrent Home/cloud writes or duplicate writer
   lanes. Preserve Home session/history for recovery. Admission conveys only
   approved repository/source scope, not cloud-product auth or AWS, account,
   credential, provider, IAM, secret, or audience authority. G independently
   reviews and may merge eligible PRs.
9. Optional hardening must NOT block MVP milestones.
10. Enterprise security, scalability, multi-tenant complexity and comprehensive
    edge-case coverage are future phases.

### Mandatory safety boundaries

- Personal AWS LAB only; never company, office, GovTech or PROD accounts.
- Human **Approve Once** for each fixed real-remediation batch.
- Preserve protected awsops Issue #89 fixtures.
- No root credentials, secret exposure or accidental destructive actions.
- Live IAM installation and remediation require exact, separate owner authorization.
- Keep MOCK and REAL evidence distinct. Private bindings stay out of public GitHub.

These are real boundaries, not a reason to invent additional approval ceremonies.
This policy supersedes conflicting older workflow preferences, not these boundaries.
Repository-only work and safe source merges need no repeated GO; source acceptance
never authorizes AWS installation, remediation or publication to a new audience.

# Issue39 — Defence Factory product acceptance boundary

Implementation and writer admission are governed by Manager Issue19. Core2 Issue39
and AWSOPS Issue90 remain product-acceptance records until Manager completes their
transfer closure; after closure, these records are historical acceptance evidence,
not active writer authority. MOCK compliance file
intake → exact compatible group → one consumed decision → simulated per-target
outcomes → evidence. Reuse the existing standalone executor, no frontend fork.
256 KiB/500-row synthetic input; private fields rejected, opaque aliases only.
Original assertions remain separate from simulated provider/compliance results.
Source and hosted version are separate; Issue37 real-viewer observations NOT_RUN.
No real AWS/model/provider calls, IAM, credentials, public hosting or new infra.
Existing owner-only Site publication requires verified identity/workflow and
accepted source; no audience expansion. See contracts/defence-factory and
[progress/gates](docs/defence-factory-progress.md). Earlier Issue35 scope below is
historical, not current merge authority; its accepted PR36 remains unchanged.

## Preserved Issue35 scope

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
