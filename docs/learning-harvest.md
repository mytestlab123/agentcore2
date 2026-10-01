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
