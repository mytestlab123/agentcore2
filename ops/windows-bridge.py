"""One demo lifecycle. Token delivery is separate; stdout is always non-secret."""
import argparse
import json
import shlex
import subprocess
import sys
from pathlib import Path


def remote(python, code, data):
    result = subprocess.run(["ssh", "-o", "ConnectTimeout=10", "home", shlex.quote(python) + " -c " + shlex.quote(code)],
        input=json.dumps(data), text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=40)
    if result.returncode:
        try:
            reason = json.loads(result.stdout).get("error", "Runtime preflight failed")
        except ValueError:
            reason = "Runtime preflight failed: check the complete bundle and Python dependencies."
        raise SystemExit(reason)
    return json.loads(result.stdout)


START = '''import json,sys
cfg=json.loads(sys.stdin.read());sys.path.insert(0,cfg['root']+'/harness')
try:
 from operator_bridge import start
 print(json.dumps(start(cfg)))
except Exception as e:
 message=str(e) if isinstance(e,ValueError) and str(e).startswith('PRECHECK_FAILED:') else 'PRECHECK_FAILED: operator startup failed'
 print(json.dumps({'error':message}));sys.exit(1)
'''


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--root", required=True)
    p.add_argument("--state", required=True)
    p.add_argument("--python", default="python3", help="Dell Python with Harness SDK")
    p.add_argument("--token-file", default="/home/dev/.AGENTS-temp/agentcore2-windows-demo-token")
    p.add_argument("--tunnel", action="store_true")
    p.add_argument("--smoke", action="store_true", help="Real deployed B browser check; no Nova")
    p.add_argument("--playwright-module")
    p.add_argument("--node", default="node")
    args = p.parse_args()
    if args.smoke and not args.playwright_module:
        p.error("--smoke needs --playwright-module pointing to the existing installation")
    cfg = {"root": args.root, "state": args.state, "tokenFile": args.token_file}
    result = remote(args.python, START, cfg)
    print(json.dumps(result), flush=True)
    print("Bridge URL: http://127.0.0.1:8443. Retrieve the token separately in an unrecorded owner terminal.", flush=True)
    tunnel = None
    try:
        if args.tunnel:
            tunnel = subprocess.Popen(["ssh", "-o", "ExitOnForwardFailure=yes", "-N", "-L", "127.0.0.1:8443:127.0.0.1:8703", "home"],
                                      stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            import time
            time.sleep(1)
            if tunnel.poll() is not None:
                raise SystemExit("TUNNEL_FAILED: local forward unavailable; preserve any existing owner tunnel.")
        if args.smoke:
            data = remote(args.python, "import json,sys; from pathlib import Path; d=json.loads(sys.stdin.read()); print(json.dumps({'token':Path(d['tokenFile']).read_text().strip()}))", cfg)
            smoke_path = str(Path(__file__).with_name("demo-e2e.cjs"))
            if sys.platform != "win32" and args.node.endswith(".exe"):
                smoke_path = subprocess.check_output(["wslpath", "-w", smoke_path], text=True).strip()
            proof = subprocess.run([args.node, smoke_path, args.playwright_module],
                input=json.dumps(data), text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=90)
            data["token"] = ""
            if proof.returncode:
                raise SystemExit("DEMO_E2E_FAILED: browser readiness or UI gate failed; no token diagnostics exported.")
            print(proof.stdout.strip())
        elif tunnel:
            print("Tunnel active; Ctrl+C closes this owned forward. Dell bridge remains ready.", flush=True)
            tunnel.wait()
    except KeyboardInterrupt:
        pass
    finally:
        if tunnel and tunnel.poll() is None:
            tunnel.terminate(); tunnel.wait(timeout=10)


if __name__ == "__main__":
    main()
