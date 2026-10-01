import json
import shutil
import tempfile
import unittest
from pathlib import Path
from preflight import check, REQUIRED


class RuntimePreflight(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        for name in REQUIRED:
            shutil.copyfile(Path(__file__).parent/name,self.root/name)
        self.state=self.root/'state.json'
        self.state.write_text(json.dumps({'profile':'amit','region':'ap-southeast-1','harnessArn':'synthetic',
            'sessionId':'synthetic-session','modelId':'apac.amazon.nova-lite-v1:0','apps':{'b':{'url':'https://preview.example'}}}))
        self.state.chmod(0o600)
        self.token=self.root/'token';self.token.write_text('synthetic-test-token-never-a-live-token');self.token.chmod(0o600)

    def run_check(self,**kwargs):
        return check(self.root,self.state,self.token,check_port=False,modules=(),**kwargs)

    def test_missing_harness_config_fails_before_start_or_browser(self):
        (self.root/'harness.json').unlink()
        with self.assertRaisesRegex(ValueError,'PRECHECK_FAILED: harness.json missing'):
            self.run_check()

    def test_complete_bundle_and_owner_private_inputs_pass(self):
        self.assertEqual(self.run_check()['status'],'READY')

    def test_wildcard_bind_public_token_and_manifest_drift_fail(self):
        with self.assertRaisesRegex(ValueError,'127.0.0.1'):
            self.run_check(host='0.0.0.0')
        self.token.chmod(0o644)
        with self.assertRaisesRegex(ValueError,'owner-only'):
            self.run_check()
        self.token.chmod(0o600)
        (self.root/'source-digests.json').write_text('{"files":{}}')
        with self.assertRaisesRegex(ValueError,'digest mismatch'):
            self.run_check()
