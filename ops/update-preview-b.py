"""Update ONLY the existing Issue #3 Preview B; journal IDs before retries.

No app/branch/runtime creation. An uncertain mutation remains blocked.
"""
import argparse
import hashlib
import json
import urllib.request
import zipfile
from pathlib import Path
from followup import Run


def update(run, bundle, sha):
    app = run.state["apps"]["b"]
    if app["appId"] != "d2rar4n3w1jdwz" or not app.get("branchCreated"):
        raise ValueError("Existing Preview B identity mismatch")
    c = run.session.client("amplify")
    remote = c.get_app(appId=app["appId"])["app"]
    tags = remote.get("tags", {})
    if remote["name"] != app["name"] or any(tags.get(k) != v for k, v in {
        "project": "agentcore2", "issue": "3", "followup": run.state["followupId"]}.items()):
        raise ValueError("Preview B ownership mismatch")
    if "https://main." + remote["defaultDomain"] != app["url"]:
        raise ValueError("Preview B domain mismatch")
    c.get_branch(appId=app["appId"], branchName="main")
    with zipfile.ZipFile(bundle) as archive:
        marker = json.loads(archive.read("revision.json"))
    if marker["sourceSha"] != sha or marker["preview"] != "b":
        raise ValueError("Bundle source/revision mismatch")
    data = Path(bundle).read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    updates = run.state.setdefault("previewBUpdates", {})
    entry = updates.setdefault(sha, {"sourceSha": sha, "bundleSha256": digest})
    if entry["bundleSha256"] != digest:
        raise ValueError("Same source revision has different bundle; do not duplicate deployment")
    if run.state.get("inflight"):
        raise ValueError("Uncertain prior mutation; reconcile private journal and provider job before retry")
    if not entry.get("jobId"):
        jobs = c.list_jobs(appId=app["appId"], branchName="main", maxResults=10)["jobSummaries"]
        if any(j["status"] in ("CREATED", "PENDING", "PROVISIONING", "RUNNING", "CANCELLING") for j in jobs):
            raise ValueError("Existing Preview B deployment active; no competing deployment")
        response = run.mutate("previewB.create_deployment", c.create_deployment,
                              appId=app["appId"], branchName="main")
        entry.update(jobId=response["jobId"], uploadUrl=response["zipUploadUrl"])
        run.save()
    if not entry.get("uploaded"):
        run.identity()
        run.state["inflight"] = {"operation": "previewB.zip_upload", "jobId": entry["jobId"],
                                 "sourceSha": sha, "bundleSha256": digest}
        run.save()
        with urllib.request.urlopen(urllib.request.Request(entry["uploadUrl"], data=data, method="PUT"), timeout=60) as response:
            run.state["journal"].append({**run.state.pop("inflight"), "status": response.status,
                "requestId": response.headers.get("x-amz-request-id")})
        entry["uploaded"] = True
        run.save()
    if not entry.get("started"):
        run.mutate("previewB.start_deployment", c.start_deployment,
                   appId=app["appId"], branchName="main", jobId=entry["jobId"])
        entry["started"] = True
        entry.pop("uploadUrl", None)
        run.save()
    summary = c.get_job(appId=app["appId"], branchName="main", jobId=entry["jobId"])["job"]["summary"]
    entry["status"] = summary["status"]
    run.save()
    return {"appId": app["appId"], "url": app["url"], **{k:v for k,v in entry.items() if k != "uploadUrl"}}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", required=True)
    parser.add_argument("--bundle", required=True)
    parser.add_argument("--source-sha", required=True)
    args = parser.parse_args()
    if not Path(args.state).is_file():
        raise SystemExit("Existing private follow-up state required; cannot initialize resources")
    run = Run(args.state)
    print(json.dumps(update(run, args.bundle, args.source_sha)))
