"""Fixed command invoked through IAM-authenticated InvokeAgentRuntimeCommand."""
import base64
import json
import re
import sys
from service import locked_dispatch

if __name__ == "__main__":
    request = json.loads(base64.b64decode(sys.argv[1]))
    result = locked_dispatch(request)
    print(re.sub(r"\b\d{12}\b", "<ACCOUNT_ID>", json.dumps(result)))
