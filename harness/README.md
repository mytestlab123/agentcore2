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
Container: `docker buildx build --platform linux/arm64 --load -t agentcore2-issue3-harness:f1 harness`.
The managed Harness overrides container startup; `rpc.py` is invoked with a fixed,
base64-encoded JSON request. `server.py` also implements `/ping` and `/invocations`
for local/standard Runtime protocol checks. Never publish its local server port.

Required runtime environment: CANARY_BUCKET, FOLLOWUP_ID, AWS_REGION and STATE_PATH.
No credentials are packaged. Runtime access is AWS IAM authenticated. The new
runtime role is scoped to this image, model and exact new canary; pre-existing
resources remain off limits.

Sources: [managed Harness environment](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-environment.html),
[registered inline tools](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-tools.html),
[Harness versus Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/harness-vs-runtime.html).
