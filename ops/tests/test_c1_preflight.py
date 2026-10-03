"""Offline contract tests; provider/network calls are replaced, never executed."""
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import warnings
import zipfile

OPS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(OPS))
import c1_preflight as checks

spec = importlib.util.spec_from_file_location('deployment', OPS / 'deploy-showcase-c1.py')
deployment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deployment)


class Preflight(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        # Synthetic identifiers assembled here are not owner configuration.
        self.env = {'C1_EXPECTED_ACCOUNT': '0' * 12, 'C1_APP_ID': 'dtest',
                    'C1_BRANCH': 'showcase-c1', 'GITHUB_RUN_ID': '123',
                    'C1_AWS_ROLE_ARN': 'arn:aws:iam::' + '0' * 12 + ':role/test-only'}
        self.revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'],
                                               cwd=OPS, text=True).strip()
        self.config = checks.configuration(self.env, self.revision)
        self.data = b'MOCK fixture only'
        self.digest = hashlib.sha256(self.data).hexdigest()
        self.marker = {'mode': 'MOCK SHOWCASE', 'sourceReference': 'a' * 40,
                       'htmlSha256': self.digest, 'wrapperRevision': self.revision}
        self.app = {'appId': 'dtest', 'appArn': self.config['appArn'], 'repository': '',
                    'tags': {'project': 'agentcore2', 'issue': '3'}}
        self.branch = {'branchName': checks.BRANCH, 'enableAutoBuild': False,
                       'branchArn': self.config['appArn'] + '/branches/' + checks.BRANCH}
        self.identity = {'Account': self.config['account'], 'Arn': self.config['identityArn']}
        self.bundle = self.root / 'showcase.zip'
        self.journal = self.root / 'receipt.json'
        self.bundle.write_bytes(self.archive())
        for target in ['socket.create_connection', 'urllib.request.urlopen']:
            guard = patch(target, side_effect=AssertionError('Network forbidden in offline tests'))
            guard.start()
            self.addCleanup(guard.stop)

    def archive(self, marker=None, data=None, extra=None):
        out = io.BytesIO()
        with zipfile.ZipFile(out, 'w') as z:
            z.writestr('index.html', self.data if data is None else data)
            z.writestr('revision.json', json.dumps(self.marker if marker is None else marker))
            if extra:
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore', UserWarning)
                    z.writestr(extra, b'no')
        return out.getvalue()

    def validate_artifact(self, data):
        return checks.artifact(data, self.digest, 'a' * 40, self.revision)

    def test_valid_offline_contract(self):
        self.assertEqual(self.validate_artifact(self.archive()), self.marker)
        checks.identity(self.config, self.identity)
        checks.target(self.config, self.app, self.branch, [{'status': 'SUCCEED'}])

    def test_configuration_fails_closed(self):
        for key in self.env:
            for value in ['', '*', 'unexpected']:
                with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                    checks.configuration({**self.env, key: value}, self.revision)
        with self.assertRaises(ValueError):
            checks.configuration(self.env, 'main')

    def test_wrong_role_account_session_identity(self):
        for field in ['Account', 'Arn']:
            with self.subTest(field=field), self.assertRaises(ValueError):
                checks.identity(self.config, {**self.identity, field: 'wrong'})
        for suffix in ['/different-session', '']:
            with self.assertRaises(ValueError):
                checks.identity(self.config, {**self.identity, 'Arn': self.identity['Arn'].rsplit('/', 1)[0] + suffix})

    def test_artifact_digest_marker_and_revision(self):
        with self.assertRaises(ValueError):
            self.validate_artifact(self.archive(data=b'tampered'))
        for key in self.marker:
            with self.subTest(key=key), self.assertRaises(ValueError):
                self.validate_artifact(self.archive(marker={**self.marker, key: 'wrong'}))
        with self.assertRaises(ValueError):
            self.validate_artifact(self.archive(marker={**self.marker, 'extra': True}))

    def test_archive_extra_duplicate_and_traversal(self):
        for name in ['extra.txt', 'index.html', '../index.html']:
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.validate_artifact(self.archive(extra=name))
        with self.assertRaises(zipfile.BadZipFile):
            self.validate_artifact(b'not a zip')

    def test_wrong_target_and_missing_branch_guard(self):
        for object_name, keys in [('app', ['appId', 'appArn', 'repository', 'tags']),
                                  ('branch', ['branchName', 'branchArn', 'enableAutoBuild'])]:
            for key in keys:
                app, branch = copy.deepcopy(self.app), copy.deepcopy(self.branch)
                obj = app if object_name == 'app' else branch
                obj.pop(key)
                with self.subTest(object=object_name, key=key), self.assertRaises(ValueError):
                    checks.target(self.config, app, branch, [])
        for override in [{'branchName': 'main'}, {'enableAutoBuild': True}, {'enableAutoBuild': 'false'}]:
            with self.assertRaises(ValueError):
                checks.target(self.config, self.app, {**self.branch, **override}, [])

    def test_prior_jobs_fail_closed(self):
        for state in ['CREATED', 'PENDING', 'PROVISIONING', 'RUNNING', 'CANCELLING', 'NEW_STATE', None]:
            with self.subTest(state=state), self.assertRaises(ValueError):
                checks.target(self.config, self.app, self.branch, [{'status': state}])

    def execute_with_fake_provider(self, failure):
        calls = []
        def fake(service, action, **kwargs):
            calls.append(action)
            if action == 'get-caller-identity':
                return {**self.identity, **({'Arn': 'wrong'} if failure == 'identity' else {})}
            if action == 'get-app':
                return {'app': self.app}
            if action == 'get-branch':
                return {'branch': {**self.branch, **({'branchName': 'main'} if failure == 'target' else {})}}
            if action == 'list-jobs':
                return {'jobSummaries': [{'status': 'RUNNING'}] if failure == 'active' else []}
            if action == 'create-deployment':
                self.assertEqual(json.loads(self.journal.read_text())['phase'], 'CREATE_INTENT')
                raise RuntimeError('Synthetic uncertain create; never use a provider')
            raise AssertionError('Unexpected operation')
        with patch.dict('os.environ', self.env, clear=True), patch.object(deployment, 'aws', fake), \
             patch.object(deployment.source, 'DIGEST', self.digest), \
             patch.object(deployment.source, 'REFERENCE', 'a' * 40):
            with self.assertRaises((ValueError, RuntimeError)):
                deployment.deploy(self.bundle, self.journal)
        return calls

    def test_deployer_rejects_before_any_provider_for_bad_artifact(self):
        self.bundle.write_bytes(self.archive(data=b'wrong'))
        self.assertEqual(self.execute_with_fake_provider('artifact'), [])
        self.assertFalse(self.journal.exists())

    def test_deployer_identity_target_and_active_jobs_never_write(self):
        for failure in ['identity', 'target', 'active']:
            with self.subTest(failure=failure):
                calls = self.execute_with_fake_provider(failure)
                self.assertNotIn('create-deployment', calls)
                self.assertFalse(self.journal.exists())

    def test_uncertain_create_retains_intent_and_blocks_retry(self):
        calls = self.execute_with_fake_provider('create')
        self.assertEqual(calls[-1], 'create-deployment')
        self.assertTrue(self.journal.exists())
        self.assertEqual(self.execute_with_fake_provider('retry'), [])

    def test_deployer_missing_configuration_never_contacts_provider(self):
        self.env.pop('C1_AWS_ROLE_ARN')
        self.assertEqual(self.execute_with_fake_provider('config'), [])

    def test_cross_target_metadata_rejected(self):
        for change in [{'appId': 'dother'}, {'appArn': self.app['appArn'] + 'other'},
                       {'repository': 'https://example.invalid/repo'},
                       {'tags': {'project': 'agentcore2', 'issue': '14'}}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                checks.target(self.config, {**self.app, **change}, self.branch, [])

    def test_cli_never_claims_live_readiness(self):
        output = self.root / 'cli'
        deployment.source.build(output)
        cmd = [sys.executable, str(OPS / 'c1_preflight.py'), '--bundle',
               str(output / 'showcase.zip'), '--expected-revision', self.revision]
        result = subprocess.run(cmd, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0)
        self.assertIn('deployment NOT_RUN', result.stdout)
        cmd[-1] = 'f' * 40
        result = subprocess.run(cmd, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('OFFLINE_PREFLIGHT_BLOCKED', result.stderr)

    def test_real_canonical_build_is_reproducible_and_revision_bound(self):
        # Real Git source, no synthetic digest override: missing pinned history fails.
        outputs = [self.root / 'one', self.root / 'two']
        for output in outputs:
            deployment.source.build(output)
        a, b = [(out / 'showcase.zip').read_bytes() for out in outputs]
        self.assertEqual(a, b)
        marker = checks.artifact(a, deployment.source.DIGEST, deployment.source.REFERENCE, self.revision)
        self.assertEqual(marker['mode'], 'MOCK SHOWCASE')
        with self.assertRaises(ValueError):
            checks.artifact(a, deployment.source.DIGEST, deployment.source.REFERENCE, 'f' * 40)


if __name__ == '__main__':
    unittest.main()
