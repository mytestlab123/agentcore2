"""AgentCore HTTP protocol for local contract validation; cloud ingress uses IAM."""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from service import locked_dispatch


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200 if self.path == "/ping" else 404)
        self.end_headers()
        self.wfile.write(b'{"status":"Healthy"}')

    def do_POST(self):
        if self.path != "/invocations":
            self.send_error(404)
            return
        try:
            request = json.loads(self.rfile.read(min(int(self.headers["Content-Length"]), 16384)))
            result = locked_dispatch(request)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except (ValueError, KeyError) as error:
            self.send_error(400, str(error))


if __name__ == "__main__":
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
