# OIDC identity-only demo specification

Owner: [Issue #7](https://github.com/mytestlab123/agentcore2/issues/7)

## Outcome

Prepare a separate draft PR, then let Amit's local Codex review an exact IAM
trust policy. Only a later explicitly authorized manual run may prove GitHub
Actions → AWS OIDC → STS GetCallerIdentity.

## Boundaries

- Dedicated branch: `demo/github-aws-oidc`, based on merged main `274308d`.
- No changes to Issue #3 / PR #5, Issue #6, their branches or worker sessions.
- No AWS calls, IAM changes, workflow dispatch, merge, credentials, or deployment
  during PR preparation. No automatic setup or trust-policy replacement script.
- Runtime: GitHub-hosted runner, manual event, exact repository IDs and branch,
  no checkout, no repository write permissions, no static keys, 15-minute session.
- Dedicated role with no attached/inline role permissions; session policy denies
  all actions. AWS documents that GetCallerIdentity requires no permissions.
- IAM trust requires `StringEquals` for the AWS audience and exactly one
  locally confirmed subject. Unknown/custom format stops; no wildcard fallback.
- Posted evidence/summary contains only revision, run URL, and sanitized status.
  Account ID/role ARN are pre-masked via metadata secrets; official action logs
  can show a non-secret unique role ID/session, disclosed before run approval.

## Proof and stop gates

Offline: `python3 -m unittest discover -s demos/github-oidc -p 'test_*.py' -v`.
Tests use synthetic identities and a fake AWS executable; they never authenticate.
Online proof remains NOT RUN until local IAM setup, activation and dispatch are
separately approved. Stop on ambiguous identity/subject, resource collision,
provider mismatch, authorization failure, or a request to broaden permissions.
