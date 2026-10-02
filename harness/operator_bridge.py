"""One local operator lifecycle; token never leaves the private file here."""
import http.client
import json
import os
import secrets
import stat
import subprocess
import sys
import time
from pathlib import Path
from preflight import check, private_file


def readiness(state, token):
    origin = json.loads(Path(state).read_text())["apps"]["b"]["url"]
    connection = http.client.HTTPConnection("127.0.0.1", 8703, timeout=5)
    connection.request("POST", "/", json.dumps({"method": "readiness"}), {
        "Host": "127.0.0.1:8443", "Origin": origin, "Content-Type": "application/json",
        "Authorization": "Bearer " + Path(token).read_text().strip()})
    response = connection.getresponse()
    result = json.loads(response.read())
    connection.close()
    if response.status != 200 or result.get("status") != "READY":
        raise ValueError("PRECHECK_FAILED: authenticated bridge readiness rejected")
    return result


def start(cfg):
    root = Path(cfg["root"]).resolve() / "harness"
    state = str(Path(cfg["state"]).resolve())
    token = str(Path(cfg["tokenFile"]).absolute())
    admission = check(root, state, token, allow_missing_token=True)
    if admission["existingPid"] and not admission["tokenExists"]:
        raise ValueError("PRECHECK_FAILED: active bridge token missing; do not replace it")
    if not admission["tokenExists"]:
        fd = os.open(token, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(secrets.token_hex(32)); f.flush(); os.fsync(f.fileno())
    private_file(token)
    if admission["existingPid"]:
        ready = readiness(state, token)
        if ready.get("sourceDigest") != admission["sourceDigest"]:
            raise ValueError("PRECHECK_FAILED: active bridge source differs; do not replace it automatically")
        return {"BRIDGE": "READY", "PID": admission["existingPid"], "reused": True}
    directory = Path.home() / ".AGENTS-temp/agentcore2-bridge"
    directory.mkdir(mode=0o700, exist_ok=True)
    info = directory.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
        raise ValueError("PRECHECK_FAILED: PID/log directory not owner-private")
    # Preserve historical logs; a fresh invocation gets its own exclusive log.
    log_path = directory / ("bridge-" + secrets.token_hex(6) + ".log")
    fd = os.open(log_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as log:
        process = subprocess.Popen([sys.executable, str(root / "bridge.py"), "--state", state,
            "--token-file", token], stdin=subprocess.DEVNULL, stdout=log, stderr=log,
            start_new_session=True, close_fds=True)
    try:
        pid_path = directory / ("bridge-" + str(process.pid) + ".pid")
        fd = os.open(pid_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(str(process.pid) + "\n"); f.flush(); os.fsync(f.fileno())
        for _ in range(30):
            if process.poll() is not None:
                raise ValueError("PRECHECK_FAILED: bridge exited; inspect owner-private log")
            try:
                ready = readiness(state, token)
                if ready.get("sourceDigest") != admission["sourceDigest"]:
                    raise ValueError("PRECHECK_FAILED: readiness source mismatch")
                return {"BRIDGE": "READY", "PID": process.pid, "reused": False}
            except ConnectionRefusedError:
                time.sleep(.1)
        raise ValueError("PRECHECK_FAILED: readiness timeout")
    except Exception:
        process.terminate(); process.wait(timeout=5)
        raise
