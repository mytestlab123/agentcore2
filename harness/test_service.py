import json
import tempfile
import unittest
from pathlib import Path
from service import Backend, ssl_policy


class Error(Exception):
    def __init__(self, code):
        self.response = {"Error": {"Code": code}, "ResponseMetadata": {"RequestId": "request-missing"}}


class S3:
    def __init__(self):
        self.policy = None
        self.writes = 0
        self.tags = {"project": "agentcore2", "issue": "3", "followup": "test", "disposable": "true"}

    def get_bucket_tagging(self, **kw):
        return {"TagSet": [{"Key": k, "Value": v} for k, v in self.tags.items()]}

    def get_bucket_policy(self, **kw):
        if self.policy is None:
            raise Error("NoSuchBucketPolicy")
        return {"Policy": json.dumps(self.policy), "ResponseMetadata": {"RequestId": "request-read"}}

    def put_bucket_policy(self, **kw):
        self.writes += 1
        self.policy = json.loads(kw["Policy"])
        return {"ResponseMetadata": {"RequestId": "request-write"}}


class Governance(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.s3 = S3()
        self.b = Backend(self.s3, "agentcore2-issue3-test", Path(self.temp.name)/"state.json", "test")
        self.intent = 0

    def proposal(self):
        self.intent += 1
        return self.b.dispatch("proposeRemediation", ["issue3-ssl-canary", f"intent-{self.intent}"])["proposalId"]

    def test_lost_proposal_response_replays_same_intent(self):
        args = ["issue3-ssl-canary", "stable-intent"]
        first = self.b.dispatch("proposeRemediation", args)
        resumed = Backend(self.s3, self.b.bucket, self.b.path, "test")
        self.assertEqual(first, resumed.dispatch("proposeRemediation", args))

    def test_reject_and_missing_decision_write_nothing(self):
        for decision in [None, "REJECT"]:
            p = self.proposal()
            if decision:
                self.b.dispatch("decide", [p, decision, "test-operator"])
            self.assertEqual(self.b.dispatch("execute", [p])["state"], "REJECTED")
        self.assertEqual(self.s3.writes, 0)

    def test_approved_exact_target_is_once_and_resumable(self):
        p = self.proposal()
        self.b.dispatch("decide", [p, "APPROVE_ONCE", "test-operator"])
        r = self.b.dispatch("execute", [p])
        self.assertEqual(r["state"], "VERIFIED")
        self.assertEqual([e["kind"] for e in r["evidence"]][-2:], ["PROVIDER_READBACK", "COMPLIANCE_READBACK"])
        resumed = Backend(self.s3, self.b.bucket, self.b.path, "test")
        self.assertEqual(resumed.dispatch("execute", [p])["runId"], r["runId"])
        self.assertEqual(self.s3.writes, 1)

    def test_unauthorized_target_and_changed_tags_write_nothing(self):
        p = self.proposal()
        self.b.dispatch("decide", [p, "APPROVE_ONCE", "test-operator"])
        self.b.state["proposals"][p]["target"]["id"] = "unrelated-bucket"
        self.assertEqual(self.b.dispatch("execute", [p])["state"], "REJECTED")
        p = self.proposal()
        self.b.dispatch("decide", [p, "APPROVE_ONCE", "test-operator"])
        self.s3.tags["followup"] = "other-owner"
        with self.assertRaises(ValueError):
            self.b.dispatch("execute", [p])
        self.assertEqual(self.s3.writes, 0)

    def test_policy_drift_fails_before_write(self):
        p = self.proposal()
        self.b.dispatch("decide", [p, "APPROVE_ONCE", "test-operator"])
        self.s3.policy = ssl_policy(self.b.bucket)
        with self.assertRaises(ValueError):
            self.b.dispatch("execute", [p])
        self.assertEqual(self.s3.writes, 0)

    def test_new_intent_on_compliant_canary_is_read_only(self):
        self.s3.policy = ssl_policy(self.b.bucket)
        p = self.proposal()
        self.b.dispatch("decide", [p, "APPROVE_ONCE", "test-operator"])
        result = self.b.dispatch("execute", [p])
        self.assertEqual(result["state"], "VERIFIED")
        self.assertNotIn("providerExecutionId", result)
        self.assertEqual(self.s3.writes, 0)

    def test_uncertain_provider_failure_is_not_blindly_retried(self):
        p = self.proposal()
        self.b.dispatch("decide", [p, "APPROVE_ONCE", "test-operator"])
        def fail(**kw):
            self.s3.writes += 1
            raise RuntimeError("response lost")
        self.s3.put_bucket_policy = fail
        with self.assertRaises(RuntimeError):
            self.b.dispatch("execute", [p])
        with self.assertRaises(ValueError):
            self.b.dispatch("execute", [p])
        self.assertEqual(self.s3.writes, 1)
