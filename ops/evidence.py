"""Public, bounded evidence export. Never export the raw private journal."""
import argparse
import json
import re
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("--state", required=True)
args = p.parse_args()
s = json.loads(Path(args.state).read_text())
public = {k: s.get(k) for k in ["followupId", "sourceSha", "ecrName", "imageDigest", "roleName", "harnessId", "harnessVersion", "runtimeEvidence", "commandSessionId", "canaryName", "canaryDeleted", "incidentalMemory"]}
public["apps"] = {k: {field: a.get(field) for field in ["name", "appId", "url", "jobId", "status", "bundleSha256"]} for k, a in s["apps"].items()}
public["providerRequests"] = [{"operation": j["operation"], "requestId": j.get("requestId") or j.get("response", {}).get("ResponseMetadata", {}).get("RequestId"), "reconciliation": j.get("reconciliation")} for j in s["journal"]]
public["modelAttempts"] = sum(e["kind"] == "harness-intent" for e in s.get("evidence", []))
public["evidence"] = [e for e in s.get("evidence", []) if e["kind"] in {"model-session", "harness-invocation", "model-output", "inline-tool-handoff", "runtime-command-request", "runtime-command-result", "model-proof"}]
print(re.sub(r"\b\d{12}\b", "<ACCOUNT_ID>", json.dumps(public, indent=2, default=str)))
