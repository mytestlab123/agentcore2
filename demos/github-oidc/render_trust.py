#!/usr/bin/env python3
"""Render one reviewed trust policy offline. Never call AWS or edit IAM."""
import argparse
import json
import re

REPOSITORY = "mytestlab123/agentcore2"
OWNER_ID = "58461665"
REPOSITORY_ID = "1365387673"
BRANCH = "demo/github-aws-oidc"
ISSUER = "token.actions.githubusercontent.com"
SUBJECTS = {
    "legacy": f"repo:{REPOSITORY}:ref:refs/heads/{BRANCH}",
    "immutable": (
        f"repo:mytestlab123@{OWNER_ID}/agentcore2@{REPOSITORY_ID}:"
        f"ref:refs/heads/{BRANCH}"
    ),
}


def render(account_id: str, subject_format: str, confirmed_subject: str) -> dict:
    """Require an explicit format AND exact confirmed subject; accept no wildcard."""
    if not re.fullmatch(r"[0-9]{12}", account_id) or account_id == "000000000000":
        raise ValueError("Supply the locally reviewed 12-digit AWS account ID")
    if subject_format not in SUBJECTS:
        raise ValueError("Unknown subject format: stop and verify GitHub OIDC settings")
    if confirmed_subject != SUBJECTS[subject_format]:
        raise ValueError("Subject must exactly match the verified repository and demo branch")
    return {
        "Version": "2012-10-17",
        "Statement": [{
            "Sid": "ExactRepositoryAndDemoBranchOnly",
            "Effect": "Allow",
            "Principal": {
                "Federated": f"arn:aws:iam::{account_id}:oidc-provider/{ISSUER}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {"StringEquals": {
                f"{ISSUER}:aud": "sts.amazonaws.com",
                f"{ISSUER}:sub": confirmed_subject,
            }},
        }],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--account-id", required=True)
    parser.add_argument("--subject-format", required=True, choices=SUBJECTS)
    parser.add_argument("--confirmed-subject", required=True)
    args = parser.parse_args()
    try:
        policy = render(args.account_id, args.subject_format, args.confirmed_subject)
    except ValueError as exc:
        parser.error(str(exc))
    print(json.dumps(policy, indent=2))


if __name__ == "__main__":
    main()
