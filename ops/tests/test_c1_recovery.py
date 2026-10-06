"""Exercise the shipped helper end to end with a fake provider and fake HTTP."""
from contextlib import ExitStack, redirect_stdout
import copy
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import unittest
import zipfile
from unittest.mock import patch

import test_c1_preflight as fixture

helper = fixture.deployment
receipt = helper.receipt


class Recovery(unittest.TestCase):
    archive = fixture.Preflight.archive

    def setUp(self):
        fixture.Preflight.setUp(self)
        self.app['defaultDomain'] = 'example.invalid'
        self.calls = []
        self.puts = []
        self.original = self.bundle.read_bytes()
        self.failure = None
        self.state = 'SUCCEED'
        self.job_id = '7'
        self.http_mismatch = False
        self.interrupt = False

    def maybe_fault(self, point):
        if self.failure == point:
            if self.interrupt:
                raise KeyboardInterrupt('PRIVATE diagnostic must not be published')
            raise OSError('PRIVATE diagnostic must not be published')

    def fake_aws(self, service, action, **params):
        self.calls.append(action)
        if action == 'get-caller-identity':
            return self.identity
        if action == 'get-app':
            return {'app': self.app}
        if action == 'get-branch':
            return {'branch': self.branch}
        if action == 'list-jobs':
            return {'jobSummaries': []}
        if action == 'create-deployment':
            self.assertEqual(self.read()['phase'], 'CREATE_INTENT')
            self.maybe_fault('create')
            return {'jobId': '7', 'zipUploadUrl': 'https://upload.invalid/private-signed-value'}
        if action == 'start-deployment':
            self.assertEqual(self.read()['phase'], 'START_INTENT')
            self.maybe_fault('start')
            return {}
        if action == 'get-job':
            self.assertEqual(params['app_id'], 'dtest')
            self.assertEqual(params['branch_name'], 'showcase-c1')
            self.assertEqual(params['job_id'], '7')
            self.maybe_fault('poll')
            return {'job': {'summary': {'jobId': self.job_id, 'status': self.state}}}
        raise AssertionError('Unexpected provider operation')

    def fake_http(self, request, **kwargs):
        if not isinstance(request, str):
            self.assertEqual(request.get_method(), 'PUT')
            self.assertEqual(self.read()['phase'], 'UPLOAD_INTENT')
            self.puts.append(request.data)
            self.maybe_fault('upload')
            response = io.BytesIO()
            response.status = 403 if self.failure == 'upload-rejected' else 200
            return response
        self.maybe_fault('http')
        if request.endswith('/revision.json'):
            return io.BytesIO(json.dumps({} if self.http_mismatch else self.marker).encode())
        return io.BytesIO(self.data)

    def run_helper(self, resume=False, cli_boundary=False):
        with ExitStack() as stack:
            stack.enter_context(redirect_stdout(io.StringIO()))
            stack.enter_context(patch.dict('os.environ', self.env, clear=True))
            if cli_boundary:
                stack.enter_context(patch.object(helper.subprocess, 'check_output',
                                                return_value=self.revision))
                stack.enter_context(patch.object(helper.subprocess, 'run', self.fake_cli))
            else:
                stack.enter_context(patch.object(helper, 'aws', self.fake_aws))
            stack.enter_context(patch.object(helper.urllib.request, 'urlopen', self.fake_http))
            stack.enter_context(patch.object(helper.time, 'sleep'))
            stack.enter_context(patch.object(helper.source, 'DIGEST', self.digest))
            stack.enter_context(patch.object(helper.source, 'REFERENCE', 'a' * 40))
            helper.deploy(self.bundle, self.journal, resume_observation=resume, attempts=2)

    def fake_cli(self, cmd, *, capture_output, text, env):
        # Exercise the production aws() wrapper, replacing only the OS boundary.
        self.assertEqual(cmd[0], 'aws')
        self.assertEqual(cmd[3:7], ['--region', 'ap-southeast-1', '--output', 'json'])
        self.assertTrue(capture_output and text)
        self.assertEqual(env['AWS_MAX_ATTEMPTS'], '1')
        self.assertEqual(env['AWS_RETRY_MODE'], 'standard')
        self.assertEqual(dict(os.environ), self.env)  # Parent is not mutated.
        self.assertEqual(env['C1_APP_ID'], self.env['C1_APP_ID'])
        params = {cmd[i][2:].replace('-', '_'): cmd[i + 1]
                  for i in range(7, len(cmd), 2)}
        result = self.fake_aws(cmd[1], cmd[2], **params)
        if cmd[2] == self.cli_fault_action:
            self.intent_bytes = self.journal.read_bytes()
            if self.cli_outcome == 'nonzero':
                return subprocess.CompletedProcess(cmd, 1, '', 'PRIVATE provider error')
            if self.cli_outcome == 'invalid-json':
                return subprocess.CompletedProcess(cmd, 0, 'PRIVATE malformed response', '')
            if self.cli_outcome == 'timeout':
                raise subprocess.TimeoutExpired(cmd, 30)
            if self.cli_outcome == 'interrupt':
                raise KeyboardInterrupt('PRIVATE interruption')
            raise OSError('PRIVATE connection lost')
        return subprocess.CompletedProcess(cmd, 0, json.dumps(result), '')

    def test_cli_boundary_uncertain_writes_preserve_receipts_and_never_repeat(self):
        for action, phase, counts in [('create-deployment', 'CREATE_INTENT', (1, 0, 0)),
                                      ('start-deployment', 'START_INTENT', (1, 1, 1))]:
            for outcome in ['nonzero', 'invalid-json', 'timeout', 'interrupt', 'connection']:
                for mode in [None, 'legacy', 'standard', 'adaptive']:
                    with self.subTest(action=action, outcome=outcome, inherited_mode=mode):
                        self.journal = self.root / f'{action}-{outcome}-{mode}.json'
                        self.calls, self.puts = [], []
                        if mode:
                            self.env.update(AWS_MAX_ATTEMPTS='9', AWS_RETRY_MODE=mode)
                        else:
                            self.env.pop('AWS_MAX_ATTEMPTS', None)
                            self.env.pop('AWS_RETRY_MODE', None)
                        self.cli_fault_action, self.cli_outcome = action, outcome
                        with self.assertRaises((RuntimeError, ValueError, OSError,
                                                subprocess.TimeoutExpired, KeyboardInterrupt)):
                            self.run_helper(cli_boundary=True)
                        self.assertEqual(self.write_counts(), counts)
                        self.assertEqual(self.read()['phase'], phase)
                        self.assertEqual(self.journal.read_bytes(), self.intent_bytes)
                        before = list(self.calls)
                        with self.assertRaises(ValueError):
                            self.run_helper(cli_boundary=True)
                        self.assertEqual(self.calls, before)
                        self.inspect()
                        self.assertEqual(self.journal.read_bytes(), self.intent_bytes)
                        self.cli_fault_action = None
                        if action == 'create-deployment':
                            with self.assertRaises(ValueError):
                                self.run_helper(resume=True, cli_boundary=True)
                            self.assertEqual(self.calls, before)
                            self.assertEqual(self.journal.read_bytes(), self.intent_bytes)
                        else:
                            self.run_helper(resume=True, cli_boundary=True)
                            self.run_helper(resume=True, cli_boundary=True)
                            self.assertEqual(self.read()['phase'], 'HTTP_DIGEST_VERIFIED')
                        self.assertEqual(self.write_counts(), counts)

    def read(self):
        return json.loads(self.journal.read_text())

    def inspect(self):
        with patch.object(helper.source, 'DIGEST', self.digest), \
             patch.object(helper.source, 'REFERENCE', 'a' * 40), \
             patch.object(helper, 'aws', side_effect=AssertionError('inspection called AWS')), \
             patch.object(helper.subprocess, 'check_output', side_effect=AssertionError('inspection ran command')):
            return helper.inspect(self.bundle, self.journal, self.revision,
                                  receipt.target_digest(self.config))

    def write_counts(self):
        return (self.calls.count('create-deployment'), len(self.puts),
                self.calls.count('start-deployment'))

    def test_success_and_repeated_resume_never_duplicate_writes(self):
        self.run_helper()
        self.assertEqual(self.write_counts(), (1, 1, 1))
        self.assertEqual(self.puts, [self.original])
        self.assertEqual(self.read()['phase'], 'HTTP_DIGEST_VERIFIED')
        self.assertNotIn('url', self.read())
        self.run_helper(resume=True)
        self.run_helper(resume=True)
        self.assertEqual(self.write_counts(), (1, 1, 1))
        before = self.journal.read_bytes()
        summary = self.inspect()
        self.assertFalse(summary['redispatchAllowed'])
        self.assertEqual(summary['liveEvidence'], 'NOT_VERIFIED_BY_INSPECTION')
        self.assertEqual(before, self.journal.read_bytes())
        self.assertNotIn('private-signed-value', json.dumps(self.read()))

    def test_uncertain_create_has_no_auto_resume(self):
        self.failure = 'create'
        with self.assertRaises(OSError):
            self.run_helper()
        self.assertEqual(self.read()['phase'], 'CREATE_INTENT')
        before = list(self.calls)
        with self.assertRaises(ValueError):
            self.run_helper(resume=True)
        with self.assertRaises(ValueError):
            self.run_helper()
        self.assertEqual(self.calls, before)
        self.assertIn('RECONCILE_CREATE', self.inspect()['nextAction'])

    def test_uncertain_upload_and_rejection_resume_only_reads(self):
        for failure in ['upload', 'upload-rejected']:
            with self.subTest(failure=failure):
                self.journal = self.root / (failure + '.json')
                self.failure = failure
                with self.assertRaises((OSError, ValueError)):
                    self.run_helper()
                self.assertEqual(self.read()['phase'], 'UPLOAD_INTENT')
                counts = self.write_counts()
                self.assertIn('UNCERTAIN_WRITE', self.inspect()['nextAction'])
                self.failure = None
                # Synthetic external reconciliation reports success; never upload/start again.
                self.run_helper(resume=True)
                self.assertEqual(self.write_counts(), counts)

    def test_uncertain_start_resumes_without_starting_again(self):
        self.failure = 'start'
        with self.assertRaises(OSError):
            self.run_helper()
        self.assertEqual(self.read()['phase'], 'START_INTENT')
        counts = self.write_counts()
        self.failure = None
        self.run_helper(resume=True)
        self.assertEqual(self.write_counts(), counts)

    def test_poll_failure_and_timeout_resume_observation(self):
        for failure in ['poll', 'timeout']:
            with self.subTest(failure=failure):
                self.journal = self.root / (failure + '.json')
                self.failure = failure
                self.state = 'RUNNING'
                with self.assertRaises((OSError, ValueError)):
                    self.run_helper()
                self.assertEqual(self.read()['phase'], 'STARTED')
                counts = self.write_counts()
                self.failure, self.state = None, 'SUCCEED'
                self.run_helper(resume=True)
                self.assertEqual(self.write_counts(), counts)

    def test_interrupted_writes_and_poll_preserve_intent(self):
        for point, phase in [('create', 'CREATE_INTENT'), ('upload', 'UPLOAD_INTENT'),
                             ('start', 'START_INTENT'), ('poll', 'STARTED')]:
            with self.subTest(point=point):
                self.journal = self.root / (point + '.json')
                self.failure, self.interrupt = point, True
                with self.assertRaises(KeyboardInterrupt):
                    self.run_helper()
                self.assertEqual(self.read()['phase'], phase)
                counts = self.write_counts()
                self.failure = None
                if point == 'create':
                    with self.assertRaises(ValueError):
                        self.run_helper(resume=True)
                else:
                    self.run_helper(resume=True)
                self.assertEqual(self.write_counts(), counts)

    def test_terminal_failures_stop_without_retry(self):
        for state in ['FAILED', 'CANCELLED']:
            with self.subTest(state=state):
                self.journal = self.root / (state + '.json')
                self.state = state
                with self.assertRaises(ValueError):
                    self.run_helper()
                self.assertEqual(self.read()['state'], state)
                self.assertIn('TERMINAL_STOP', self.inspect()['nextAction'])
                before = list(self.calls)
                with self.assertRaises(ValueError):
                    self.run_helper(resume=True)
                self.assertEqual(self.calls, before)

    def test_wrong_job_or_unknown_state_is_not_recorded(self):
        for job, state in [('other', 'SUCCEED'), ('7', 'NEW_STATE')]:
            with self.subTest(job=job, state=state):
                self.journal = self.root / (job + state + '.json')
                self.job_id, self.state = job, state
                with self.assertRaises(ValueError):
                    self.run_helper()
                self.assertNotIn('state', self.read())
                self.assertEqual(self.read()['phase'], 'STARTED')

    def test_http_mismatch_or_interruption_does_not_claim_verified(self):
        for point in ['mismatch', 'http']:
            with self.subTest(point=point):
                self.journal = self.root / (point + '.json')
                self.http_mismatch = point == 'mismatch'
                self.failure = point
                with self.assertRaises((ValueError, OSError)):
                    self.run_helper()
                self.assertEqual(self.read()['phase'], 'STARTED')
                self.assertEqual(self.read()['state'], 'SUCCEED')
                counts = self.write_counts()
                self.http_mismatch, self.failure = False, None
                self.run_helper(resume=True)
                self.assertEqual(self.write_counts(), counts)

    def test_receipt_write_failure_blocks_following_operation(self):
        original_save = receipt.save
        for phase, expected in [('CREATE_INTENT', (0, 0, 0)), ('UPLOAD_INTENT', (1, 0, 0)),
                                ('START_INTENT', (1, 1, 0)), ('STARTED', (1, 1, 1))]:
            with self.subTest(phase=phase):
                self.journal = self.root / (phase + '.json')
                self.calls, self.puts = [], []
                def broken(path, record, **kwargs):
                    if record['phase'] == phase:
                        raise OSError('Synthetic disk failure')
                    return original_save(path, record, **kwargs)
                with patch.object(receipt, 'save', broken), self.assertRaises(OSError):
                    self.run_helper()
                self.assertEqual(self.write_counts(), expected)

    def test_exclusive_reservation_cannot_replace_prior_receipt(self):
        record = receipt.new(self.marker, self.original, self.config, '123')
        receipt.save(self.journal, record, create=True)
        before = self.journal.read_bytes()
        with self.assertRaises(FileExistsError):
            receipt.save(self.journal, {**record, 'githubRunId': '456'}, create=True)
        self.assertEqual(self.journal.read_bytes(), before)

    def test_artifact_revision_target_and_schema_mismatch_block_before_provider(self):
        self.failure = 'poll'
        with self.assertRaises(OSError):
            self.run_helper()
        good = self.read()
        for change in [{'schemaVersion': 0}, {'wrapperRevision': 'f' * 40},
                       {'bundleSha256': '0' * 64}, {'targetSha256': '0' * 64},
                       {'jobId': 'https://private.invalid'}, {'phase': 'UNKNOWN'},
                       {'unexpectedPrivateField': 'PRIVATE'}]:
            with self.subTest(change=change):
                self.journal.write_text(json.dumps({**good, **change}))
                before = list(self.calls)
                with self.assertRaises(ValueError):
                    self.run_helper(resume=True)
                self.assertEqual(self.calls, before)
                with self.assertRaises(ValueError):
                    self.inspect()

    def test_partial_missing_or_duplicate_json_blocks(self):
        for data in ['', '{', '{"schemaVersion":1,"schemaVersion":1}', '{}']:
            with self.subTest(data=data):
                self.journal.write_text(data)
                with self.assertRaises(ValueError):
                    self.inspect()
        self.journal = self.root / 'absent.json'
        with self.assertRaises(FileNotFoundError):
            self.inspect()

    def test_cli_redacts_invalid_input_and_preserves_files(self):
        self.journal.write_text('PRIVATE signed-url token diagnostic')
        before = self.journal.read_bytes()
        result = subprocess.run([sys.executable, str(Path(helper.__file__)), '--inspect-receipt',
                                 '--bundle', str(self.bundle), '--journal', str(self.journal),
                                 '--expected-revision', self.revision,
                                 '--expected-target-sha256', receipt.target_digest(self.config)],
                                text=True, capture_output=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('PRIVATE', result.stdout + result.stderr)
        self.assertIn('C1_BLOCKED', result.stderr)
        self.assertEqual(before, self.journal.read_bytes())

    def test_cli_valid_real_artifact_is_offline_and_sanitized(self):
        output = self.root / 'real'
        helper.source.build(output)
        data = (output / 'showcase.zip').read_bytes()
        marker = json.loads((output / 'public/revision.json').read_text())
        record = receipt.new(marker, data, self.config, '123')
        receipt.save(self.journal, record, create=True)
        before = self.journal.read_bytes()
        result = subprocess.run([sys.executable, str(Path(helper.__file__)), '--inspect-receipt',
                                 '--bundle', str(output / 'showcase.zip'), '--journal', str(self.journal),
                                 '--expected-revision', self.revision,
                                 '--expected-target-sha256', receipt.target_digest(self.config)],
                                text=True, capture_output=True, env={})
        self.assertEqual(result.returncode, 0, result.stderr)
        summary = json.loads(result.stdout)
        self.assertFalse(summary['redispatchAllowed'])
        self.assertEqual(summary['inspection'], 'OFFLINE_ONLY')
        self.assertNotIn(record['targetSha256'], result.stdout)
        self.assertNotIn('dtest', result.stdout)
        self.assertEqual(before, self.journal.read_bytes())

    def test_same_html_different_zip_bytes_cannot_resume(self):
        self.failure = 'poll'
        with self.assertRaises(OSError):
            self.run_helper()
        with zipfile.ZipFile(self.bundle, 'a') as archive:
            archive.comment = b'different container, identical product'
        before = list(self.calls)
        with self.assertRaises(ValueError):
            self.run_helper(resume=True)
        self.assertEqual(self.calls, before)

    def test_resume_rechecks_current_identity_and_target_before_job_read(self):
        self.failure = 'poll'
        with self.assertRaises(OSError):
            self.run_helper()
        self.failure = None
        for field in ['identity', 'target']:
            with self.subTest(field=field):
                before = self.calls.count('get-job')
                original_identity, original_branch = copy.deepcopy(self.identity), copy.deepcopy(self.branch)
                if field == 'identity':
                    self.identity['Arn'] = 'wrong'
                else:
                    self.branch['branchName'] = 'main'
                with self.assertRaises(ValueError):
                    self.run_helper(resume=True)
                self.assertEqual(self.calls.count('get-job'), before)
                self.identity, self.branch = original_identity, original_branch


if __name__ == '__main__':
    unittest.main()
