# Focused F1–F5 follow-up

Authority: [G operating decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5923329299).
X/core2 is primary executor. Kiro provides read-only reviews. Home Crew is not
used and its security policy remains enabled. PR #5 remains draft/open/unmerged.

## F1 — code checkpoint

- Current-tree account identifiers removed from CONTEXT.md and three evidence
  docs. Historical exposure remains in Git history by explicit owner decision;
  no history rewrite or force push is authorized.
- The managed AgentCore Harness owns the model loop. Its only registered inline
  tool is read-only inspection. Exact SSL-policy mutation remains a deterministic
  implementation of the shared ComplianceBackend contract, outside model control.
- Stable caller intent IDs make proposals replayable. File locking covers both
  HTTP and fixed RPC transports. Write intent and native request IDs are journaled;
  uncertain mutations fail closed before retry.
- Provider GetBucketPolicy and a separate fresh SSL control evaluation remain
  distinct. This does not claim AWS Config convergence.
- A LIVE badge now requires both provider evidence and an authenticated transport;
  identifiers alone leave the static previews MOCK.
- Kiro [F1 review](https://github.com/mytestlab123/agentcore2/pull/5#issuecomment-5923548574):
  ARM64 base pinned; proposal intent replay fixed; shared lock added; explicit
  missing-environment error added. Actual runtime environment/role/SDK stream
  validation belongs to F2 and is not claimed from local tests.

Validation: 23 TypeScript tests plus 7 deterministic harness tests; full preview
build and typecheck. No cloud resource created at this checkpoint.

## Historical F2 preflight — resolved by the Nova decision

Home Dell tooling: distro docker-buildx 0.30.1 and qemu-user-static 8.2.2
installed as explicitly approved; ARM64 binfmt enabled. Private SDK pinned to
boto3 1.43.104. Identity validated locally as the approved personal LAB user,
profile amit, region ap-southeast-1; no account identifier published.

The regional Bedrock listing returned three direct ON_DEMAND streaming models:
Claude 3 Haiku, Claude 3.5 Sonnet and Claude Sonnet 5. Each returned
agreementAvailability=NOT_AVAILABLE, authorizationStatus=AUTHORIZED,
entitlementAvailability=AVAILABLE, regionAvailability=AVAILABLE. Amazon Nova
models in this listing required inference profiles; no cross-region substitute
was attempted. This is availability evidence, not an invocation test.

Read-only Nova profile follow-up confirmed micro/lite/pro APAC profiles route to
Tokyo, Seoul, Osaka, Mumbai, Singapore and Sydney. Nova 2 Lite uses a global
profile. These do not establish a Singapore-only alternative.

Kiro [read-only scope review](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5923921317)
confirms this gate. Model agreement creation is distinct from an IAM self-grant,
but still outside the enumerated resource authority. The review's Nova suggestion
was checked as described above; no profile invocation or policy change followed.

[AWS model-access documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)
explains that first invocation can initiate a subscription and accept applicable
third-party license terms. The bounded resource grant does not enumerate an
account-level model agreement. X therefore stopped before invocation or cloud
resource creation; no executing-user permissions were changed. The deployment
script checks availability before ECR/runtime creation and fails closed.

No new ECR, role, runtime, preview, or bucket exists from this attempt. No cloud
spend was incurred by an invocation/deployment; this is not a billing-ledger
reconciliation. F2–F5 live acceptance remains incomplete. Resolution requires
owner authority for model enablement or an already-enabled supported model
confined to Singapore. PR #5 remains draft/open/unmerged.

SDK shape checks corrected Harness name collision matching and nested
CreateHarness/GetHarness response handling before any provider call.

## Remaining execution and retention

F2: one NEW ECR image, NEW narrow runtime role and managed Harness/runtime.
F3: three NEW manual-deployment Amplify apps. F4: one NEW tagged SSL-only canary,
Block Public Access enabled, explicit rejection then approved exact remediation.
F5: live CLI/SDK proof and closeout. Persist native IDs before retry. Derive a
testing TTL of 02-10-26 for resources, with canary removed during closeout and
remaining resources retained only within the ~USD 10 boundary. TTL is a review
deadline, not automatic deletion authority.

## F2 live checkpoint — PASS

[Nova decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5924722893)
authorizes cross-Region synthetic inference with exactly three Amazon profiles.
Resources remain Singapore. One new ECR repo/image and one narrow role support
one Harness and its one managed runtime; no Anthropic subscription or self-grant.
Native IDs, image digest, sessions, traces, tools and provider responses are in
[sanitized evidence](focused-live-evidence.json). The resource naming prefix is
agentcore2-issue3-f1-20261001-490ceb; lifecycle review is 2026-10-02.

All three models made an actual registered inspect_s3_ssl call; the exact planned
canary correctly returned NOT_CREATED and writes=0. Final response metadata:

| Model | Final input/output tokens | Provider latency |
| --- | --- | --- |
| Nova Lite default | 647 / 28 | 439 ms |
| Nova Micro | 653 / 40 | 494 ms |
| Nova 2 Lite global | 1064 / 59 | 944 ms |

These are final-turn metrics, not full-request billing. Tool-handoff streams did
not always provide usage metadata. There were 13 model API attempts including
diagnosis; failed attempts are retained as evidence, not presented as successful.
The bounded cap was reviewed and increased from 12 to 18 after SDK integration
failures, with 256 output tokens per call. No automatic SDK retry. The roughly
USD 10 budget remains; usage-derived costs do not substitute for billing data.
For illustration, 2 vCPU + 8 GB for one hour costs under USD 0.40 at the checked
[AgentCore rates](https://aws.amazon.com/bedrock/agentcore/pricing/), before models,
storage, logs and hosting. Sessions idle out after 60 seconds, max lifetime 1800.

Integration fixes: scope inline tools with @*/inspect_s3_ssl; return both assistant
toolUse and user toolResult messages; use text JSON for tool results (the service
rejected json_ content); keep direct-command governance session separate from
model handoff sessions. Standard installed SDK streaming now works; a diagnostic
private-parser fallback was removed after fixing the unsupported result format.
Native dependency staging avoided expensive emulated pip bytecode work while
the final execution image remains ARM64. Provenance disabled for a single image
manifest. Reserved AWS_REGION is injected by Runtime, not set by the caller.

The service default-created a managed memory child. It was disabled before any
model invocation; the resulting Harness version is 2. Its exact incidental ID
is recorded with cleanup=review, not silently deleted. No memory permissions or
events were used. [Kiro review](https://github.com/mytestlab123/agentcore2/pull/5#issuecomment-5924952642)
found no blocking code defect. F3 deployment and F4/F5 live acceptance still remain.

## F3–F5 final closeout — PASS

| Preview | Stable URL | Deployment |
| --- | --- | --- |
| A | https://main.d2g5d0gm32evnh.amplifyapp.com | job 1 SUCCEED |
| B | https://main.d2rar4n3w1jdwz.amplifyapp.com | job 1 SUCCEED |
| C | https://main.d3j9c8b14om01m.amplifyapp.com | job 1 SUCCEED |

All serve revision 87f468b9eedba18dc039cab269661badccc71d66 via revision.json.
Each starts MOCK and offers Economy 1.0x, Default 1.7x and Enhanced 8.7x relative
input cost. Rates and their owner-provided source/date are in one small config;
output rates differ and the index is not total-request cost.

[Real Chromium proof](focused-gui-proof.json) verified all three model options,
initial MOCK badge, authenticated LIVE LAB connection in all previews, and Nova
Lite's actual registered-tool COMPLIANT result from Preview A. The temporary
loopback bridge was stopped and its ephemeral token removed. The browser used
the local-network permission without disabling web security. Credentials stayed
on Home; no anonymous mutation endpoint was created. [Negative bridge proof](focused-bridge-guard-proof.json):
anonymous mutation 401, unregistered origin 403, unregistered model 400.

One exact tagged canary started NON_COMPLIANT because its SSL-only policy was
missing. REJECT run 3197e2f9-9bae-4588-aaa6-7641a746c797 had no provider execution.
An unauthorized synthetic target was rejected. Separate before/after provider
reads both found no policy. APPROVE_ONCE run ed87bc82-f0ea-4515-b1dd-d9a94625e531
was VERIFIED: PutBucketPolicy FKE53EXSGC00QSP0, provider read FKECXCNGM35S8JEX,
distinct compliance read FKEDW83Z7PAP275N COMPLIANT. The evaluator is not AWS Config.
All Block Public Access settings were true afterward. One execute result carried
the mutation ID; subsequent getRun only read the saved result after SSH loss.
The existing CLI channel drove the exact same ComplianceBackend as the GUI.

Canary cleanup: exact owner/disposable tags and empty-bucket check, then native
DeleteBucket and HeadBucket ABSENT. IDs are exported in the live evidence.
No pre-existing resource was changed. [Resource record](resource-record.csv)
identifies the new retained ECR image, narrow role, Harness/runtime, three previews
and disabled incidental memory child. Cleanup=review, lifecycle date 2026-10-02;
this is a review deadline, not deletion authority. Private native-ID journal and
scratch tooling/artifacts are retained. No live operator bridge remains running.

Budget: 15 model API attempts including diagnostics and the GUI proof. The
available final-turn token metadata implies about USD 0.000846 at the dated
owner-provided prices; missing handoff metadata and infrastructure charges mean
this is **not total spend or a billing reconciliation**. Sessions are bounded,
model calls capped at 18, output capped at 256, no automatic client/S3 retries.
The expected low-volume test footprint remains within the ~USD 10 envelope;
retained resources require lifecycle review and no unattended invocation loop.

Validation: full build PASS, 23 TypeScript plus 7 Python tests PASS, typecheck PASS,
syntax/diff checks PASS, provider ownership and deletion readbacks PASS. Kiro
[F4 review](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5925147800)
found no blocking defect. Its durable-ID/URL feedback is now in committed evidence.
Tagged deliberation in ordinary model text is stripped before journal/display/export;
provider reasoningContent is never collected. Historical snapshots are preserved
by normal commits; no history rewrite or force push.

Reproducible commands: ops/followup.py for deployment/state/cleanup, ops/bundles.py
for revisioned bundles, harness/client.py for model/tool and RPC, harness/live-cli.mjs
for the existing CLI seam, ops/gui-proof.cjs for browser/bridge guards, and
ops/inventory.py plus ops/evidence.py for private-ledger readback/sanitized export.
Use private state on Home; never commit it or credentials. After canary cleanup,
the retained runtime's canary inspection should report NOT_CREATED; do not claim
the deleted bucket remains compliant or recreate it automatically.

Learning harvest: [portable concepts for G](learning-harvest.md). No KB repository
write, UI winner, competing PR or merge. PR #5 remains draft/open/unmerged.

[Kiro final read-only acceptance](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5925315475)
reviewed faebf14 and marked F1–F5 PASS with no blockers. Retained resources require
the scheduled lifecycle review; this acceptance does not authorize automatic
deletion, another canary, or further unattended model calls.
