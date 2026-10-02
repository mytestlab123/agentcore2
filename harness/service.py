"""Deterministic implementation of the existing ComplianceBackend JSON contract.

The managed AgentCore Harness supplies the model loop. Its registered inline
inspection tool can call this service; it cannot approve or execute remediation.
Only the authenticated operator transport calls the decision/execute methods.
"""
import hashlib
import json
import os
import tempfile
import uuid
import fcntl
from datetime import datetime, timezone
from pathlib import Path


def now():
    return datetime.now(timezone.utc).isoformat()


def ssl_policy(bucket):
    return {"Version": "2012-10-17", "Statement": [{
        "Sid": "Issue3DenyInsecureTransport", "Effect": "Deny", "Principal": "*",
        "Action": "s3:*", "Resource": [f"arn:aws:s3:::{bucket}", f"arn:aws:s3:::{bucket}/*"],
        "Condition": {"Bool": {"aws:SecureTransport": "false"}},
    }]}


def complies(policy, bucket):
    expected = ssl_policy(bucket)["Statement"][0]
    # Require the full deny, not merely a similarly named statement.
    return any(all(s.get(k) == v for k, v in expected.items() if k != "Sid")
               for s in policy.get("Statement", []))


def fingerprint(policy):
    return hashlib.sha256(json.dumps(policy, sort_keys=True).encode()).hexdigest()


