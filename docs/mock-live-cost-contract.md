# MOCK-first capabilities and optional LIVE LAB

Authority: [Issue #22](https://github.com/mytestlab123/agentcore2/issues/22)
and [read-only resource/cost review #23](https://github.com/mytestlab123/agentcore2/issues/23).
New infrastructure cost target: $0. No resources, IAM, billing settings or
provider/model calls are authorized by this document.

## One product, one optional live runtime

MOCK finding → simulated reasoning → registered capability → exact proposal →
Approve Once / Reject → deterministic simulated execution → provider readback →
separate compliance result → evidence. The portable showcase works offline when
LIVE LAB is unavailable; it performs no model/provider calls. Its session-local
state is not durable provider recovery. MOCK and LIVE LAB evidence stay distinct.

| Target experience | Primary product | Existing LIVE LAB parity |
| --- | --- | --- |
| S3 SSL / secure transport | MOCK READY | Registered `inspect_s3_ssl`; original disposable canary deleted, so no current compliance claim |
| S3 public-access posture | MOCK READY | No registered live tool for this capability |
| Security Group exposure | MOCK READY | No registered live tool or SG permissions proven |
| Finding triage / investigation | Synthetic bounded explanation/context | Can reuse the same Harness for reasoning about an approved sanitized input; no live integration claimed |
| Evidence / incident reporting | Synthetic evidence export and linked incident story | Local reporting needs no AWS/model; no live ticket service required |

All five need no live AWS for the product. One retained Harness/runtime can host
multiple registered capabilities, but architecture capacity is not implemented
live parity. Reuse the existing contracts, fixed tool boundary and deterministic
operator approval seam. Never expose arbitrary model-selected APIs or let model
text approve/execute. New live tools or IAM scope require a separate exact review.

## Existing resources: KEEP, subject to cost readback

Issue #23 records fresh readback on 2026-10-06: one READY Harness/runtime, one
immutable ARM64 ECR image (~59.7 MB), its runtime IAM role, an ACTIVE memory child
(memory usage disabled), a small runtime CloudWatch log group (~5.8 MB), and three
static Amplify previews. Reuse these only where useful. No EC2/persistent compute,
five duplicated runtimes, browser service, database or ticket integration is needed.
Do not warm the runtime or leave sessions open. The deleted canary is not reusable;
recreating it is a new-resource stop gate. No cleanup is authorized here.

For 2026-10-01 through 2026-10-06 (exclusive end), Issue #23 reports account-wide
Amplify ~$0.0003, AgentCore ~$0.0643, Bedrock ~$0.0018 and ECR ~$0.0035.
These are a short observation window, not a full monthly project forecast.
They exclude unlisted services such as CloudWatch, credits/tax assumptions and
project attribution. Do not claim exact project cost or extrapolate guaranteed
idle spend. Retain if the eventual project total remains roughly $2–5/month or
less with useful demo value; review attribution first if that threshold is exceeded.

## Explicit model, no fallback

Use `global.amazon.nova-2-lite-v1:0`, already in `harness/models.py` and supported
by the [AWS model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-lite.html).
This global inference profile supports the existing Singapore caller and can
route synthetic model inference across Regions; resources stay Singapore.
Do not substitute the base model ID or rely on a Harness default.

`harness/harness.json`, `models.DEFAULT_MODEL` and the React preview selector
explicitly select Nova 2 Lite. Every client model invocation passes `model_config`,
fixed Converse format and the existing 256-token limit. Existing alternative Nova
IDs remain explicit historical comparison choices, never error fallbacks.
AccessDenied, unavailable-model and other provider errors fail clearly; MOCK
continues working. AWS catalogue support does not prove current account access.
No live model call or deployed Harness update was performed for this change.

## ESTIMATED_COST — monthly planning bands

Assume one short weekly demo exercising about five capabilities, a few bounded
model/tool turns, consumption-based microVMs, no warm traffic, no retained live
sessions and modest static-preview/log storage. These bands are rough planning,
not billing attribution or a guarantee:

| Band | Estimated monthly USD | Interpretation |
| --- | --- | --- |
| LOW | $0–2 | Mostly MOCK; negligible optional live usage and small retained storage |
| EXPECTED | $2–10 | Short weekly demo; $10 is the planning allowance |
| HIGH | $10–20 | More rehearsal/model turns or larger context within the intended demo pattern |

Real spend can exceed $20 with uncontrolled usage, persistent sessions, storage or
hosting traffic. Five capability labels have no fixed per-agent fee. Costs arise
from runtime CPU/memory/session lifetime, Bedrock input/output/reasoning tokens,
ECR storage, Amplify storage/serving/builds, CloudWatch ingestion/retention and
memory events/records/retrieval if used. Harness has no separate orchestration fee.
See [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/) and
[Bedrock pricing](https://aws.amazon.com/bedrock/pricing/). Pricing indices in
`apps/shared/model-pricing.json` are dated comparisons, not total request cost.

The existing private client journal records selected model, per-call token usage
when returned, invocation intents/request IDs, elapsed call time, registered tool
results and LIVE_LAB mode. Count actual calls separately from intents; a failed
request may still cost money. Call latency is not full billable session duration.
If a field is absent, report UNKNOWN rather than zero. Full run/session cost and
duration are not currently attributed; do not infer exact dollars from latency.
The existing 18-attempt experiment gate stays intact; this review does not renew
that allowance or authorize recurring live calls.

## $20 alert proposal — not created

Propose one MONTHLY COST budget named `agentcore2-demo-monthly`, limit USD 20,
actual-spend alert at 100% ($20) and forecast-spend alert at 100% when forecasting
data is available, delivered to an owner-private email. No budget actions, SNS,
new role or broad IAM. The `CreateBudget` API uses `budgets:ModifyBudget`, scoped
to this exact budget; readback uses `budgets:ViewBudget`. Existing owner billing
access must suffice; otherwise return the required scope for review. See the
[AWS authorization reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_budgets.html).
Verify exact project cost-tag coverage first; otherwise use
an account-wide budget clearly labelled account-wide, never pretend untagged
service totals are project-only. Do not activate tags or edit IAM in this task.
An alert can be delayed and does not stop spending. Any automatic cutoff requires
a separately approved design. Current authority permits this proposal only.

Next: review the source-only model decision in PR #24. Keep the showcase useful
with LIVE LAB off. No new AWS resource is required for the five MOCK experiences.
