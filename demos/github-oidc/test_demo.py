"""Offline tests. Every workflow AWS command resolves to a local fake executable."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import textwrap
import unittest

import render_trust

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github/workflows/oidc-identity-demo.yml"
ACCOUNT = "999988887777"  # Synthetic fixture, never a deployment target.
ROLE = "agentcore2-github-oidc-demo"


def workflow_script(step_id):
    """Extract the exact indented run block so tests execute shipped shell code."""
    lines = WORKFLOW.read_text().splitlines()
    start = lines.index(f"        id: {step_id}")
    start = lines.index("        run: |", start) + 1
    end = start
    while end < len(lines) and (not lines[end] or lines[end].startswith("          ")):
        end += 1
    return textwrap.dedent("\n".join(lines[start:end])) + "\n"


def valid_env(directory):
    return {
        "PATH": f"{directory}:/usr/bin:/bin",
        "HOME": str(directory),
        "RUNNER_TEMP": str(directory),
        "GITHUB_REPOSITORY": "mytestlab123/agentcore2",
        "GITHUB_REPOSITORY_OWNER_ID": "58461665",
        "GITHUB_REPOSITORY_ID": "1365387673",
        "GITHUB_REF": "refs/heads/demo/github-aws-oidc",
        "DEMO_AWS_ACCOUNT_ID": ACCOUNT,
        "DEMO_AWS_ROLE_ARN": f"arn:aws:iam::{ACCOUNT}:role/{ROLE}",
        "DEMO_AWS_REGION": "ap-southeast-1",
        "GITHUB_RUN_ID": "98765",
        "GITHUB_RUN_ATTEMPT": "1",
        "GITHUB_SHA": "a" * 40,
        "GITHUB_STEP_SUMMARY": str(directory / "summary"),
        "FAKE_AWS_LOG": str(directory / "aws-invocations"),
    }


class TrustTests(unittest.TestCase):
    def test_each_confirmed_format_has_one_exact_subject_and_audience(self):
        for mode, subject in render_trust.SUBJECTS.items():
            with self.subTest(mode=mode):
                policy = render_trust.render(ACCOUNT, mode, subject)
                self.assertEqual(len(policy["Statement"]), 1)
                statement = policy["Statement"][0]
                self.assertEqual(statement["Action"], "sts:AssumeRoleWithWebIdentity")
                self.assertEqual(statement["Principal"], {"Federated":
                    f"arn:aws:iam::{ACCOUNT}:oidc-provider/token.actions.githubusercontent.com"})
                self.assertEqual(statement["Condition"], {"StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                    "token.actions.githubusercontent.com:sub": subject,
                }})
                self.assertNotIn("*", json.dumps(policy))

    def test_invalid_account_is_rejected(self):
        for account in ["", "ACCOUNT_ID", "000000000000", "1" * 11, "1" * 13, " 999988887777", "９" * 12]:
            with self.subTest(account=account), self.assertRaises(ValueError):
                render_trust.render(account, "legacy", render_trust.SUBJECTS["legacy"])

    def test_unknown_format_is_rejected(self):
        for mode in ["", "auto", "unknown", "custom"]:
            with self.subTest(mode=mode), self.assertRaises(ValueError):
                render_trust.render(ACCOUNT, mode, render_trust.SUBJECTS["legacy"])

    def test_wrong_subject_is_rejected(self):
        subject = render_trust.SUBJECTS["immutable"]
        for changed in ["*", subject + "*", subject + " ",
                        subject.replace("demo/github-aws-oidc", "main"),
                        subject.replace("1365387673", "1"),
                        subject.replace("58461665", "2"),
                        "repo:mytestlab123/agentcore2:pull_request",
                        "repo:mytestlab123/agentcore2:environment:prod",
                        render_trust.SUBJECTS["legacy"]]:
            with self.subTest(subject=changed), self.assertRaises(ValueError):
                render_trust.render(ACCOUNT, "immutable", changed)

    def test_cli_has_no_defaults_and_fails_without_explicit_inputs(self):
        process = subprocess.run([sys.executable, str(Path(render_trust.__file__))], capture_output=True, text=True)
        self.assertNotEqual(process.returncode, 0)
        self.assertEqual(process.stdout, "")

    def test_cli_emits_only_reviewable_json(self):
        process = subprocess.run([
            sys.executable, str(Path(render_trust.__file__)), "--account-id", ACCOUNT,
            "--subject-format", "immutable", "--confirmed-subject", render_trust.SUBJECTS["immutable"],
        ], capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(process.stdout), render_trust.render(ACCOUNT, "immutable", render_trust.SUBJECTS["immutable"]))


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.env = valid_env(self.directory)
        fake = self.directory / "aws"
        fake.write_text(
            '#!/bin/bash\nset -euo pipefail\n'
            '[[ "$*" == "sts get-caller-identity --output json --no-cli-pager" ]] || exit 90\n'
            'printf "identity-only\\n" >> "$FAKE_AWS_LOG"\n'
            'printf "%s" "$FAKE_AWS_RESPONSE"\n'
        )
        fake.chmod(0o700)
        self.identity = {"Account": ACCOUNT,
                         "Arn": f"arn:aws:sts::{ACCOUNT}:assumed-role/{ROLE}/oidc-demo-98765-1",
                         "UserId": "SYNTHETIC:oidc-demo-98765-1"}
        self.env["FAKE_AWS_RESPONSE"] = json.dumps(self.identity)

    def run_script(self, step_id, env=None):
        return subprocess.run(["/bin/bash", "-c", workflow_script(step_id)],
                              env=env or self.env, capture_output=True, text=True, timeout=10)

    def test_valid_preflight_does_not_call_aws(self):
        result = self.run_script("preflight")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.directory / "aws-invocations").exists())

    def test_preflight_rejects_missing_or_unexpected_configuration(self):
        bad = {
            "GITHUB_REPOSITORY": "someone/agentcore2", "GITHUB_REPOSITORY_OWNER_ID": "1",
            "GITHUB_REPOSITORY_ID": "2", "GITHUB_REF": "refs/heads/main",
            "DEMO_AWS_ACCOUNT_ID": "000000000000", "DEMO_AWS_ROLE_ARN": "arn:aws:iam::111122223333:role/Admin",
            "DEMO_AWS_REGION": "us-east-1",
        }
        for key, value in bad.items():
            for candidate in [value, ""]:
                with self.subTest(key=key, value=candidate):
                    env = self.env | {key: candidate}
                    self.assertNotEqual(self.run_script("preflight", env).returncode, 0)
        self.assertFalse((self.directory / "aws-invocations").exists())

    def test_preflight_fails_for_unset_variable(self):
        env = self.env.copy()
        del env["DEMO_AWS_ACCOUNT_ID"]
        self.assertNotEqual(self.run_script("preflight", env).returncode, 0)

    def test_valid_identity_is_sanitized_and_temporary_file_removed(self):
        result = self.run_script("identity")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("IDENTITY_PROOF=PASS", result.stdout)
        summary = (self.directory / "summary").read_text()
        self.assertEqual(summary, result.stdout)
        self.assertNotIn(ACCOUNT, result.stdout)
        self.assertNotIn(self.identity["Arn"], result.stdout)
        self.assertNotIn(self.identity["UserId"], result.stdout)
        self.assertEqual((self.directory / "aws-invocations").read_text(), "identity-only\n")
        self.assertEqual(list(self.directory.glob("oidc-demo-identity.*")), [])

    def test_wrong_account_role_session_or_missing_fields_fail(self):
        variants = [{}, self.identity | {"Account": "111122223333"},
                    self.identity | {"Arn": self.identity["Arn"].replace(ROLE, "another-role")},
                    self.identity | {"Arn": self.identity["Arn"].replace("-98765-1", "-98765-2")}]
        for identity in variants:
            with self.subTest(identity=identity):
                result = self.run_script("identity", self.env | {"FAKE_AWS_RESPONSE": json.dumps(identity)})
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn("IDENTITY_PROOF=PASS", result.stdout + result.stderr)
                self.assertNotIn(ACCOUNT, result.stdout + result.stderr)
                self.assertFalse((self.directory / "summary").exists())
                self.assertEqual(list(self.directory.glob("oidc-demo-identity.*")), [])

    def test_invalid_response_fails_and_cleans_up(self):
        result = self.run_script("identity", self.env | {"FAKE_AWS_RESPONSE": "not-json"})
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.directory / "summary").exists())
        self.assertEqual(list(self.directory.glob("oidc-demo-identity.*")), [])

    def test_shipped_shell_syntax(self):
        for step_id in ["preflight", "identity"]:
            result = subprocess.run(["/bin/bash", "-n"], input=workflow_script(step_id), capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_workflow_security_contract(self):
        text = WORKFLOW.read_text()
        self.assertIn("on:\n  workflow_dispatch:", text)
        for trigger in ["pull_request:", "pull_request_target:", "push:", "schedule:", "workflow_call:"]:
            self.assertNotIn(trigger, text)
        self.assertIn("permissions: {}", text)
        self.assertEqual(text.count("id-token: write"), 1)
        self.assertNotIn("contents: write", text)
        self.assertEqual(text.count("secrets.DEMO_AWS_ACCOUNT_ID"), 2)
        self.assertEqual(text.count("secrets.DEMO_AWS_ROLE_ARN"), 2)
        self.assertNotIn("aws-access-key-id:", text)
        self.assertNotIn("aws-secret-access-key:", text)
        self.assertNotIn("actions/checkout", text)
        self.assertEqual(text.count("uses:"), 1)
        self.assertIn("uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0", text)
        self.assertIn("github.ref == 'refs/heads/demo/github-aws-oidc'", text)
        self.assertIn("role-duration-seconds: 900", text)
        self.assertIn('"Effect":"Deny","Action":"*","Resource":"*"', text)
        self.assertIn("translate-env-variables: false", text)
        for step_id in ["preflight", "identity"]:
            self.assertNotIn("${{", workflow_script(step_id))


if __name__ == "__main__":
    unittest.main()
