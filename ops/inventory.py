"""Reconcile only this follow-up's ledger-owned resources, read-only."""
import argparse
import json
from pathlib import Path
from followup import Run, sanitize

p = argparse.ArgumentParser()
p.add_argument("--state", required=True)
args = p.parse_args()
r = Run(args.state)
s = r.state
records = []


def record(kind, identifier, name, tags, status, parent=None):
    if tags.get("project") != "agentcore2" or tags.get("followup") != s["followupId"]:
        raise ValueError("Resource ownership mismatch: " + kind)
    records.append({"resource_type": kind, "resource_id": identifier, "name": name, "repo": "mytestlab123/agentcore2", "owner": "amit", "environment": "dev", "purpose": "Issue 3 focused live proof", "phase": "F2-F5", "version": tags.get("version"), "created": tags.get("created"), "ttl": tags.get("ttl"), "cleanup": tags.get("cleanup", "review"), "source_or_parent": parent, "issue_or_pr": "Issue 3 / PR 5", "status": status})


c = r.session.client("ecr")
repo = c.describe_repositories(repositoryNames=[s["ecrName"]])["repositories"][0]
tags = {t["Key"]: t["Value"] for t in c.list_tags_for_resource(resourceArn=repo["repositoryArn"])["tags"]}
record("ECR", s["ecrName"], s["ecrName"], tags, "RETAINED", s["imageDigest"])
c = r.session.client("iam")
role = c.get_role(RoleName=s["roleName"])["Role"]
record("IAM runtime role", role["RoleId"], role["RoleName"], {t["Key"]: t["Value"] for t in role["Tags"]}, "RETAINED")
c = r.session.client("bedrock-agentcore-control")
h = c.get_harness(harnessId=s["harnessId"])["harness"]
tags = c.list_tags_for_resource(resourceArn=h["arn"])["tags"]
record("AgentCore Harness", h["harnessId"], h["harnessName"], tags, h["status"])
runtime = h["environment"]["agentCoreRuntimeEnvironment"]
runtime_read = c.get_agent_runtime(agentRuntimeId=runtime["agentRuntimeId"])
record("AgentCore runtime", runtime["agentRuntimeId"], runtime["agentRuntimeName"], c.list_tags_for_resource(resourceArn=runtime["agentRuntimeArn"])["tags"], runtime_read["status"], h["harnessId"])
memory = s.get("incidentalMemory", {}).get("arn")
if memory:
    m = c.get_memory(memoryId=memory.rsplit("/", 1)[1])["memory"]
    record("Incidental managed memory (DISABLED)", m["id"], m["name"], c.list_tags_for_resource(resourceArn=memory)["tags"], m["status"], h["harnessId"])
c = r.session.client("amplify")
for label, app in s["apps"].items():
    a = c.get_app(appId=app["appId"])["app"]
    j = c.get_job(appId=app["appId"], branchName="main", jobId=app["jobId"])["job"]["summary"]
    record("Amplify preview " + label.upper(), a["appId"], a["name"], a["tags"], j["status"], app["bundleSha256"])
    app["status"] = j["status"]
s3 = r.session.client("s3")
if s.get("canaryDeleted"):
    try:
        s3.head_bucket(Bucket=s["canaryName"])
    except s3.exceptions.ClientError as e:
        if e.response["Error"]["Code"] not in {"404", "NoSuchBucket", "NotFound"}:
            raise
        r.state["cleanupReadback"] = {"status": "ABSENT", "requestId": e.response["ResponseMetadata"]["RequestId"]}
    else:
        raise ValueError("Deleted canary still exists")
    record("S3 disposable canary", s["canaryName"], s["canaryName"], r.tags(s["canaryName"], True), "DELETED")
r.state["resourceInventory"] = records
r.save()
print(sanitize(records))
