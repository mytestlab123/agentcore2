"""Offline bridge transport guards; no AWS clients or model calls."""
import http.client
import json
import secrets
import tempfile
import threading
import unittest
from pathlib import Path
from bridge import build_server
from models import model_config


class StubClient:
    calls = 0

    def __init__(self, path):
        self.state = json.loads(Path(path).read_text())

    def model_tool(self, model):
        model_config(model)  # Same server-owned allowlist, no inference.
        StubClient.calls += 1
        return {"modelId": model}

    def rpc(self, method, args):
        StubClient.calls += 1
        return {"method": method}


class BridgeGuards(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        state = root / "state.json"
        state.write_text(json.dumps({"apps": {"b": {"url": "https://preview.example"}},
            "harnessArn": "synthetic-runtime", "modelId": "apac.amazon.nova-lite-v1:0",
            "sessionId": "synthetic-session", "region": "ap-southeast-1"}))
        self.token = secrets.token_hex(32)
        token_path = root / "token"
        token_path.write_text(self.token)
        token_path.chmod(0o600)
        self.server = build_server(state, token_path, StubClient, port=0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        StubClient.calls = 0
        self.addCleanup(self.close)

    def close(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def request(self, host="127.0.0.1:8443", origin="https://preview.example", authenticated=True,
                method="POST", payload=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port)
        headers = {"Host": host, "Origin": origin, "Content-Type": "application/json"}
        if authenticated:
            headers["Authorization"] = "Bearer " + self.token
        connection.request(method, "/", json.dumps(payload or {"method": "evidence"}), headers)
        response = connection.getresponse()
        status = response.status
        response.read()
        connection.close()
        return status

    def test_direct_and_forwarded_loopback_evidence(self):
        for host in ("127.0.0.1:8443", "127.0.0.1:8703"):
            self.assertEqual(self.request(host=host), 200)
        self.assertEqual(self.request(method="OPTIONS"), 204)

    def test_anonymous_foreign_origin_host_and_unknown_model_fail_closed(self):
        self.assertEqual(self.request(authenticated=False, payload={"method": "execute"}), 401)
        self.assertEqual(self.request(origin="https://foreign.invalid"), 403)
        for host in ("localhost:8443", "192.168.0.10:8443", "127.0.0.1:8444"):
            self.assertEqual(self.request(host=host), 403)
            self.assertEqual(self.request(host=host, method="OPTIONS"), 403)
        self.assertEqual(self.request(payload={"method": "model_tool", "modelId": "unregistered"}), 400)
        self.assertEqual(StubClient.calls, 0)
