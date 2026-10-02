"""Read-only live target rejection and policy-absence proof before approval."""
import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "harness"))
from client import Client, safe
import boto3

p = argparse.ArgumentParser()
p.add_argument("--state", required=True)
args = p.parse_args()
c = Client(args.state)
s3 = boto3.Session(profile_name="amit", region_name="ap-southeast-1").client("s3")


def absence():
    try:
        s3.get_bucket_policy(Bucket=c.state["canaryName"])
    except s3.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchBucketPolicy":
            return {"status": "POLICY_ABSENT", "requestId": e.response["ResponseMetadata"]["RequestId"]}
        raise
    raise ValueError("Expected untouched canary with no policy")


before = absence()
initial = c.rpc("inspect_s3_ssl")
if initial["status"] != "NON_COMPLIANT":
    raise ValueError("Expected missing SSL-only policy")
try:
    c.rpc("proposeRemediation", ["unregistered-synthetic-target"])
except RuntimeError as e:
    if "Unregistered target" not in str(e):
        raise
else:
    raise ValueError("Unauthorized target unexpectedly admitted")
after = absence()
rejected = [e["value"]["result"] for e in c.state["evidence"] if e["kind"] == "runtime-command-result" and e["value"]["method"] == "execute" and e["value"]["result"].get("state") == "REJECTED"]
if not rejected or any(r.get("providerExecutionId") for r in rejected):
    raise ValueError("Rejected live run evidence missing or contains a write")
proof = {"initial": initial, "rejectRuns": [r["runId"] for r in rejected], "unauthorizedTarget": "REJECTED", "writes": 0, "before": before, "after": after}
c.journal("guard-proof", proof)
print(safe(proof))
