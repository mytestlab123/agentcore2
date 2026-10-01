"""Loopback-only operator bridge; no public mutation endpoint or stored AWS keys."""
import argparse
import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from client import Client, safe


def build_server(state_path, token_path, client_factory=Client, port=8703):
    state = json.loads(Path(state_path).read_text())
    origins = {a["url"] for a in state["apps"].values()}
    p = Path(token_path)
    if p.stat().st_mode & 0o077:
        raise ValueError("Bridge token must be owner-private")
    token = p.read_text().strip()
    if len(token) < 32:
        raise ValueError("Strong private bridge token required")

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass  # Do not log requests, authorization headers or payloads.

        def reply(self, status, data):
            self.send_response(status)
            origin = self.headers.get("Origin")
            if origin in origins:
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Vary", "Origin")
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(safe(data).encode())

        def do_OPTIONS(self):
            if self.headers.get("Host") not in {"127.0.0.1:8703", "127.0.0.1:8443"} or self.headers.get("Origin") not in origins:
                return self.reply(403, {"error": "Unregistered preview origin"})
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", self.headers["Origin"])
            self.send_header("Access-Control-Allow-Methods", "POST")
            self.send_header("Access-Control-Allow-Headers", "authorization,content-type")
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.end_headers()

        def do_POST(self):
            # SSH forwards bytes unchanged: the Windows URL sends Host :8443.
            # Accept exactly the direct Dell and forwarded loopback authorities.
            if self.headers.get("Host") not in {"127.0.0.1:8703", "127.0.0.1:8443"} or self.headers.get("Origin") not in origins:
                return self.reply(403, {"error": "Unregistered host/origin"})
            if not hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + token):
                return self.reply(401, {"error": "Private operator authentication required"})
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 16384:
                    raise ValueError("Bounded JSON request required")
                r = json.loads(self.rfile.read(length))
                c = client_factory(state_path)
                if r["method"] == "evidence":
                    result = {"runtimeArn": c.state["harnessArn"], "modelId": c.state["modelId"], "sessionId": c.state["sessionId"], "toolId": "inspect_s3_ssl", "region": c.state["region"]}
                elif r["method"] == "model_tool":
                    result = c.model_tool(r.get("modelId"))
                else:
                    result = c.rpc(r["method"], r.get("args"))
                self.reply(200, result)
            except Exception as e:
                self.reply(400, {"error": str(e)})
    return HTTPServer(("127.0.0.1", port), Handler)


def serve(state_path, token_path):
    build_server(state_path, token_path).serve_forever()


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--state", required=True)
    p.add_argument("--token-file", required=True)
    args = p.parse_args()
    serve(args.state, args.token_file)
