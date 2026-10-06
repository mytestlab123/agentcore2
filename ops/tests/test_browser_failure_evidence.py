"""Offline rejection tests for the synthetic artifact publication gate."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location(
    'browser_evidence', Path(__file__).resolve().parents[1] / 'verify-browser-failure.py')
evidence = importlib.util.module_from_spec(spec)
spec.loader.exec_module(evidence)


class FailureEvidence(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.request = {'method': 'GET', 'url': 'http://127.0.0.1:4321/', 'headers': [], 'cookies': []}
        self.extra = b'synthetic content'
        self.write()

    def write(self):
        (self.root / 'failure.json').write_text(json.dumps(
            {'message': evidence.MARKER, 'errors': [], 'unexpected': []}))
        (self.root / 'failure.png').write_bytes(b'\x89PNG\r\n\x1a\nfixture')
        with zipfile.ZipFile(self.root / 'trace.zip', 'w', zipfile.ZIP_DEFLATED) as z:
            z.writestr('0.trace', json.dumps({'type': 'frame-snapshot'}))
            z.writestr('0.network', json.dumps({'type': 'resource-snapshot',
                                               'snapshot': {'request': self.request}}))
            z.writestr('resources/synthetic.txt', self.extra)

    def test_expected_synthetic_structure(self):
        result = evidence.verify(self.root)
        self.assertEqual(result['expectedSmokeExit'], 1)
        self.assertEqual(result['localDocumentRequests'], 1)
        self.assertEqual(len(result['files']), 3)

    def test_missing_or_extra_files_rejected(self):
        for name in ['failure.json', 'failure.png', 'trace.zip']:
            with self.subTest(name=name):
                self.write()
                (self.root / name).unlink()
                with self.assertRaises(ValueError):
                    evidence.verify(self.root)
        self.write()
        (self.root / 'private.txt').write_text('unrelated')
        with self.assertRaises(ValueError):
            evidence.verify(self.root)

    def test_private_sentinel_inside_compressed_resource_rejected(self):
        self.extra = evidence.SENTINEL
        self.write()
        with self.assertRaises(ValueError):
            evidence.verify(self.root)

    def test_external_request_or_post_rejected(self):
        for update in [{'url': 'https://example.invalid/'}, {'method': 'POST'}]:
            with self.subTest(update=update):
                self.request.update(update)
                self.write()
                with self.assertRaises(ValueError):
                    evidence.verify(self.root)

    def test_session_state_or_auth_header_rejected(self):
        for key, value in [('cookies', [{'name': 'synthetic', 'value': 'private'}]),
                           ('headers', [{'name': 'Authorization', 'value': 'synthetic'}]),
                           ('localStorage', [{'name': 'session', 'value': 'synthetic'}])]:
            with self.subTest(key=key):
                self.request = {'method': 'GET', 'url': 'http://127.0.0.1:4321/', key: value}
                self.write()
                with self.assertRaises(ValueError):
                    evidence.verify(self.root)

    def test_wrong_failure_and_missing_trace_events_rejected(self):
        (self.root / 'failure.json').write_text('{}')
        with self.assertRaises(ValueError):
            evidence.verify(self.root)
        self.write()
        with zipfile.ZipFile(self.root / 'trace.zip', 'w') as z:
            z.writestr('empty.trace', '')
        with self.assertRaises(ValueError):
            evidence.verify(self.root)

    def test_credential_shaped_bytes_rejected(self):
        self.extra = b'AKIA' + b'X' * 16
        self.write()
        with self.assertRaises(ValueError):
            evidence.verify(self.root)


if __name__ == '__main__':
    unittest.main()
