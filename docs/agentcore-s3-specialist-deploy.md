# AgentCore Harness S3 Specialist Deploy — Task 7/15 (`deploy-agentcore-s3-specialist`)

Status: **BLOCKED — no deployable Issue #3-owned harness artifact exists**
Date: 2026-10-01
Issue: https://github.com/mytestlab123/agentcore2/issues/3
PR #5: https://github.com/mytestlab123/agentcore2/pull/5 (draft; do not merge)

This task is a BOUNDED AWS WRITE under the single overnight approval: deploy
exactly ONE new, clearly Issue #3-owned AgentCore Harness S3 specialist runtime
with only the new least-privilege execution role(s) it requires.

## Guard checks (PASS)

- `TASK_WORKDIR` (`pwd -P`): `/home/dev/git/.kirocrew-work/plan_1790794585945378650`
  — a Kiro Crew task worktree, NOT `/home/dev/git/agentcore2`. Did not `cd` to source.
- Current branch: `kirocrew/task/plan_1790794585945378650`.
- Origin: `https://github.com/mytestlab123/agentcore2.git`.

## Identity & region re-verification (PASS)

- `aws --version` → `aws-cli/2.37.4` (CLI executes inside the Crew agent sandbox).
- `aws sts get-caller-identity --profile amit` →
  `arn:aws:iam::333438771545:user/amit` (matches the owner-approved personal-LAB
  identity in `CONTEXT.md`; account ID not published beyond the value already
  present in host runtime config / prior evidence).
- Region: `ap-southeast-1` (`aws configure get region --profile amit`).

## Read-only inventory — ALL pre-existing runtimes are OFF-LIMITS

`aws bedrock-agentcore-control list-agent-runtimes --profile amit --region ap-southeast-1`
returned 5 pre-existing runtimes (none Issue #3-owned; read-only, never modify):

| agentRuntimeName                        | id (suffix)      | ver | status |
|-----------------------------------------|------------------|-----|--------|
| harness_demo1                           | 0zIMb8Htpg       | 1   | READY  |
| harness_compliance_agent_v1             | VIqR7D5RAw       | 4   | READY  |
| harness_AwsSecOpsP0B2NovaLite20260909   | tgd0cdHs9H       | 7   | READY  |
| harness_AgentCoreIssue19LibreChatR1     | ePoprZ6eml       | 3   | READY  |
| awsplatformhostedmcpproxy               | GY5BzVCfNQ       | 6   | READY  |

Pre-existing ECR repositories (read-only): `aws-platform-hosted-mcp-proxy`,
`seccop-ecr-operator-mvp`,
`cdk-hnb659fds-container-assets-333438771545-ap-southeast-1`. None is an
Issue #3-owned harness image.

## Why this write is BLOCKED (not fabricated)

A Bedrock AgentCore runtime (`create-agent-runtime`) requires a
`containerUri` — a runnable container image in ECR — plus an execution IAM role.
There is **no deployable Issue #3-owned harness artifact** to point a new runtime
at:

- The worktree is a monorepo of the three Preview UIs (`apps/preview-a|b|c`) and
  the shared `@agentcore2/contracts` package. These build to **static browser
  bundles**, not a server/agent container.
- There is no agent container source, Dockerfile, or harness build target in the
  tracked tree.
- None of the three pre-existing ECR repos is Issue #3-owned; reusing any of them
  would violate the OFF-LIMITS rule for pre-existing resources.

Deploying "one new AgentCore Harness S3 specialist" therefore cannot proceed
without first authoring and publishing an Issue #3-owned harness image (agent
code → container → ECR). That authoring/build step is outside this task's
"deploy exactly one runtime" scope and was not produced by any prior task.

Per the task's explicit stop conditions, execution stops rather than:
- fabricating a runtime or its identifiers,
- reusing an off-limits pre-existing image/role, or
- expanding IAM speculatively.

No AWS write was performed. No new IAM role created. Spend for this task: $0.

## Persisted identifiers (none created)

- runtime id / arn: none (not created)
- revision / version: none
- model / session / tool ids: none
- execution role: none

There is nothing to persist-before-retry because no partial resource was created.

## Next action (for the roadmap owner, not this task)

1. Author an Issue #3-owned AgentCore Harness S3 specialist agent (server
   entrypoint implementing the `ComplianceBackend` seam over S3), build it into a
   container, and push to a NEW Issue #3-owned ECR repo.
2. Create the NEW least-privilege execution role scoped to that runtime's S3
   specialist actions, with clear Issue #3 ownership tags.
3. Re-run this task to `create-agent-runtime` against that image + role, then
   persist runtime/version/model/session/tool ids and hand to task 8
   (`wire-and-verify-live-agent`).
