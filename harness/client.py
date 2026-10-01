"""IAM-authenticated managed Harness and fixed deterministic RPC transport."""
import argparse
import base64
import json
import os
import re
import tempfile
import time
import uuid
from pathlib import Path
from models import model_config


def safe(value):
    return re.sub(r"\b\d{12}\b", "<ACCOUNT_ID>", json.dumps(value, default=str))


class Client:
    def __init__(self, path):
        import boto3
        self.path = Path(path)
        self.state = json.loads(self.path.read_text())
        if self.state["region"] != "ap-southeast-1" or self.state["profile"] != "amit":
            raise ValueError("Identity configuration mismatch")
        session = boto3.Session(profile_name="amit", region_name="ap-southeast-1")
        session._session.set_config_variable("max_attempts", 1)
        identity = session.client("sts").get_caller_identity()
        if identity["Account"] != self.state["account"] or not identity["Arn"].endswith(":user/amit"):
            raise ValueError("Approved personal LAB identity mismatch")
        self.api = session.client("bedrock-agentcore")
        if "commandSessionId" not in self.state:
            self.state["commandSessionId"] = str(uuid.uuid4())
            self.journal("command-session", {"sessionId": self.state["commandSessionId"]})

    def journal(self, kind, value):
        self.state.setdefault("evidence", []).append({"kind": kind, "value": value})
        fd, name = tempfile.mkstemp(dir=self.path.parent)
        with os.fdopen(fd, "w") as f:
            os.fchmod(f.fileno(), 0o600)
            json.dump(self.state, f, default=str)
            f.flush()
            os.fsync(f.fileno())
        os.replace(name, self.path)

    def rpc(self, method, args=None):
        allowed = {"listFindings", "getFinding", "listAgents", "listCapabilities", "proposeRemediation", "decide", "execute", "getRun", "inspect_s3_ssl"}
        if method not in allowed:
            raise ValueError("Unregistered RPC method")
        if method == "proposeRemediation" and len(args or []) == 1:
            if not self.state.get("intentId"):
                raise ValueError("Stable operator intentId required before proposing")
            args = [*args, self.state["intentId"]]
        body = base64.b64encode(json.dumps({"method": method, "args": args or []}).encode()).decode()
        response = self.api.invoke_agent_runtime_command(
            agentRuntimeArn=self.state["harnessArn"], runtimeSessionId=self.state["commandSessionId"],
            body={"command": "python /app/rpc.py " + body})
        self.journal("runtime-command-request", {"method": method, "requestId": response["ResponseMetadata"]["RequestId"]})
        output, errors, exit_code = "", "", None
        for event in response["stream"]:
            chunk = event.get("chunk", {})
            delta = chunk.get("contentDelta", {})
            output += delta.get("stdout", "")
            errors += delta.get("stderr", "")
            if "contentStop" in chunk:
                exit_code = chunk["contentStop"]["exitCode"]
            if "runtimeClientError" in event:
                raise RuntimeError(safe(event["runtimeClientError"]))
        if exit_code != 0:
            raise RuntimeError("Runtime RPC failed: " + safe(errors)[-1000:])
        result = json.loads(output)
        self.journal("runtime-command-result", {"method": method, "result": result})
        return result

    def model_tool(self, model_id=None):
        config = model_config(model_id)
        selected = config["bedrockModelConfig"]["modelId"]
        # Keep pending inline-tool handoffs separate from direct command state.
        # Every bounded comparison has its own model conversation; all commands
        # retain one stable governance session on this same runtime/role.
        self.state["sessionId"] = str(uuid.uuid4())
        self.journal("model-session", {"modelId": selected, "sessionId": self.state["sessionId"]})
        tool_config = json.loads(Path(__file__).with_name("harness.json").read_text())
        messages = [{"role": "user", "content": [{"text": "Call inspect_s3_ssl once to inspect the allowlisted Issue #3 canary. If absent, report NOT_CREATED. Then explain SSL-only compliance briefly."}]}]
        used = []
        for _ in range(3):
            if sum(e["kind"] == "harness-intent" for e in self.state.get("evidence", [])) >= 18:
                raise ValueError("Bounded LAB model-invocation allowance exhausted; review budget before more calls")
            trace = uuid.uuid4().hex
            self.journal("harness-intent", {"modelId": selected, "sessionId": self.state["sessionId"], "traceId": trace})
            started = time.monotonic()
            response = self.api.invoke_harness(harnessArn=self.state["harnessArn"], runtimeSessionId=self.state["sessionId"], messages=messages, model=config, traceId=trace, tools=tool_config["tools"], allowedTools=tool_config["allowedTools"])
            self.journal("harness-invocation", {"requestId": response["ResponseMetadata"]["RequestId"], "modelId": selected, "sessionId": self.state["sessionId"], "traceId": trace})
            text, tools, usage = "", {}, {}
            for event in response["stream"]:
                errors = {k: v for k, v in event.items() if k.endswith("Exception") or k == "runtimeClientError"}
                if errors:
                    self.journal("harness-error", {"modelId": selected, "traceId": trace, "error": errors})
                    raise RuntimeError(safe(errors))
                start = event.get("contentBlockStart", {})
                if "toolUse" in start.get("start", {}):
                    tools[start["contentBlockIndex"]] = {**start["start"]["toolUse"], "inputText": ""}
                delta = event.get("contentBlockDelta", {})
                text += delta.get("delta", {}).get("text", "")  # Never collect reasoningContent.
                if "toolUse" in delta.get("delta", {}):
                    tools[delta["contentBlockIndex"]]["inputText"] += delta["delta"]["toolUse"].get("input", "")
                usage.update(event.get("metadata", {}))
            self.journal("model-output", {"modelId": selected, "text": text, "usage": usage, "latencyMs": round((time.monotonic()-started)*1000)})
            if not tools:
                if not used:
                    raise RuntimeError("Model returned no registered tool invocation; proof incomplete")
                proof = {"modelId": selected, "sessionId": self.state["sessionId"], "tools": used, "text": text, "usage": usage, "traceId": trace, "mode": "LIVE_LAB"}
                self.journal("model-proof", proof)
                return proof
            results = []
            assistant_tools = []
            for t in tools.values():
                if t["name"] != "inspect_s3_ssl" or json.loads(t["inputText"] or "{}") != {}:
                    raise ValueError("Unregistered model capability/arguments")
                self.journal("inline-tool-handoff", {k: v for k, v in t.items() if k != "inputText"})
                result = self.rpc("inspect_s3_ssl")
                used.append({"toolId": t["name"], "toolUseId": t["toolUseId"], "result": result})
                assistant_tools.append({"toolUse": {**{k: v for k, v in t.items() if k != "inputText"}, "input": {}}})
                results.append({"toolResult": {"toolUseId": t["toolUseId"], "content": [{"text": json.dumps(result)}], "status": "success"}})
            messages = [{"role": "assistant", "content": assistant_tools}, {"role": "user", "content": results}]
        raise RuntimeError("Bounded model loop exceeded")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", required=True)
    parser.add_argument("--model-tool", action="store_true")
    parser.add_argument("--model")
    parser.add_argument("--request")
    args = parser.parse_args()
    try:
        c = Client(args.state)
        if args.model_tool:
            result = c.model_tool(args.model)
        else:
            request = json.loads(args.request or "{}")
            result = c.rpc(request["method"], request.get("args"))
        print(safe(result))
    except Exception as e:
        if "c" in locals():
            c.journal("client-error", {"error": str(e)})
        print(safe({"BLOCKED": str(e)}))
        raise SystemExit(1)
