# Preview B v1.1 — Contextual Copilot

Authority: [G milestone approval](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5928077026).
X/core2 is the sole implementer. PR #5 remains draft/open/unmerged. Kiro is
review-only. No new app, runtime, canary or remediation is part of this slice.

## UX contract

- Light/dark theme uses one set of tokens. Only `preview-b-theme` is stored in
  localStorage; blocked storage does not prevent using the toggle.
- Fixability is `AUTOMATED` only for `NON_COMPLIANT` plus a nonempty
  `remediationCapabilityId`; all other findings are `MANUAL`. This indicates a
  registered path, not permission to execute or a promise that remediation
  succeeds. All / Automated / Manual combines with status and search.
- The contextual summary comes from the selected finding, capability catalogue,
  exact backend proposal and current-view run. Unknown capability names and
  missing runs are explicitly marked; it does not invent historical runs.
- The five-step timeline renders `run.evidence` by kind. Missing entries stay
  absent. `MOCK`, `RECORDED`, and `LIVE_LAB` evidence are labelled. Provider
  readback and compliance result remain separate. Mock approval/rejection
  browser checks make no AWS calls.
- Existing three Nova choices and dated input-cost labels are unchanged. No
  CopilotKit or Cloudscape dependency was added.

## Windows demo — private SSH transport

Use the existing `home` SSH alias in the same environment running the helper.
Open an **unrecorded owner terminal**: disable PowerShell transcripts, shell
recording and terminal capture. Do not redirect helper output or paste the token
into GitHub. The token is unrelated to AWS credentials and is never stored in
the browser.

The helper needs Python 3 and OpenSSH; no pip packages are required locally.
Set these variables to the existing Dell private state and the directory
containing this milestone's bridge source. Keep actual private paths local:

```powershell
$DellRoot = "<Dell directory containing current harness/bridge.py>"
$DellState = "<existing Dell owner-private state.json>"
$DellPython = "<Dell Python with the existing Harness SDK>"
py ops/windows-bridge.py --root $DellRoot --state $DellState --python $DellPython --tunnel
```

If Python/OpenSSH are managed in WSL, run the same helper with `python3` in
that WSL terminal; do not copy AWS credentials or private keys to Windows.

The helper generates 32 cryptographic random bytes on Dell, exclusively creates
an owner-private `windows-demo-token` beside the private state, prints the token
once, prints the bridge-start command, and optionally starts the tunnel. In a
**second terminal**, execute the printed bridge-start command and keep it open.
It refuses an existing token file or occupied Dell bridge port rather than
replacing another session's token. A failed/uncertain token preparation must
be inspected on Dell before another attempt.

The tunnel is:

```text
ssh -o ExitOnForwardFailure=yes -N -L 127.0.0.1:8443:127.0.0.1:8703 home
```

Open Preview B, leave Bridge URL as `http://127.0.0.1:8443`, paste the token and
connect. Grant the browser's local-network permission for this exact preview
if requested. The tunnel encrypts traffic between Windows and Dell; the bridge
binds only Dell loopback. Do not substitute plaintext LAN HTTP or disable browser
security. Configurable HTTP URLs are limited to `127.0.0.1`; HTTPS is supported
for a separately trusted setup, but the bridge still rejects unregistered hosts.

Exact allowed Host values are `127.0.0.1:8703` and `127.0.0.1:8443`; the latter is
preserved by SSH forwarding. Exact preview origin, strong bearer token and
server-owned model allowlist remain mandatory. Preflight enforces the host too.

Close the foreground bridge and tunnel with Ctrl+C after the demo. Remove only
the exact token file this invocation created, after verifying its bridge has
stopped; never remove another session's state or token. A deleted canary from
F4 is not recreated: authenticating a connection does not imply live findings
or a new remediation proof.

## Validation / bounded deployment

```text
npm run build
npm test
npm run typecheck
PLAYWRIGHT_MODULE=<existing playwright module> node ops/preview-b-proof.cjs <Preview B URL>
```

The offline bridge tests cover forwarded/direct hosts, preflight, anonymous
mutation, foreign origin, foreign host and unknown model with zero SDK calls.
The Chromium UI proof covers theme persistence, combined filters, contextual
summary, rejected missing evidence, approved mock evidence, unchanged models
and theme-only storage.

`ops/update-preview-b.py --state <private state> --bundle <b.zip> --source-sha
<commit>` validates the existing app ownership and identity, rejects active or
uncertain jobs, journals deployment IDs, and updates only Preview B. It has no
resource-creation path. Rerunning the exact committed bundle observes the same
saved job. Never regenerate a job after an uncertain dispatch. This follows
the [Amplify manual deployment API](https://docs.aws.amazon.com/amplify/latest/APIReference/API_CreateDeployment.html)
and [StartDeployment](https://docs.aws.amazon.com/amplify/latest/APIReference/API_StartDeployment.html).

Execution results and served revision are recorded in `preview-b-v1.1-evidence.json`.
Preview B job 2 SUCCEED serves source `e50e78d`; HTTP/revision and deployed
Chromium proof pass. Native Windows Chrome authenticated through the actual
Windows OpenSSH forward and Dell bridge (HTTP 200); no model/remediation call
was made. The proof uses `ops/bridge-browser-proof.cjs`, passing the ephemeral
token only over stdin. It records no screenshots, traces or token artifacts.
The test-owned bridge/tunnel stopped and exact token file was removed.
Preview A/C keep their existing deployed bundles.
