"""Bounded Issue #3 deployment, ownership ledger and sanitized evidence.

Run on Home Dell using the approved amit profile. State contains private ARNs;
only sanitized summaries may enter GitHub. Every mutation rechecks identity and
journals intent and provider-native identifiers before continuing.
"""
import argparse
import datetime
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.request
import uuid
import zipfile
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "harness"))
from models import MODELS, DEFAULT_MODEL

REGION = "ap-southeast-1"
MODEL = DEFAULT_MODEL


def sanitize(value):
    return re.sub(r"\b\d{12}\b", "<ACCOUNT_ID>", json.dumps(value, default=str))


class Run:
    def __init__(self, path, source_sha=None):
        import boto3
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        os.chmod(self.path.parent, 0o700)
        self.session = boto3.Session(profile_name="amit", region_name=REGION)
        self.session._session.set_config_variable("max_attempts", 1)
        self.sts = self.session.client("sts")
        self.state = json.loads(self.path.read_text()) if self.path.exists() else None
        identity = self.identity()
        if self.state is None:
            suffix = datetime.date.today().strftime("%Y%m%d") + "-" + uuid.uuid4().hex[:6]
            name = "agentcore2-issue3-f1-" + suffix
            self.state = {"profile": "amit", "region": REGION, "account": identity["Account"],
                          "sourceSha": source_sha, "followupId": name, "ecrName": name,
                          "roleName": name + "-runtime", "runtimeName": name.replace("-", "_"),
                          "canaryName": name + "-ssl-canary", "imageTag": name + ":f1",
                          "clientToken": str(uuid.uuid4()), "sessionId": str(uuid.uuid4()),
                          "intentId": str(uuid.uuid4()), "modelId": MODEL, "apps": {}, "journal": []}
            self.save()

    def identity(self):
        identity = self.sts.get_caller_identity()
        if not identity["Arn"].endswith(":user/amit"):
            raise ValueError("Approved IAM user class mismatch")
        if self.state and identity["Account"] != self.state["account"]:
            raise ValueError("Approved personal LAB identity mismatch")
        return identity

    def save(self):
        fd, name = tempfile.mkstemp(dir=self.path.parent)
        with os.fdopen(fd, "w") as f:
            os.fchmod(f.fileno(), 0o600)
            json.dump(self.state, f, default=str)
            f.flush()
            os.fsync(f.fileno())
        os.replace(name, self.path)

    def tags(self, name, disposable=False):
        today = datetime.date.today()
        return {"dev": "amit", "project": "agentcore2", "created": today.isoformat(),
                "tools": "cdx", "environment": "dev", "owner": "amit", "Name": name,
                "version": (self.state["sourceSha"] or "f1")[:12],
                "ttl": (today + datetime.timedelta(days=1)).isoformat(), "cleanup": "delete" if disposable else "review",
                "purpose": "Issue 3 focused live SSL proof", "phase": "F1-F5", "issue": "3",
                "followup": self.state["followupId"], "disposable": str(disposable).lower()}

    def mutate(self, operation, call, **parameters):
        self.identity()
        if self.state.get("inflight"):
            raise ValueError("Uncertain previous mutation: reconcile saved intent before retry")
        self.state["inflight"] = {"operation": operation, "parameters": parameters,
                                  "at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
        self.save()
        try:
            response = call(**parameters)
        except Exception as e:
            self.state["lastError"] = sanitize({"operation": operation, "error": str(e)})
            self.save()
            raise
        self.state["journal"].append({**self.state.pop("inflight"), "response": response})
        self.save()
        return response

    def reconcile_role_rejection(self):
        """Retire only a known provider validation rejection after absence proof."""
        pending = self.state.get("inflight", {})
        if pending.get("operation") != "iam.create_role" or "Duplicate tag keys" not in self.state.get("lastError", ""):
            raise ValueError("No matching definitive role validation rejection")
        c = self.session.client("iam")
        try:
            c.get_role(RoleName=self.state["roleName"])
        except c.exceptions.NoSuchEntityException as e:
            self.state["journal"].append({**self.state.pop("inflight"), "reconciliation": "InvalidInput; GetRole proves absent", "requestId": e.response["ResponseMetadata"]["RequestId"]})
            self.state.pop("lastError", None)
            self.save()
            return {"role": "absent", "safeRetry": True}
        raise ValueError("Role exists; manual reconciliation required")

    def ecr(self):
        self.model_preflight()
        c = self.session.client("ecr")
        name = self.state["ecrName"]
        if "repository" in self.state:
            return self.state["repository"]
        try:
            c.describe_repositories(repositoryNames=[name])
        except c.exceptions.RepositoryNotFoundException:
            pass
        else:
            raise ValueError("ECR name collision; pre-existing repositories are off limits")
        r = self.mutate("ecr.create_repository", c.create_repository, repositoryName=name,
                        imageTagMutability="IMMUTABLE", encryptionConfiguration={"encryptionType": "AES256"},
                        tags=[{"Key": k, "Value": v} for k, v in self.tags(name).items()])
        self.state["repository"] = r["repository"]
        self.save()
        return r["repository"]

    def model_preflight(self):
        c = self.session.client("bedrock")
        results = {}
        for model in MODELS:
            availability = c.get_foundation_model_availability(modelId=model.split(".", 1)[1])
            profile = c.get_inference_profile(inferenceProfileIdentifier=model)
            results[model] = {"availability": {k: v for k, v in availability.items() if k != "ResponseMetadata"},
                              "profileArn": profile["inferenceProfileArn"], "models": profile["models"]}
            if (availability.get("agreementAvailability", {}).get("status") != "AVAILABLE"
                or availability.get("authorizationStatus") != "AUTHORIZED"
                or availability.get("entitlementAvailability") != "AVAILABLE"
                or availability.get("regionAvailability") != "AVAILABLE" or profile["status"] != "ACTIVE"):
                raise ValueError("Approved Nova access preflight failed; no agreement or identity permission changes authorized")
        self.state["modelAvailability"] = results
        self.save()
        return results

    def image(self):
        c = self.session.client("ecr")
        repo = self.state["repository"]
        if self.state.get("imageDigest"):
            return {"imageDigest": self.state["imageDigest"]}
        try:
            c.describe_images(repositoryName=self.state["ecrName"], imageIds=[{"imageTag": "f1"}])
        except c.exceptions.ImageNotFoundException:
            pass
        else:
            raise ValueError("Existing image with no ledger digest; reconcile before push")
        uri = repo["repositoryUri"] + ":f1"
        config = self.path.parent / "docker-auth"
        config.mkdir(mode=0o700, exist_ok=True)
        auth = c.get_authorization_token()["authorizationData"][0]
        import base64
        password = base64.b64decode(auth["authorizationToken"]).decode().split(":", 1)[1]
        docker = ["docker", "--config", str(config)]
        def command(args, data=None):
            result = subprocess.run([*docker, *args], input=data, capture_output=True, text=True)
            if result.returncode:
                raise RuntimeError(sanitize(result.stderr)[-1000:])
        try:
            command(["login", "--username", "AWS", "--password-stdin", repo["repositoryUri"].split("/")[0]], password)
            command(["tag", self.state["imageTag"], uri])
            self.identity()
            self.state["inflight"] = {"operation": "docker.push", "imageUri": uri}
            self.save()
            command(["push", uri])
            image = c.describe_images(repositoryName=self.state["ecrName"], imageIds=[{"imageTag": "f1"}])["imageDetails"][0]
            self.state["imageDigest"], self.state["imageUri"] = image["imageDigest"], uri
            self.state["journal"].append({**self.state.pop("inflight"), "digest": image["imageDigest"]})
            self.save()
            return image
        finally:
            # Remove exactly the authentication file this task created; never ~/.docker.
            auth_file = config / "config.json"
            if auth_file.exists():
                auth_file.unlink()

    def role(self):
        profiles = self.model_preflight()
        c = self.session.client("iam")
        name = self.state["roleName"]
        account = self.state["account"]
        if "role" not in self.state:
            try:
                c.get_role(RoleName=name)
            except c.exceptions.NoSuchEntityException:
                pass
            else:
                raise ValueError("IAM role collision; existing identities are off limits")
            trust = {"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": {"Service": "bedrock-agentcore.amazonaws.com"},
                     "Action": "sts:AssumeRole", "Condition": {"StringEquals": {"aws:SourceAccount": account},
                     "ArnLike": {"aws:SourceArn": f"arn:aws:bedrock-agentcore:{REGION}:{account}:*"}}}]}
            r = self.mutate("iam.create_role", c.create_role, RoleName=name, AssumeRolePolicyDocument=json.dumps(trust),
                            Tags=[{"Key": k, "Value": v} for k, v in self.tags(name).items()])
            self.state["role"] = r["Role"]
            self.save()
        actual = c.get_role(RoleName=name)["Role"]
        if {t["Key"]: t["Value"] for t in actual.get("Tags", [])}.get("followup") != self.state["followupId"]:
            raise ValueError("New role ownership mismatch")
        if self.state.get("rolePolicyCreated"):
            return self.state["role"]
        log = f"arn:aws:logs:{REGION}:{account}:log-group:/aws/bedrock-agentcore/runtimes/{self.state['runtimeName']}*"
        policy = {"Version": "2012-10-17", "Statement": [
            {"Effect": "Allow", "Action": ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"], "Resource": self.state["repository"]["repositoryArn"]},
            {"Effect": "Allow", "Action": "ecr:GetAuthorizationToken", "Resource": "*"},
            {"Effect": "Allow", "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"], "Resource": [p["profileArn"] for p in profiles.values()]},
            {"Effect": "Allow", "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"], "Resource": sorted({m["modelArn"] for p in profiles.values() for m in p["models"]}), "Condition": {"StringEquals": {"bedrock:InferenceProfileArn": [p["profileArn"] for p in profiles.values()]}}},
            {"Effect": "Allow", "Action": ["s3:GetBucketPolicy", "s3:GetBucketTagging", "s3:PutBucketPolicy", "s3:GetBucketPublicAccessBlock"], "Resource": "arn:aws:s3:::" + self.state["canaryName"]},
            {"Effect": "Allow", "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"], "Resource": [log, log + ":*"]},
        ]}
        self.mutate("iam.put_role_policy", c.put_role_policy, RoleName=name, PolicyName="Issue3ExactRuntime", PolicyDocument=json.dumps(policy))
        self.state["rolePolicyCreated"] = True
        self.save()
        return self.state["role"]

    def runtime(self, source):
        self.model_preflight()
        c = self.session.client("bedrock-agentcore-control")
        if self.state.get("harnessId"):
            return c.get_harness(harnessId=self.state["harnessId"])
        for page in c.get_paginator("list_harnesses").paginate():
            if any(h.get("harnessName") == self.state["runtimeName"] for h in page.get("harnesses", [])):
                raise ValueError("Harness name collision; pre-existing runtimes are off limits")
        params = json.loads(Path(source).read_text())
        params.update(harnessName=self.state["runtimeName"], executionRoleArn=self.state["role"]["Arn"],
                      clientToken=self.state["clientToken"], environmentArtifact={"containerConfiguration": {"containerUri": self.state["imageUri"]}},
                      environment={"agentCoreRuntimeEnvironment": {"lifecycleConfiguration": {"idleRuntimeSessionTimeout": 60, "maxLifetime": 1800},
                         "networkConfiguration": {"networkMode": "PUBLIC"}, "filesystemConfigurations": [{"sessionStorage": {"mountPath": "/mnt/state"}}]}},
                      environmentVariables={"CANARY_BUCKET": self.state["canaryName"], "FOLLOWUP_ID": self.state["followupId"], "AWS_REGION": REGION, "STATE_PATH": "/mnt/state/backend.json"},
                      maxIterations=3, maxTokens=1000, timeoutSeconds=60, tags=self.tags(self.state["runtimeName"]))
        r = self.mutate("agentcore.create_harness", c.create_harness, **params)
        self.state["harnessId"] = r["harness"]["harnessId"]
        self.state["harnessArn"] = r["harness"]["arn"]
        self.save()
        return r

    def wait(self):
        c = self.session.client("bedrock-agentcore-control")
        r = c.get_harness(harnessId=self.state["harnessId"])
        self.state["harnessReadback"] = r
        self.save()
        return {"id": self.state["harnessId"], "status": r["harness"].get("status"), "failureReason": r["harness"].get("failureReason")}

    def preview(self, label, bundle):
        if label not in ("a", "b", "c"):
            raise ValueError("Only Preview A/B/C")
        c = self.session.client("amplify")
        apps = self.state["apps"]
        if label not in apps:
            name = self.state["followupId"] + "-preview-" + label
            if any(a["name"] == name for page in c.get_paginator("list_apps").paginate() for a in page["apps"]):
                raise ValueError("Amplify name collision")
            r = self.mutate("amplify.create_app", c.create_app, name=name, platform="WEB", tags=self.tags(name))
            apps[label] = {"appId": r["app"]["appId"], "name": name, "url": "https://main." + r["app"]["defaultDomain"]}
            self.save()
        app = apps[label]
        if not app.get("branchCreated"):
            self.mutate("amplify.create_branch", c.create_branch, appId=app["appId"], branchName="main", stage="DEVELOPMENT", enableAutoBuild=False)
            app["branchCreated"] = True
            self.save()
        if not app.get("jobId"):
            r = self.mutate("amplify.create_deployment", c.create_deployment, appId=app["appId"], branchName="main")
            app["jobId"], app["uploadUrl"] = r["jobId"], r["zipUploadUrl"]
            self.save()
        if not app.get("uploaded"):
            self.identity()
            data = Path(bundle).read_bytes()
            self.state["inflight"] = {"operation": "amplify.zip_upload", "appId": app["appId"], "jobId": app["jobId"]}
            self.save()
            with urllib.request.urlopen(urllib.request.Request(app["uploadUrl"], data=data, method="PUT")) as r:
                self.state["journal"].append({**self.state.pop("inflight"), "requestId": r.headers.get("x-amz-request-id"), "status": r.status})
            import hashlib
            app["bundleSha256"] = hashlib.sha256(data).hexdigest()
            app["uploaded"] = True
            self.save()
        if not app.get("started"):
            self.mutate("amplify.start_deployment", c.start_deployment, appId=app["appId"], branchName="main", jobId=app["jobId"])
            app["started"] = True
            app.pop("uploadUrl", None)
            self.save()
        result = c.get_job(appId=app["appId"], branchName="main", jobId=app["jobId"])["job"]["summary"]
        app["status"] = result["status"]
        self.save()
        return {k: v for k, v in app.items() if k != "uploadUrl"}

    def canary(self):
        c = self.session.client("s3")
        name = self.state["canaryName"]
        if not self.state.get("canaryCreated"):
            try:
                c.head_bucket(Bucket=name)
            except Exception as e:
                if getattr(e, "response", {}).get("Error", {}).get("Code") not in ("404", "NoSuchBucket", "NotFound"):
                    raise
            else:
                raise ValueError("S3 name collision; existing buckets are off limits")
            self.mutate("s3.create_bucket", c.create_bucket, Bucket=name, CreateBucketConfiguration={"LocationConstraint": REGION})
            self.state["canaryCreated"] = True
            self.save()
        if not self.state.get("canaryTagged"):
            self.mutate("s3.put_bucket_tagging", c.put_bucket_tagging, Bucket=name,
                        Tagging={"TagSet": [{"Key": k, "Value": v} for k, v in self.tags(name, True).items()]})
            self.state["canaryTagged"] = True
            self.save()
        if not self.state.get("canaryProtected"):
            self.mutate("s3.put_public_access_block", c.put_public_access_block, Bucket=name,
                        PublicAccessBlockConfiguration={k: True for k in ("BlockPublicAcls", "IgnorePublicAcls", "BlockPublicPolicy", "RestrictPublicBuckets")})
            self.state["canaryProtected"] = True
            self.save()
        return {"bucket": name, "tags": self.tags(name, True), "publicAccessBlock": c.get_public_access_block(Bucket=name)["PublicAccessBlockConfiguration"]}

    def cleanup(self):
        if not self.state.get("canaryCreated") or self.state.get("canaryDeleted"):
            return {"canary": "not-created-or-already-deleted"}
        c = self.session.client("s3")
        name = self.state["canaryName"]
        tags = {t["Key"]: t["Value"] for t in c.get_bucket_tagging(Bucket=name)["TagSet"]}
        if tags.get("followup") != self.state["followupId"] or tags.get("disposable") != "true":
            raise ValueError("Cleanup ownership/disposable mismatch")
        if c.list_objects_v2(Bucket=name).get("KeyCount", 0):
            raise ValueError("Unexpected canary objects; stop before destructive cleanup")
        self.mutate("s3.delete_bucket", c.delete_bucket, Bucket=name)
        self.state["canaryDeleted"] = True
        self.save()
        return {"bucket": name, "deleted": True}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=["init", "ecr", "image", "role", "reconcile_role_rejection", "runtime", "wait", "preview", "canary", "cleanup", "summary"])
    parser.add_argument("--state", required=True)
    parser.add_argument("--source-sha")
    parser.add_argument("--source", default="harness/harness.json")
    parser.add_argument("--label")
    parser.add_argument("--bundle")
    args = parser.parse_args()
    try:
        run = Run(args.state, args.source_sha)
        if args.stage == "init":
            result = {"identity": "approved personal LAB user validated locally", "followup": run.state["followupId"], "localImage": run.state["imageTag"]}
        elif args.stage == "runtime":
            result = run.runtime(args.source)
        elif args.stage == "preview":
            result = run.preview(args.label, args.bundle)
        elif args.stage == "summary":
            result = {k: run.state.get(k) for k in ("followupId", "sourceSha", "ecrName", "imageDigest", "roleName", "harnessId", "harnessArn", "sessionId", "modelId", "canaryName", "canaryDeleted", "apps", "lastError")}
        else:
            result = getattr(run, args.stage)()
        print(sanitize(result))
    except Exception as error:
        print(sanitize({"BLOCKED": str(error)}))
        raise SystemExit(1)
