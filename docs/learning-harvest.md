# Sanitized learning harvest for G

No KB repository write is authorized in this lane. This file is the portable
harvest from the focused follow-up, without account IDs, ARNs, private endpoints,
credentials or LAB-specific execution identifiers.

## One Harness, multiple models

Keep one default model and pass a server-validated per-invocation override.
One registered-tool set and governance seam keeps permissions independent of
the model picker. Use a short explicit allowlist, never caller-supplied arbitrary
provider configuration. Cross-Region inference needs a recorded data-residency
decision even when cloud resources remain in one Region.

Economy/Default/Enhanced describe tradeoffs; never imply free inference.
An input-price index is not total request cost. Maintain dated source rates in
one small config, and distinguish final-turn token metadata from complete billing.

## Architecture and build lessons

An x86 workstation can stage pure Python wheels natively in a multi-stage build;
the final deployment environment must be ARM64. Avoid emulated bytecode compilation
when it dominates builds. Publish a single deployment manifest, with its digest.
Bring-your-own Harness container and managed orchestration are separate layers.
Reserved environment variables come from the provider. Check service defaults:
managed memory may be created unless explicitly disabled.

## Stateful tool calls and evidence

Inline functions pause orchestration. Return both the assistant toolUse and the
operator's matching toolResult. Retain actual call IDs, not invented UUID proof.
Use supported text tool-result content when the provider rejects JSON content.
Keep direct-command state separate from pending model handoffs, on the same
runtime and role. Scope tool-selection patterns narrowly; exclude shell tools.

Journal intent before mutations, native response IDs after, and exact provider
state before retry. A rejected local SDK parameter is not a dispatched operation.
An SSH disconnect is not terminal process evidence. Preserve the active handle
and reconcile before starting another build or cloud action.

Governance remains deterministic: exact target and ownership, immutable decision,
one-time approval, drift checks and uncertain-write stop. Provider readback and
a separate compliance evaluation are different evidence; neither implies the
other, and a custom evaluator must not be described as AWS Config convergence.

## UI and closeout lessons

Several interfaces can share one authenticated transport and deterministic
governance seam. Static hosting can remain MOCK until an operator connects a
loopback-only bridge; keep AWS credentials server-side and the browser token
memory-only. Validate exact origins, host, token and model allowlist before any
provider call. A browser's local-network permission is distinct from disabling
web security. Test anonymous writes and unregistered origin/model rejection.

A complete proof includes both a real GUI model/tool call and a headless invocation
over that same backend. Losing transport after a mutation is a reconciliation
problem, not permission to repeat the mutation. Retain terminal run/readback IDs.
Clean only the exact tagged disposable canary, and record retained resources with
lifecycle review. Deleted resources must be shown absent, not still compliant.
Strip tagged deliberation even if a provider returns it as ordinary text.
