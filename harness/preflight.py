"""Local-only demo admission. No AWS clients, secrets or raw paths in errors."""
import hashlib
import importlib
import json
import os
import socket
import stat
from pathlib import Path
from models import DEFAULT_MODEL

REQUIRED = ("bridge.py", "client.py", "models.py", "harness.json")


def private_file(path, optional=False):
    p = Path(path)
    if optional and not p.exists() and not p.is_symlink():
        return False
    try:
        info = p.lstat()
        if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600:
            raise ValueError()
        with p.open("rb") as f:
            if not f.read(1):
                raise ValueError()
    except (OSError, ValueError):
        raise ValueError("PRECHECK_FAILED: private input missing, unreadable or not owner-only") from None
    return True


def check(root, state_path, token_path, host="127.0.0.1", port=8703,
          check_port=True, allow_missing_token=False, modules=("boto3", "botocore")):
    root = Path(root)
    if host != "127.0.0.1" or port != 8703:
        raise ValueError("PRECHECK_FAILED: bridge must use 127.0.0.1:8703")
    digests = {}
    for name in REQUIRED:
        p = root / name
        if not p.is_file() or p.is_symlink():
            raise ValueError("PRECHECK_FAILED: " + name + " missing or unsafe")
        digests[name] = hashlib.sha256(p.read_bytes()).hexdigest()
    manifest = root / "source-digests.json"
    if manifest.exists():
        if json.loads(manifest.read_text()).get("files") != digests:
            raise ValueError("PRECHECK_FAILED: runtime source/config digest mismatch")
    try:
        config = json.loads((root / "harness.json").read_text())
        if config["model"]["bedrockModelConfig"]["modelId"] != DEFAULT_MODEL or config["allowedTools"] != ["inspect_s3_ssl", "@*/inspect_s3_ssl"]:
            raise ValueError()
    except (ValueError, KeyError):
        raise ValueError("PRECHECK_FAILED: unexpected Harness model/tool config") from None
    for name in modules:
        try:
            importlib.import_module(name)
        except ImportError:
            raise ValueError("PRECHECK_FAILED: Python dependency unavailable: " + name) from None
    private_file(state_path)
    try:
        state = json.loads(Path(state_path).read_text())
        if state["profile"] != "amit" or state["region"] != "ap-southeast-1":
            raise ValueError()
        for key in ("harnessArn", "sessionId", "modelId", "apps"):
            if not state[key]:
                raise ValueError()
    except (ValueError, KeyError):
        raise ValueError("PRECHECK_FAILED: private Issue 3 runtime state incomplete") from None
    token_exists = private_file(token_path, optional=allow_missing_token)
    if token_exists and len(Path(token_path).read_text().strip()) < 32:
        raise ValueError("PRECHECK_FAILED: strong bridge token required")
    owner = None
    if check_port:
        with socket.socket() as probe:
            try:
                probe.bind((host, port))
            except OSError:
                # Linux Dell: identify the listener and its exact state/token argv.
                inodes = set()
                for table in ("tcp", "tcp6"):
                    for line in Path("/proc/net/" + table).read_text().splitlines()[1:]:
                        parts = line.split()
                        if parts[3] == "0A" and parts[1].endswith(":21FF"):
                            if table != "tcp" or parts[1] != "0100007F:21FF":
                                raise ValueError("PRECHECK_FAILED: unsafe bridge listener")
                            inodes.add(parts[9])
                for process in Path("/proc").iterdir():
                    if not process.name.isdigit():
                        continue
                    try:
                        if process.stat().st_uid != os.getuid():
                            continue
                        sockets = {os.readlink(p) for p in (process / "fd").iterdir()}
                        if not any("socket:[" + inode + "]" in sockets for inode in inodes):
                            continue
                        args = (process / "cmdline").read_bytes().decode().rstrip("\0").split("\0")
                        if args[1:] != [str(root / "bridge.py"), "--state", str(state_path), "--token-file", str(token_path)]:
                            raise ValueError("PRECHECK_FAILED: bridge port owned by a different process")
                        owner = int(process.name)
                    except (FileNotFoundError, PermissionError, ProcessLookupError):
                        continue
                if owner is None:
                    raise ValueError("PRECHECK_FAILED: bridge port ownership unknown")
    return {"status": "READY", "sourceDigest": hashlib.sha256(json.dumps(digests, sort_keys=True).encode()).hexdigest(),
            "existingPid": owner, "tokenExists": token_exists}
