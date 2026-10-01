"""Windows/macOS/Linux stdlib CLI: fresh private token + SSH tunnel instructions.

Run in an unrecorded owner terminal. Never redirect stdout or use a transcript.
No AWS calls; no local token file; never replaces an existing token.
"""
import argparse
import json
import shlex
import subprocess
import sys


# Input paths are passed as JSON on SSH stdin, never interpolated into a shell.
REMOTE = r'''
import json, os, secrets, socket, stat, sys
from pathlib import Path
cfg = json.loads(sys.stdin.readline())
root = Path(cfg["root"]).resolve(strict=True)
state = Path(cfg["state"]).resolve(strict=True)
token_path = state.parent / "windows-demo-token"
if state.stat().st_uid != os.getuid() or state.parent.stat().st_uid != os.getuid():
    raise ValueError("State must belong to the Dell owner")
if state.stat().st_mode & 0o077 or state.parent.stat().st_mode & 0o077:
    raise ValueError("State and its directory must be owner-private")
if not (root / "harness/bridge.py").is_file():
    raise ValueError("Missing versioned bridge source")
with socket.socket() as s:
    if s.connect_ex(("127.0.0.1", 8703)) == 0:
        raise ValueError("A bridge already owns port 8703; do not rotate its token")
token = secrets.token_hex(32)
fd = os.open(token_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
with os.fdopen(fd, "w") as f:
    f.write(token)
    f.flush()
    os.fsync(f.fileno())
print(json.dumps({"token": token, "tokenFile": str(token_path)}))
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="Dell directory containing the current harness/bridge.py")
    parser.add_argument("--state", required=True, help="Existing Dell owner-private execution state.json")
    parser.add_argument("--python", default="python3", help="Dell Python with existing Harness SDK installed")
    parser.add_argument("--tunnel", action="store_true", help="Start the foreground SSH tunnel after printing instructions")
    args = parser.parse_args()
    # The remote interpreter reads source from argv, then JSON input from stdin.
    command = "python3 -c " + shlex.quote(REMOTE)
    result = subprocess.run(["ssh", "-o", "ConnectTimeout=10", "home", command],
        input=json.dumps({"root": args.root, "state": args.state}) + "\n", text=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=30)
    if result.returncode:
        # Remote diagnostics cannot contain the generated token (printed only on success).
        raise SystemExit("Token preparation blocked; inspect the Dell state permissions, token-file existence and port 8703. No token was printed.")
    data = json.loads(result.stdout)
    print("Paste this ephemeral session token once into Preview B (do not record this terminal):")
    print(data["token"], flush=True)
    bridge_args = [args.python, args.root.rstrip("/") + "/harness/bridge.py",
                   "--state", args.state, "--token-file", data["tokenFile"]]
    print("In a separate terminal, start the Dell bridge (keep it open):")
    print(subprocess.list2cmdline(["ssh", "home", shlex.join(bridge_args)]))
    print("Browser Bridge URL: http://127.0.0.1:8443")
    print("SSH tunnel (keep it open; Ctrl+C closes it):")
    tunnel = ["ssh", "-o", "ExitOnForwardFailure=yes", "-N", "-L", "127.0.0.1:8443:127.0.0.1:8703", "home"]
    print(subprocess.list2cmdline(tunnel))
    if args.tunnel:
        try:
            raise SystemExit(subprocess.call(tunnel))
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
