# C1 — same MOCK source, three hosting paths

Authority: [G GO](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5949449667).
PR #5 remains draft/open/unmerged. X/core2 implements; Kiro is review-only.

## Current evidence

**Comparison and repository preparation complete; zero new hosted lanes proven.**
External gates are valid C1 outcomes under the approval; they are not green
deployments. No cloud mutation, IAM change, Site publication or existing Preview B
change occurred. Machine-readable evidence: [cloud-portability-c1.json](cloud-portability-c1.json).

Canonical source: `showcases/chatgpt-sites-preview-b/index.html`, accepted commit
`68aa168f764531697ef34c472f87468ad738e36a`. Exact HTML SHA-256:
`1bc76ab8f57090a3132e2371ff49973b5e37c29ea191044556ac2b930c50acbd`.
The C1 accepted reference remains byte-identical. Issue #9 separately syncs v1.2.1
into the current package path; C1 now reads its frozen accepted Git source rather
than treating that newer product as the original C1 experiment. Only wrappers
wrappers change. `ops/showcase-c1.py` checks that digest and the MOCK/no-AWS
wording, scans the HTML and emits only `public/index.html`, `public/revision.json`
and a zip of those two files. The marker separates the accepted product commit
from the deployment-wrapper commit. Never upload the whole repo.

Read-only provider discovery used the existing Home SDK/profile amit, Singapore.
STS matched the owner-private Issue #3 journal before IAM/Amplify reads. Account,
ARNs and unrelated role identities were kept out of output. GitHub OIDC provider
exists; one GitHub-trusted role exists, **zero trust policies name this repository
or its exact branch**. No role was assumed or broadened. Existing owned Preview B
is a manual-deploy app; `main` exists, latest job SUCCEED; `showcase-c1` does not.
GitHub repository is public; repository Actions variable/secret/environment
inventories are empty. This is point-in-time discovery, not future access proof.

| Question | ChatGPT Sites | Cloudflare Pages | AWS Amplify + GitHub OIDC |
| --- | --- | --- | --- |
| Observed state | OWNER_UI_REQUIRED | OWNER_UI_REQUIRED | BLOCKED — exact role/branch absent |
| Public URL / deployed revision | None; not published | None; not created | None for C1; existing B is not C1 proof |
| Source/build | Owner imports canonical file/prompt; compatibility review | GitHub branch → stdlib packaging → two static files | GitHub checkout → same packaging → manual zip deployment |
| Home/laptop needed | Not for hosted use; authenticated owner UI needed | Not for provider build/hosting after OAuth setup | Not for hosted runner/deploy after IAM/setup; current discovery used Home |
| Codex Cloud / GitHub | Can edit/package/test source; Sites operation remains in ChatGPT | Can edit/test/push source; Pages builds from GitHub | Can edit/test; hosted Actions deploy with temporary role session |
| Deploy identity | Owner ChatGPT account/workspace | Confirmed owner Cloudflare account and repo-scoped GitHub App | Exact repo/branch OIDC sub → narrow personal-LAB role |
| Secrets | ChatGPT session stays provider-side; none in source | OAuth/App authorization provider-side; no CI deploy token for Git integration | Temporary STS credentials only; private role/account/app config in GitHub Secrets, no AWS keys |
| OIDC | Not applicable | Not used for Pages Git integration | Proposed, not exercised; missing suitable role |
| Logs | Sites version/deployment UI | Pages build/deployment UI and GitHub integration checks | Actions logs/artifact plus Amplify job; signed upload URL never logged |
| Rollback | Owner returns to reviewed saved version | Owner rolls back to previous successful Pages deployment | New bounded job for previously accepted bundle; reconcile IDs first |
| Teardown | Owner restricts access/deletes the one Site | Disable automatic deployments, delete only the one project | Disable C1 workflow; owner removes only showcase-c1 branch and newly approved dedicated role if unused |

## Owner steps — Sites