class Backend:
    capability = "s3-ssl-enforce"

    def __init__(self, s3, bucket, state_path, followup):
        if not bucket.startswith("agentcore2-issue3-") or not followup:
            raise ValueError("Exact Issue #3 target and follow-up identity required")
        self.s3, self.bucket, self.path, self.followup = s3, bucket, Path(state_path), followup
        self.state = json.loads(self.path.read_text()) if self.path.exists() else {
            "proposals": {}, "decisions": {}, "runs": {}, "proposalRuns": {}}

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, name = tempfile.mkstemp(dir=self.path.parent)
        try:
            os.fchmod(fd, 0o600)
            with os.fdopen(fd, "w") as f:
                json.dump(self.state, f)
                f.flush()
                os.fsync(f.fileno())
            os.replace(name, self.path)
        finally:
            if os.path.exists(name):
                os.unlink(name)

    def policy(self):
        try:
            response = self.s3.get_bucket_policy(Bucket=self.bucket)
            return json.loads(response["Policy"]), response["ResponseMetadata"]["RequestId"]
        except Exception as e:
            if getattr(e, "response", {}).get("Error", {}).get("Code") == "NoSuchBucketPolicy":
                return {}, e.response.get("ResponseMetadata", {}).get("RequestId")
            raise

    def ownership(self):
        response = self.s3.get_bucket_tagging(Bucket=self.bucket)
        tags = {t["Key"]: t["Value"] for t in response["TagSet"]}
        if any(tags.get(k) != v for k, v in {
            "project": "agentcore2", "issue": "3", "followup": self.followup,
            "disposable": "true"}.items()):
            raise ValueError("Target ownership check failed")
        return tags

    def finding(self):
        self.ownership()
        policy, _ = self.policy()
        return {"id": "issue3-ssl-canary", "ruleId": "s3-bucket-ssl-requests-only",
                "title": "Require TLS for the Issue #3 canary", "description": "Deny non-TLS S3 requests",
                "severity": "HIGH", "status": "COMPLIANT" if complies(policy, self.bucket) else "NON_COMPLIANT",
                "resource": {"id": self.bucket, "type": "AWS::S3::Bucket", "region": "ap-southeast-1",
                             "accountId": "<ACCOUNT_ID>", "name": self.bucket},
                "firstObservedAt": now(), "lastObservedAt": now(), "remediationCapabilityId": self.capability}

    def dispatch(self, method, args):
        if method == "listAgents":
            return [{"id": "issue3-s3-specialist", "name": "Issue #3 managed Harness S3 specialist",
                     "domain": "s3-ssl", "description": "Read-only registered inspection; deterministic approved fix",
                     "readiness": "HARNESS_DEPLOYED", "capabilityIds": [self.capability]}]
        if method == "listCapabilities":
            return [{"id": self.capability, "title": "Enforce TLS", "description": "Add the exact SSL-only deny",
                     "appliesToResourceType": "AWS::S3::Bucket", "requiresApproval": True, "executor": "aws-api"}]
        if method == "inspect_s3_ssl":
            try:
                return self.finding()
            except Exception as e:
                if getattr(e, "response", {}).get("Error", {}).get("Code") == "NoSuchBucket":
                    return {"bucket": self.bucket, "status": "NOT_CREATED", "writes": 0}
                raise
        if method in ("listFindings", "getFinding"):
            f = self.finding()
            if method == "getFinding":
                return f if args[0] == f["id"] else None
            q = args[0] if args else {}
            q = q or {}
            if any(q.get(k) and q[k] != f[v] for k, v in [("status", "status"), ("severity", "severity"), ("ruleId", "ruleId")]):
                return []
            if q.get("resourceType") and q["resourceType"] != f["resource"]["type"]:
                return []
            if q.get("search") and q["search"].lower() not in (f["title"] + self.bucket).lower():
                return []
            return [f]
        if method == "getRun":
            return self.state["runs"].get(args[0])
        if method == "proposeRemediation":
            if len(args) != 2 or not isinstance(args[1], str) or not args[1]:
                raise ValueError("Stable caller intent key required")
            f = self.finding()
            if args[0] != f["id"]:
                raise ValueError("Unregistered target")
            proposal_id = str(uuid.uuid5(uuid.NAMESPACE_URL, self.followup + ":" + args[1] + ":" + f["id"]))
            if proposal_id in self.state["proposals"]:
                return self.state["proposals"][proposal_id]
            before, _ = self.policy()
            if before.get("Statement") and not complies(before, self.bucket):
                raise ValueError("Unexpected canary policy; refusing to replace existing statements")
            p = {"proposalId": proposal_id, "findingId": f["id"], "capabilityId": self.capability,
                 "target": f["resource"], "summary": "Deny non-TLS requests to this exact disposable canary",
                 "expectedChange": {"policy": ssl_policy(self.bucket), "beforeSha256": fingerprint(before)},
                 "requiresApproval": True, "createdAt": now()}
            self.state["proposals"][p["proposalId"]] = p
            self.save()
            return p
        if method == "decide":
            proposal, decision, actor = args
            if proposal not in self.state["proposals"] or decision not in ("APPROVE_ONCE", "REJECT") or not actor:
                raise ValueError("Invalid exact proposal/decision/actor")
            if proposal in self.state["decisions"]:
                raise ValueError("Decision already consumed or recorded")
            a = {"proposalId": proposal, "decision": decision, "actorClass": actor, "decidedAt": now()}
            self.state["decisions"][proposal] = a
            self.save()
            return a
        if method != "execute":
            raise ValueError("Unregistered method")
        proposal_id = args[0]
        if proposal_id in self.state["proposalRuns"]:
            run = self.state["runs"][self.state["proposalRuns"][proposal_id]]
            if run["state"] == "RUNNING":
                raise ValueError("Uncertain prior write; reconcile provider evidence before retry")
            return run
        p = self.state["proposals"][proposal_id]
        a = self.state["decisions"].get(proposal_id)
        r = {"runId": str(uuid.uuid4()), "proposalId": proposal_id, "findingId": p["findingId"],
             "state": "REJECTED", "mode": "LIVE_LAB", "startedAt": now(), "evidence": [
                 {"kind": "PROPOSAL", "at": now(), "mode": "LIVE_LAB", "summary": p["summary"]},
                 {"kind": "APPROVAL", "at": now(), "mode": "LIVE_LAB", "summary": a["decision"] if a else "NO_DECISION"}]}
        self.state["proposalRuns"][proposal_id] = r["runId"]
        self.state["runs"][r["runId"]] = r
        if not a or a["decision"] != "APPROVE_ONCE" or p["target"]["id"] != self.bucket or p["capabilityId"] != self.capability:
            r["finishedAt"] = now()
            self.save()
            return r
        # Fail closed before touching any provider state if tags/region/drift mismatch.
        self.ownership()
        before, _ = self.policy()
        if fingerprint(before) != p["expectedChange"]["beforeSha256"]:
            raise ValueError("Provider policy drift since approval")
        if complies(before, self.bucket):
            # A new operator channel may verify an already converged target;
            # this is a read-only result, not a second provider execution.
            policy, request_id = self.policy()
            r["evidence"].append({"kind": "PROVIDER_READBACK", "at": now(), "mode": "LIVE_LAB",
                                  "summary": "Already compliant; no mutation", "detail": {"requestId": request_id}})
            observed, request_id = self.policy()
            r["evidence"].append({"kind": "COMPLIANCE_READBACK", "at": now(), "mode": "LIVE_LAB",
                                  "summary": "Independent SSL-only evaluator; not AWS Config",
                                  "detail": {"requestId": request_id, "status": "COMPLIANT" if complies(observed, self.bucket) else "NON_COMPLIANT"}})
            r["state"] = "VERIFIED" if complies(observed, self.bucket) else "FAILED"
            r["finishedAt"] = now()
            self.save()
            return r
        r["state"] = "RUNNING"
        self.save()  # Journal the intent BEFORE the provider mutation.
        response = self.s3.put_bucket_policy(Bucket=self.bucket, Policy=json.dumps(ssl_policy(self.bucket)))
        r["providerExecutionId"] = response["ResponseMetadata"]["RequestId"]
        r["evidence"].append({"kind": "EXECUTION", "at": now(), "mode": "LIVE_LAB", "summary": "PutBucketPolicy",
                              "detail": {"requestId": r["providerExecutionId"]}})
        self.save()  # Persist native request ID before any readback/retry.
        policy, request_id = self.policy()
        r["evidence"].append({"kind": "PROVIDER_READBACK", "at": now(), "mode": "LIVE_LAB", "summary": "GetBucketPolicy",
                              "detail": {"requestId": request_id, "policySha256": fingerprint(policy)}})
        # Separate fresh read and deterministic control evaluation, not an AWS Config claim.
        observed, request_id = self.policy()
        compliant = complies(observed, self.bucket)
        r["evidence"].append({"kind": "COMPLIANCE_READBACK", "at": now(), "mode": "LIVE_LAB",
                              "summary": "Independent SSL-only evaluator; AWS Config is not provisioned",
                              "detail": {"requestId": request_id, "status": "COMPLIANT" if compliant else "NON_COMPLIANT"}})
        r["state"], r["finishedAt"] = ("VERIFIED" if compliant else "FAILED"), now()
        self.save()
        return r


def backend():
    import boto3
    if os.environ.get("AWS_REGION", "ap-southeast-1") != "ap-southeast-1":
        raise ValueError("Region mismatch")
    missing = [name for name in ("CANARY_BUCKET", "FOLLOWUP_ID") if not os.environ.get(name)]
    if missing:
        raise ValueError("Missing runtime configuration: " + ", ".join(missing))
    return Backend(boto3.client("s3", region_name="ap-southeast-1"), os.environ["CANARY_BUCKET"],
                   os.environ.get("STATE_PATH", "/mnt/state/backend.json"), os.environ["FOLLOWUP_ID"])


def locked_dispatch(request):
    state = Path(os.environ.get("STATE_PATH", "/mnt/state/backend.json"))
    state.parent.mkdir(parents=True, exist_ok=True)
    with open(str(state) + ".lock", "a") as lock:
        os.chmod(lock.name, 0o600)
        fcntl.flock(lock, fcntl.LOCK_EX)
        return backend().dispatch(request["method"], request.get("args", []))
