# Cloud deployment readiness — Issue #14

**Repository preparation only. AWS identity, OIDC exchange, deployment and hosted
acceptance: NOT_RUN.** This document supersedes the old C1 execution-branch and
assumed-subject instructions; it does not apply cloud configuration.

## Baseline and selected path

[PR #13](https://github.com/mytestlab123/agentcore2/pull/13) merged on 2026-10-03
at `098e0254c2d5167a985073f0dc40dccf731c183b`. The final pilot head
`17feaeb58a4a6747efaf856482b88574e5942b4c` passed both jobs in
[run 37018552864](https://github.com/mytestlab123/agentcore2/actions/runs/37018552864).
This task verified clean origin/main and read current open issues/PRs.
Issue #7 / draft PR #8 remains a separate identity-only proposal; no work or
approval from that proposal is imported. No checkout `.agents/skills` exists.

Reuse `ops/showcase-c1.py`, `ops/deploy-showcase-c1.py` and
`.github/workflows/showcase-c1.yml`: manual ZIP deployment of the frozen C1 MOCK
source to only `showcase-c1` on an owner-confirmed existing manual Amplify app.
No new framework, app, backend, domain, or live Preview B behavior is introduced.
The existing app ownership contract remains project=agentcore2, issue=3;
Issue #14 owns this preparation, not a retagging of that app.

Accepted product source: `68aa168f764531697ef34c472f87468ad738e36a`.
HTML SHA256: `1bc76ab8f57090a3132e2371ff49973b5e37c29ea191044556ac2b930c50acbd`.
This is frozen C1 v1.1, not the current v1.2.1 showcase. Neither is modified.
The source commit was absent from this fresh checkout despite main being present;
an explicit fetch of that exact public Git object resolved packaging. Both CI
and the prepared manual workflow now fetch it explicitly, without choosing a new source.

## Reproduce without cloud credentials

```sh
npm ci --no-audit --no-fund --cache /workspace/.npm-cache
npm run verify:cloud -- fast
git fetch origin 68aa168f764531697ef34c472f87468ad738e36a --depth=1
npm run verify:cloud -- deployment
python3 ops/showcase-c1.py --output .c1-build
python3 ops/c1_preflight.py --bundle .c1-build/showcase.zip --expected-revision "$(git rev-parse HEAD)"
```

Use another existing writable cache outside this saved environment. Node 24.19.0,
npm 11.9.0 and Python 3.12.14 were used here. No browser is installed here;
the existing independent CI browser job retains actual browser verification.
The deployment lane uses stdlib tests only, fake provider responses and blocked
network entrypoints. It builds the actual frozen product twice and checks equal
ZIP bytes at the same wrapper revision/runtime. Different wrapper commits
intentionally yield different provenance markers and archives.

Shared preflight rejects missing/malformed config; wrong account, role or run
session; wrong app ID/ARN or ownership; wrong branch/ARN or absent/true autobuild;
active/unknown job states; extra/duplicate/traversal ZIP members; changed HTML;
wrong source/mode/wrapper marker; and prior receipts. The deployment helper
validates and uploads the same in-memory archive bytes. Tests exercise the real
helper with a fake provider, proving rejection before any deployment write and
retention of CREATE_INTENT after an uncertain fake create. A prior receipt blocks
another attempt. CLI output distinguishes offline artifact PASS from live proof.

## Exact owner approval packet — not activated

| Item | Bounded proposal / required evidence |
| --- | --- |
| Repository and execution branch | `mytestlab123/agentcore2`, **`deploy/showcase-c1`**; owner must approve/create or reconcile this ref at the exact reviewed implementation SHA. Historical `issue-3/agentcore-lab` execution is superseded. |
| Revision gate | Review final PR head + CI; after approved merge, set the execution ref to the approved commit containing these checks, then privately configure `C1_APPROVED_REVISION` to that full SHA. Workflow requires `github.sha` equality. Main registration already exists after PR #5; registration is not deployment approval. |
| Product and artifact | Frozen source and digest above; only index.html + revision.json. Wrapper revision must equal checked-out HEAD; build and validate before requesting credentials. |
| Region and target | `ap-southeast-1`, exactly one privately confirmed owned manual app, branch `showcase-c1`, autobuild false. No main/A/B/C deployment. Missing, stale or conflicting ownership evidence blocks activation. |
| Identity | Privately confirm personal-LAB account, a dedicated pathless role, existing OIDC provider, and exact effective subject. Expected role session is `agentcore2-c1-<GitHub run ID>`; account, role and session all checked. No runtime-user keys. |
| Trust | Reuse `providers/c1-trust.json.template`: exact provider in approved account, sts:AssumeRoleWithWebIdentity, StringEquals audience sts.amazonaws.com and **one verified exact subject**. `${APPROVED_EXACT_GITHUB_SUB}` is intentionally unresolved; do not apply the template with placeholders. No wildcard or fallback subjects. |
| Service permissions | Reuse unchanged `providers/c1-policy.json.template`, whose three statements scope GetApp to one app; GetBranch/ListJobs/CreateDeployment/StartDeployment to only its showcase-c1 branch; GetJob to that branch's jobs. No IAM, PassRole, app/branch create/delete, main writes, backend or model permissions. |
| Private configuration | Existing names `C1_AWS_ROLE_ARN`, `C1_AWS_ACCOUNT_ID`, `C1_AMPLIFY_APP_ID` are metadata secrets for masking. No values read, created or changed here. `C1_DEPLOY_ENABLED` stays unset/disabled until separately approved; its actual current value was not inspected. |
| Run authorization | Separate explicit approval for one manual dispatch of showcase-c1.yml at the exact ref/SHA with confirmation DEPLOY_SYNTHETIC_C1. PR CI never requests OIDC or deploys. No dispatch in this task. |
| Cost/lifecycle | Owner confirms incremental hosting budget, retained app ownership, branch lifecycle date and exact teardown operator before activation. No new budget is implied by historical Issue #3 allowance. No automatic deletion. |

The template's old legacy-only subject was an unverified assumption. GitHub
supports immutable owner/repository IDs and customizable subjects; repository
age alone is not effective-token evidence. Verify the actual configured/effective
subject through a separately authorized owner process without publishing tokens.
It must bind this repo and the exact `deploy/showcase-c1` ref; no environment is
attached to the proposed job. Adding one changes the subject and needs new review.
[Official GitHub OIDC guidance](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
and [subject reference](https://docs.github.com/en/actions/reference/security/oidc).

The existing service policy is reused, not generated anew from Python. This
helper invokes the CLI, not boto3; SDK-call analysis would not establish its
permissions. The six named operations and app/branch/job scopes were checked
against the [official Amplify action/resource reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_amplify.html).
Signed upload URLs are transient provider outputs, not additional S3 IAM grants;
never publish them. Official credential-action logs may expose non-secret role
session identifiers; owner review of public-log suitability is required before
any live run. Raw tokens/provider responses remain private.

## Later live acceptance and recovery gate

Only after the private packet and activation are approved: reconcile provider
identity/app/branch and all prior/active jobs; permit one create/upload/start;
retain the sanitized receipt and native job ID; observe SUCCEED; compare served
revision and HTML digest, then use the existing hosted C1 browser smoke. A local
or CI synthetic pass does not substitute for any of those observations.

A runner crash can lose its local receipt before artifact upload. Missing CI
artifacts are not permission to redispatch: inspect provider jobs privately first.
The latest-job check is a guard, not an exhaustive recovery journal. Timeout or
uncertain create/start means stop and reconcile. A rollback is another separately
approved deployment of a reviewed artifact, not an automatic retry. Teardown may
remove only the separately approved isolated branch/new dedicated role after
owner acceptance; never delete the shared app or live main branch.

## Preparation evidence

- Fourteen offline preflight tests PASS, including real frozen-source packaging.
- No AWS API/CLI operation, token request, secret read/write, IAM change, deployment
  dispatch, Home/office execution, live Preview B modification or merge performed.
- Root npm ci PASS (74 packages); fast lane PASS: build 7.58 s, 23 contract +
  12 Python tests 4.16 s, typecheck 6.22 s, state/safety 6.36 s.
- Deployment lane PASS (14 tests, 0.27 s including interpreter overhead).
- Python/Node syntax, YAML permission/activation-gate checks, diff whitespace,
  unchanged canonical HTML/service policy/root lockfile checks PASS.
- Exact-head CI is pending publication; its run/head will be recorded in the PR
  and closing evidence. Preparation acceptance does not close the later live gate.