No authenticated supported Sites surface is exposed to this controller. No create,
import, preview or publication was attempted. Smallest step: Amit opens @Sites in
his authenticated workspace, attaches the canonical HTML and uses the package's
`site-prompt.md`. First save a version without deployment and inspect it. C1
permits one public synthetic Site only after its preview passes the same checks.
The earlier prompt deliberately requests no automatic publication; publication is
a separate owner action. Do not add connections/storage/backend to fix an import.

Record the generated version, input digest, tested result and one actual URL.
If Sites rewrites HTML, retain the generated source/digest and prove that changes
are wrappers only and all product behavior is preserved. The strict byte-digest
HTTP smoke below must not be weakened to pass a redesign. Imported/generated
Sites compatibility remains unproven. [Official Sites guidance](https://learn.chatgpt.com/docs/sites)
describes prompt/local-project workflows and saved versions; deployment URLs
are production deployments.

## Owner steps — Cloudflare Pages

No Cloudflare account binding or authenticated provider tool is available in this
lane; Wrangler is not installed. Account selection was not attempted. Amit must
confirm the personal owner account, stopping if ambiguous. Then create/reuse at
most one **Pages** project `agentcore2-showcase` and authorize the GitHub App only
for `mytestlab123/agentcore2`. Do not substitute Workers or provision other products.

Exact proposed settings:

- Production branch: `issue-3/agentcore-lab`; disable other branch previews to
  respect the one-public-URL experiment envelope. Use only the stable project URL.
- Root: repository root; framework preset: None.
- Build command: `git fetch origin 68aa168f764531697ef34c472f87468ad738e36a --depth=1 && python3 ops/showcase-c1.py --output .c1-build`.
- Build output: `.c1-build/public`; environment `SKIP_DEPENDENCY_INSTALL=1`.
- No Functions, Workers, custom DNS, secrets or backend bindings.

This deploys only two output files, not the source repo or its docs. Provider
build prerequisites and Git clone metadata must be checked on the first real
build. [Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
documents repo builds/output paths; [GitHub branch controls](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
control production/preview selection; [build image guidance](https://developers.cloudflare.com/pages/configuration/build-image/)
documents skipping automatic dependency installation. None of these settings
were applied to an account in this mission.

## Owner gate — Amplify / IAM

An OIDC provider alone grants no deployment authority. No suitable repo-specific
role exists. Prepared exact templates are in `showcases/chatgpt-sites-preview-b/providers/`:
`c1-trust.json.template` and `c1-policy.json.template`. Substitute OWNER_ACCOUNT
and OWNED_AMPLIFY_APP_ID **privately**, after identity/ownership validation. The
templates are proposals, not applied policies. No real account/ARN is tracked.

Trust is StringEquals on audience sts.amazonaws.com and exact subject
`repo:mytestlab123/agentcore2:ref:refs/heads/issue-3/agentcore-lab`. No environment
is attached to this proposed job; adding one would require an exact trust change.
Permissions: GetApp on the one app; GetBranch/ListJobs/CreateDeployment/
StartDeployment on its **showcase-c1 branch only**; GetJob on that branch's jobs.
No IAM, PassRole, app/branch creation/deletion, main deployment, backend or model
permission. Wildcard job suffix permits job readback only inside that exact branch.
See [AWS action/resource reference](https://docs.aws.amazon.com/service-authorization/latest/reference/list_amplify.html)
and [GitHub OIDC guidance](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).

Required owner decisions/actions before a run:

1. Explicitly approve that exact narrow IAM role/trust/policy; no authority to
   create/broaden IAM is inferred from this milestone. Do not grant amit permissions.
2. Provision only isolated `showcase-c1` on the existing owned manual app with
   autobuild disabled, required lifecycle tags/TTL and owner teardown record.
   This must not alter `main` or any app-level existing behavior.
3. Review/register `.github/workflows/showcase-c1.yml` for manual dispatch.
   GitHub requires workflow_dispatch registration on the default branch; it is
   currently only proposed on draft PR #5. **Do not merge PR #5 to bypass this
   gate.** An owner-approved workflow-only registration/change of trigger is a
   separate decision. [GitHub dispatch prerequisite](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).
4. Privately configure C1_AWS_ROLE_ARN, C1_AWS_ACCOUNT_ID, C1_AMPLIFY_APP_ID;
   these are identity config, not long-lived AWS credentials. Review then set
   C1_DEPLOY_ENABLED=YES. No configuration was written during this mission.
5. One dispatch on the exact issue branch with DEPLOY_SYNTHETIC_C1. No auto push,
   PR trigger, scheduler or automatic retry is configured. Never print raw SDK/
   CLI/provider payloads or signed upload URLs.

`ops/deploy-showcase-c1.py` verifies bundle/identity/app ownership and the isolated
branch, records intent/job IDs before upload/start and observes a bounded result.
Its sanitized journal is retained as an Actions artifact. An interruption before
artifact upload may leave an uncertain intent; inspect provider jobs before any
new dispatch. It never creates IAM/apps/branches, uses a key secret or writes
the existing main branch. The implementation is syntax-checked but **not live
tested**. HTTP/source digest proof is distinct from the subsequent browser proof.

## Validation and provenance

- Canonical byte digest unchanged; stdlib two-file build PASS; deterministic zip.
- Offline Chromium desktop and 390px mobile smoke PASS: all filters, bounded
  actions, manual refusal, consumed decisions, rejection zero-write, separate
  readback/compliance, three unchanged model labels, themes. No unexpected
  browser errors or requests; no model/AWS calls.
- Normal repo build/test/typecheck PASS (23 contract + 12 Harness tests).
- Current package/wrapper scan PASS; templates contain symbolic identifiers
  only. Existing historical repo evidence is preserved; no history rewrite.
- No provider lane HTTP/render result is claimed without an actual deployment.

After any Pages/Amplify deployment, verify HTTP 200 and `revision.json`, compare
served HTML SHA-256 with the digest above, then run the existing smoke against
the actual HTTPS root URL (including trailing slash):

```sh
SHOWCASE_URL="<ACTUAL_VERIFIED_HTTPS_ROOT_URL>" node ops/showcase-c1-smoke.cjs
```

Browser tooling is a validation dependency only. Run it in a hosted CI or owner
environment with Playwright/Chromium available; no permanently running Home is
needed for the static build or deployed page. Logs/URLs must never contain signed
upload URLs/private state. Record each actual URL/revision/result in the evidence
file only after provider readback. Reconcile job IDs before retrying mutations.
For local C1 proof, set C1_STATIC_HTML to the built public/index.html when running
ops/showcase-c1-smoke.cjs. The separate v1.2.1 smoke remains with the current
showcase package. The proposed Actions checkout retains history for the pinned
source; Pages fetches that exact public reference before its stdlib packaging.

## Cost boundary and recommendation

No deployment was made here: C1 incurred **no new hosting/model resource charge**;
existing Issue #3 billing was not reconciled. Do not infer its total bill is zero.

Pages Free allows 500 builds/month with one concurrent build; plan eligibility
and quota are still owner-account checks. No paid add-ons/products are proposed.
[Cloudflare limits](https://developers.cloudflare.com/pages/platform/limits/).
Sites uses owner plan-specific beta limits; no independent hosting price is
claimed. [Sites limits](https://learn.chatgpt.com/docs/sites).
Amplify outside applicable credits/tier lists standard build $0.01/minute,
storage $0.023/GB-month, transfer $0.15/GB; manual zip uses the GitHub build path,
but hosting storage/transfer remain billable. Do not assume this existing account
has free-tier credits. [AWS pricing](https://aws.amazon.com/amplify/pricing/).

Inference from documented operating models, **not measured deployed outcomes**:
Pages Git integration is the simplest candidate for a cheap standalone MOCK
UI; Sites is convenient for owner-driven presentation but import fidelity needs
review. Amplify plus narrow OIDC is the strongest fit for later AWS-account
deployment control without AWS key secrets. Production backend security requires
its own future authority; this public static experiment grants none.

Next: G/Amit reviews the exact external gates. Keep at most one public endpoint
per provider, no custom DNS, no existing Preview B changes, and teardown only
with exact owner acceptance/authority. No automatic TTL cleanup is authorized.
