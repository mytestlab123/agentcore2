# Wire Preview to Real Agent + Bounded Live Invocation — Task 8/15 (`wire-and-verify-live-agent`)

Status: **PARTIAL — wiring seam delivered (MOCK preserved); bounded LIVE invocation BLOCKED (no Issue #3-owned runtime exists)**
Date: 2026-10-01
Issue: https://github.com/mytestlab123/agentcore2/issues/3
PR #5: https://github.com/mytestlab123/agentcore2/pull/5 (draft; do not merge)

This task wires one preview to the real AgentCore backend **through the shared
`ComplianceBackend` seam while preserving MOCK mode**, then performs one bounded
model invocation and one registered-tool invocation against the NEW Issue
#3-owned runtime from task 7. Chain-of-thought is never exposed. LIVE_LAB status
must use real runtime/model/session/tool evidence and never show synthetic
success as live.

## Guard checks (PASS)

- `TASK_WORKDIR` (`pwd -P`): `/home/dev/git/.kirocrew-work/plan_1790794585945378650`
  — a Kiro Crew task worktree, NOT `/home/dev/git/agentcore2`. Did not `cd` to source.
- Current branch: `kirocrew/task/plan_1790794585945378650`.
- Origin: `https://github.com/mytestlab123/agentcore2.git`.
- No additional infrastructure created in this task (as required).

## Identity & region re-verification (PASS)

- `aws --version` → `aws-cli/2.37.4` (CLI executes inside the Crew agent sandbox).
- `aws sts get-caller-identity --profile amit` → `arn:aws:iam::<ACCOUNT_ID>:user/amit`
  (owner-approved personal-LAB identity; account value already present in prior evidence).
- Region: `ap-southeast-1`.

## What WAS delivered — the durable wiring seam (code + tests, MOCK preserved)

The single seam every preview depends on is `ComplianceBackend`. This task adds
the LIVE wiring point with a structural truthful-mode invariant, and points
Preview A at it while keeping MOCK as the default.

- New adapter: `packages/contracts/src/live-backend.ts`
  - `LiveAgentCoreBackend implements ComplianceBackend` — the place a real
    AgentCore runtime is spoken to over the existing seam (no preview code
    changes to swap it in).
  - `LiveRuntimeEvidence` = { `runtimeArn`, `modelId`, `sessionId`, `toolId`,
    `region` }. **A result may carry `mode: "LIVE_LAB"` ONLY when ALL of these
    provider-native ids are present and non-blank.** Partial/blank evidence is
    discarded (no "half-wired" state); an unwired adapter reports `mode: "MOCK"`
    and every backend op fails closed with `RuntimeNotWiredError`. This makes
    "synthetic success shown as live" structurally impossible — there is no code
    path that emits LIVE_LAB without real evidence.
  - `wireLiveOrFallbackToMock(evidence?)` — the one-line selector previews use.
    Returns a LIVE adapter only with complete verified evidence; otherwise the
    MOCK backend with a truthful MOCK badge.
- Preview A wired: `apps/preview-a/src/App.tsx` now selects its backend via
  `wireLiveOrFallbackToMock({...import.meta.env.VITE_AGENTCORE_*})`. With no
  runtime deployed, those env vars are unset → resolves to MOCK. The mode badge
  therefore renders **MOCK** truthfully and will flip to **LIVE LAB** only when
  a real runtime injects all four evidence ids.
- Tests: `packages/contracts/src/live-backend.test.ts` (7 new tests) prove:
  unwired → MOCK never LIVE_LAB; every op fails closed; partial and blank-string
  evidence are rejected; LIVE_LAB only with complete evidence; the selector
  defaults to MOCK. Full suite: **13/13 pass** (7 new + 6 original governance).
- Repo validation (from TASK_WORKDIR): `npm run build` (contracts + Preview
  A/B/C static bundles), `npm run typecheck` (all workspaces, 0 errors),
  `npm test` (13/13) all PASS.

## Why the bounded LIVE invocation is BLOCKED (not fabricated)

The task's live model + registered-tool invocation requires "the NEW Issue
#3-owned AgentCore runtime from the previous task." Task 7
(`deploy-agentcore-s3-specialist`) is BLOCKED and created **no runtime**: there
is no deployable Issue #3-owned harness container (no Dockerfile / ECR image),
so `create-agent-runtime` never ran. Re-verified this task:

- `aws bedrock-agentcore-control list-agent-runtimes --profile amit --region ap-southeast-1`
  → the same 5 pre-existing, non-Issue-#3 runtimes (`harness_demo1`,
  `harness_compliance_agent_v1`, `harness_AwsSecOpsP0B2NovaLite20260909`,
  `harness_AgentCoreIssue19LibreChatR1`, `awsplatformhostedmcpproxy`). All are
  OFF-LIMITS (read-only, never invoke/modify per the pre-existing-resource rule).

There is therefore no Issue #3-owned runtime ARN, model binding, session, or
registered tool to invoke. Per the task's explicit rule — LIVE status must use
real runtime/model/session/tool evidence and must never display synthetic
success as live — a live invocation is recorded as BLOCKED rather than:
- fabricating a runtime ARN / model id / session id / tool id,
- invoking an off-limits pre-existing runtime, or
- labelling a MOCK result as LIVE_LAB.

The `LiveAgentCoreBackend` invariant enforces exactly this at the code level:
with no evidence, `isWired === false`, `mode === "MOCK"`, and every invocation
throws `RuntimeNotWiredError`.

## Bounded invocation — persisted evidence (none live)

- runtime ARN: none (no Issue #3 runtime exists)
- model invocation id: none (not performed — would be synthetic)
- registered-tool invocation id: none (not performed — would be synthetic)
- live session id: none
- chain-of-thought: never exposed (not applicable; no invocation)
- LIVE_LAB shown anywhere: NO — Preview A resolves to MOCK; badge is truthful.

No AWS write performed this task. No new infrastructure. Spend: $0.

## Next action (for the deploy owner, not this task)

1. Unblock task 7: author + push an Issue #3-owned harness container to a new
   ECR repo, then `create-agent-runtime` → capture runtimeArn/model/session/tool.
2. Inject those four ids as Preview A's `VITE_AGENTCORE_*` build env; the seam
   then returns `LiveAgentCoreBackend` and the badge flips MOCK → LIVE LAB.
3. Re-run this task to perform one bounded model invocation and one
   registered-tool invocation, and persist the real provider ids here.
