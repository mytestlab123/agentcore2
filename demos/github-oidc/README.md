# GitHub → AWS OIDC: identity-only demo

[Issue #7](https://github.com/mytestlab123/agentcore2/issues/7) ·
[Scope](SPEC.md) · [Workflow](../../.github/workflows/oidc-identity-demo.yml)

**PREPARED, NOT RUN.** This branch contains no AWS account ID or credentials.
Its only intended runtime outcome is a sanitized `IDENTITY_PROOF=PASS` from
`sts:GetCallerIdentity`. It is independent of Issue #3 / PR #5 and Issue #6.

## Hand this to local Codex

> Review Issue #7 and this branch's `demos/github-oidc/SPEC.md` and README.
> Run the offline tests, verify the PR head, then prepare the exact account,
> role and OIDC trust for my review using my existing local AWS access.
> Do not copy credentials anywhere. Stop before creating/changing IAM trust,
> setting GitHub configuration, merging or running the workflow: those need my
> explicit approval. Do not touch PR #5, Issue #6, or their workspaces.

Local prerequisites: Python 3.10+ for offline work; existing AWS CLI v2 access
and authenticated GitHub CLI only for later, approved setup. Do not create a
PAT, access key, new login, or saved credential to run this demo.

## 1. Offline review (safe now)

Use a separate checkout of `demo/github-aws-oidc`, not the PR #5 workspace:

```sh
python3 -m unittest discover -s demos/github-oidc -p 'test_*.py' -v
```

The 14 tests need only the Python standard library and Bash. They test both
subject formats, fail-closed inputs, exact shipped shell blocks, sanitized
identity checks and cleanup using a fake `aws` executable. No AWS API is called.
Optional workflow lint: `actionlint .github/workflows/oidc-identity-demo.yml`.
There is intentionally no automatic PR/push workflow and no credentialed test.

## 2. Verify the actual GitHub subject; never guess

Known repository metadata, verified through GitHub on 2026-10-01:
`mytestlab123/agentcore2`, owner ID `58461665`, repository ID `1365387673`.
Recheck these if the repository is renamed/transferred. This demo trusts only
`refs/heads/demo/github-aws-oidc`, with no environment or PR subject.

Read current settings without changing them:

```sh
gh api repos/mytestlab123/agentcore2 --jq '{full_name,id,owner_id:.owner.id,default_branch}'
gh api -H 'Accept: application/vnd.github+json' \
  -H 'X-GitHub-Api-Version: 2026-03-10' \
  repos/mytestlab123/agentcore2/actions/oidc/customization/sub
```

Review the full OIDC response and repository Actions OIDC settings. Preserve
`use_default`, `include_claim_keys`, `use_immutable_subject`, and
`sub_claim_prefix` if returned. The REST example does not fully describe
immutable-mode response semantics: an absent/false opt-in flag or a preview
prefix alone is **not** proof of the current token subject. Stop if the
effective mode/template cannot be confirmed; do not PUT settings to force it.
If existing customization is present, stop for a reviewed adaptation.

GitHub's current default subjects include immutable IDs for newer repositories
and some renames/transfers. These are **candidates**, not an assertion about
this repository's current issued token:

- Legacy: `repo:mytestlab123/agentcore2:ref:refs/heads/demo/github-aws-oidc`
- Immutable: `repo:mytestlab123@58461665/agentcore2@1365387673:ref:refs/heads/demo/github-aws-oidc`

Choose exactly one verified format. Do not infer it from a creation date,
allow both, use a wildcard, or print an OIDC JWT to debug it.

## 3. Prepare local account/provider/role review

All following AWS commands are **for the local operator only**. They were not
run when preparing this PR. Use the existing approved personal-LAB profile;
never select a target merely because some credentials happen to be active.
Enter the expected account independently, then compare caller identity locally:

```sh
read -r -p 'Existing local LAB AWS profile: ' AWS_PROFILE
read -r -p 'Amit-approved 12-digit LAB account ID: ' EXPECTED_ACCOUNT_ID
[[ "$EXPECTED_ACCOUNT_ID" =~ ^[0-9]{12}$ && "$EXPECTED_ACCOUNT_ID" != 000000000000 ]] || exit 1
OBSERVED_ACCOUNT_ID="$(aws --profile "$AWS_PROFILE" sts get-caller-identity --query Account --output text)" || exit 1
[[ "$OBSERVED_ACCOUNT_ID" == "$EXPECTED_ACCOUNT_ID" ]] || exit 1
ROLE_NAME=agentcore2-github-oidc-demo
ROLE_ARN="arn:aws:iam::${EXPECTED_ACCOUNT_ID}:role/${ROLE_NAME}"
PROVIDER_ARN="arn:aws:iam::${EXPECTED_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
```

Keep account identifiers and full output private. Read existing resources:

```sh
aws --profile "$AWS_PROFILE" iam get-open-id-connect-provider --open-id-connect-provider-arn "$PROVIDER_ARN"
aws --profile "$AWS_PROFILE" iam get-role --role-name "$ROLE_NAME"
```

Only an explicit `NoSuchEntity` confirms absence. AccessDenied, timeout or
another failure means **stop**, not permission to create or overwrite.
If the provider exists, verify its issuer is `token.actions.githubusercontent.com`
and its client ID list already contains `sts.amazonaws.com`. Preserve all
existing clients, thumbprints and consumers. If incompatible, stop for review.
An existing role name is a collision: stop and inspect ownership/trust/attached
and inline policies. This guide never overwrites or reuses existing role trust.

Generate a local policy only after subject verification:

```sh
read -r -p 'Verified subject format (legacy or immutable): ' SUBJECT_FORMAT
read -r -p 'Exact verified subject: ' CONFIRMED_SUBJECT
umask 077
mkdir -p demos/github-oidc/private
python3 demos/github-oidc/render_trust.py \
  --account-id "$EXPECTED_ACCOUNT_ID" \
  --subject-format "$SUBJECT_FORMAT" \
  --confirmed-subject "$CONFIRMED_SUBJECT" \
  > demos/github-oidc/private/trust.local.json
```

Check the generator's exit status before proceeding. It accepts no implicit
account/format and no other repository, branch, environment or wildcard.
Generated local review files are ignored by Git. Do not commit or upload them.

## 4. Approval gate: create persistent AWS trust

Show Amit the exact target account, provider, role, one-subject trust document
and no-permissions role plan privately. Explain that this creates persistent
GitHub-to-AWS access for this exact repository and branch. Obtain action-time
approval before executing either creation command below. Creating this PR or
reviewing the commands is not that approval.

If and only if the provider was confirmed absent and its creation is approved:

```sh
aws --profile "$AWS_PROFILE" iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com
```

Use current AWS CLI behavior to obtain/validate provider certificate trust;
never paste a stale thumbprint or bypass TLS verification. If the provider
already exists and is compatible, skip creation and do not modify it.

If and only if the dedicated role was confirmed absent and creation is approved:

```sh
aws --profile "$AWS_PROFILE" iam create-role \
  --role-name "$ROLE_NAME" \
  --assume-role-policy-document file://demos/github-oidc/private/trust.local.json \
  --description 'Issue 7: GitHub OIDC identity-only demo; no service permissions' \
  --max-session-duration 3600
aws --profile "$AWS_PROFILE" iam get-role --role-name "$ROLE_NAME"
aws --profile "$AWS_PROFILE" iam list-attached-role-policies --role-name "$ROLE_NAME"
aws --profile "$AWS_PROFILE" iam list-role-policies --role-name "$ROLE_NAME"
```

Both role policy lists must be empty and trust must exactly match the reviewed
JSON. Do not attach AdministratorAccess, ReadOnlyAccess, or even an STS allow
policy: AWS documents that GetCallerIdentity needs no permissions. The workflow
adds a deny-all **session** policy as defense in depth; its wildcards deny
service access and do not broaden the exact-match **trust** policy.
The IAM role maximum is 1 hour; the requested session is only 15 minutes.

## 5. Separate activation and run approval

After approval to configure this demo, set these repository Actions settings:

- Secret `DEMO_AWS_ACCOUNT_ID`: the locally verified account ID
- Secret `DEMO_AWS_ROLE_ARN`: the reviewed dedicated role ARN above
- Variable `DEMO_AWS_REGION`: `ap-southeast-1`

The two secret values are non-credential account/role metadata. Store them as
secrets so GitHub masks them before displaying the first step's environment;
a later add-mask command alone would be too late. Never put access keys,
session tokens, local profiles, or OIDC JWTs in GitHub secrets or variables.
The workflow receives only newly exchanged, short-lived OIDC credentials.
The pinned official action still logs a non-secret AWS unique role ID and its
run-specific session name (`AssumedRoleId`). These may be visible in this public
repository's Actions logs even though the account ID and role ARN are masked.
Explain this metadata exposure when requesting run approval; if unacceptable,
stop rather than claiming that every identity detail is hidden. Never enable
step/runner debug logging or publish full AWS responses.

**A new workflow in a draft PR is not yet manually runnable.** GitHub requires
its workflow file on the default branch before workflow_dispatch is available.
Ask Amit to review and explicitly approve merge/activation; never auto-merge
or use a push trigger to bypass that requirement. Preserve the dedicated demo
branch after merge (disable branch deletion for this one merge if necessary).
Review its exact current SHA before running; the default-branch copy alone
cannot pass the workflow's dedicated-branch guard. If the branch is missing,
stop and ask before recreating it at the reviewed revision.

Branch-only IAM trust authorizes a subject for that whole branch, not a single
workflow file. Anyone allowed to alter/dispatch code on that branch is within
that boundary. Keep branch write access limited to trusted maintainers;
review the current revision before each run. Do not add an environment without
reviewing its different subject format and protection rules.

Only after explicit approval for the identity-only run:

```sh
gh workflow run oidc-identity-demo.yml --repo mytestlab123/agentcore2 \
  --ref demo/github-aws-oidc -f confirm_identity_only=true
```

Inspect that run once accepted; do not blindly dispatch again after an
uncertain response. A successful run must match account, dedicated role and
run-specific session, then show `IDENTITY_PROOF=PASS` and the expected revision.
Record only the run URL, revision and sanitized status on Issue #7. The
explicit identity step/summary is sanitized; the standard action logs retain
the non-secret role-ID/session metadata described above. A failure
is not authority to widen trust or add permissions. No deployment, resource
inventory, model call or resource mutation belongs in this proof.

No automatic cleanup is included. After the result, agree on retention and
approve any deletion separately; never delete a shared provider to clean up
this demo. Offline tests do not prove live AWS authentication.

## Verified primary sources (2026-10-01)

- [GitHub OIDC subject formats](https://docs.github.com/en/actions/reference/security/oidc#immutable-subject-claims)
- [Immutable subject rollout and prefix preview](https://github.blog/changelog/2026-04-23-immutable-subject-claims-for-github-actions-oidc-tokens/)
- [Repository OIDC settings REST API](https://docs.github.com/en/rest/actions/oidc#get-the-customization-template-for-an-oidc-subject-claim-for-a-repository)
- [Manual workflow dispatch and default branch requirement](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
- [AWS GetCallerIdentity needs no permissions](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html)
- [AWS OIDC provider setup](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [Official configure-aws-credentials v6.3.0 release](https://github.com/aws-actions/configure-aws-credentials/releases/tag/v6.3.0)
- [Pinned action source and inputs](https://github.com/aws-actions/configure-aws-credentials/tree/e1253824e5c10ff9df46874f81ed3ec929e19cfd)
