# Issue #3 S3 specialist

The managed AgentCore Harness owns the model loop. `harness.json` registers only
the read-only `inspect_s3_ssl` inline tool; model output cannot approve or mutate.
The custom ARM64 environment contains a deterministic implementation of the
existing ComplianceBackend JSON seam. An IAM-authenticated operator client
dispatches fixed RPC requests through InvokeAgentRuntimeCommand.

`service.py` enforces exact bucket identity and follow-up ownership tags, explicit
one-time decisions, policy drift checks, write-intent journaling and native S3
request IDs. Provider readback and a second SSL control evaluation are distinct.
The latter is a deterministic compliance evaluator, **not AWS Config convergence**.

Local safety checks: `cd harness && python3 -m unittest -v`.
Container: `docker buildx build --platform linux/arm64 --provenance=false --load -t agentcore2-issue3-harness:f1 harness`.
The managed Harness overrides container startup; `rpc.py` is invoked with a fixed,
base64-encoded JSON request. `server.py` also implements `/ping` and `/invocations`
for local/standard Runtime protocol checks. Never publish its local server port.

Required runtime environment: CANARY_BUCKET, FOLLOWUP_ID, AWS_REGION and STATE_PATH.
No credentials are packaged. Runtime access is AWS IAM authenticated. The new
runtime role is scoped to this image, model and exact new canary; pre-existing
resources remain off limits.

Model scope: exactly Nova Micro APAC, Nova Lite APAC and Nova 2 Lite global,
per Issue #3 comment 5924722893. The current owner decision makes
`global.amazon.nova-2-lite-v1:0` the explicit demo default in the source config,
operator client and React preview selector. Earlier deployed model settings and
portable MOCK comparison labels remain historical; no Harness update or
invocation is authorized by this repository change. No automatic fallback is
performed if Nova 2 Lite fails; MOCK remains independent. The Python
operator client owns the allowlist and forwards only a model ID, fixed Converse
format and 256-token cap. Prompt, tools and remediation authority stay unchanged.
The private journal limits this experiment to 18 model API attempts; no automatic
SDK retries. Token usage and latency are recorded, not invented dollar prices.
See [the MOCK/reuse/cost contract](../docs/mock-live-cost-contract.md) for the
five-capability boundary, retained resources and proposed $20 budget alert.

The three static previews start in MOCK. To connect live, run `bridge.py` on Home
with the private state and a mode-0600 random token file, then forward Home port
8703 with the existing SSH target. The bridge binds only 127.0.0.1, checks Host,
exact deployed preview origins and a private bearer token; AWS credentials stay
on Home. The browser token stays in memory only. HTTPS previews accessing
loopback may require the browser's local-network permission. This path needs a
real browser check before claiming GUI live proof. Never open the bridge publicly.

Sources: [managed Harness environment](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-environment.html),
[registered inline tools](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-tools.html),
[Harness versus Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-vs-runtime.html).
