# Demo Readiness E2E gate

Authority: [G GO](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5929211062).
One implementer, X/core2. Kiro remains review-only. PR #5 stays draft/open.

## One command, one lifecycle

Use a coherent runtime from `python3 ops/runtime-bundle.py --output runtime.tar`.
It includes every Harness Python source and `harness.json`, plus an exact
source/config digest manifest. Extract it in the approved Dell scratch area;
keep private state, token and SDK separate. Never copy only bridge/client/models.

In an owner Windows terminal with Python, OpenSSH and the existing Playwright
installation, set the private runtime paths locally and run:

```powershell
py ops/windows-bridge.py --root $DellRoot --state $DellState --python $DellPython --token-file $DellToken --tunnel --smoke --playwright-module $PlaywrightModule
```

The same helper without `--smoke` starts/reuses the admitted background Dell
bridge and keeps its optional foreground tunnel open. Without `--tunnel`, use
the existing owner tunnel. An occupied Windows forwarding port is reported;
the helper does not kill an existing owner tunnel.

The helper runs runtime preflight before starting anything, creates a strong
owner-private token only if the explicit token file is absent, and otherwise
preserves it. Token delivery is **separate**: retrieve the current file in an
unrecorded owner terminal and paste it into the browser. Helper stdout is
non-secret. The smoke reads the token privately over SSH and passes it to Node
only on stdin. It creates no token copy, trace, screenshot or storage export.

Preflight checks required sources/config, optional bundle digest manifest,
approved model/tool config, Python imports, private input readability/owner/mode,
exact `127.0.0.1:8703` bind and port availability/ownership. A different listener
is a blocker. Reuse requires exact source/state/token argv and an authenticated
readiness response with the matching source digest. The helper does not replace
an unknown or outdated active bridge automatically.

Dell PID/log files are owner-private in its owner-only bridge state directory.
Historical logs/PIDs are preserved; current files are unique to their process.
The background bridge survives helper exit. A smoke-created tunnel closes when
the smoke finishes; an existing owner tunnel is preserved. Stop only a verified
owned bridge PID after the demo, retaining its non-secret private log.

## Readiness is distinct from live model/provider execution

Authenticated `readiness` validates the local runtime and returns stored runtime
identity evidence; it constructs **no AWS client and invokes no model**. A LIVE
badge here means the browser is connected to the real authenticated bridge,
not that it has performed a new provider compliance check. The stored canary
cleanup flag produces explicit `NO_LIVE_FINDINGS`; it does not imply COMPLIANT.
In that state the UI does not send finding/capability RPCs to a deleted canary.

The default smoke checks the actual Amplify B URL, HTTP 200, MOCK → LIVE LAB,
authenticated readiness, no unexpected console/page errors, no raw Failed to
fetch, theme toggle, fixability and contextual shell. Its exact bridge method
allowlist is `[readiness]`. Model attempts remain **17/18**; model smoke is
disabled at this budget and needs separate approval. No new resource, canary or
remediation is authorized.

## Operator diagnostics

- Unreachable/blocked browser transport: start helper, verify forward and grant
  local-network access for the exact registered preview. Browser CORS failures
  cannot reliably be distinguished from network failures by JavaScript alone.
- HTTP 401: retrieve the current token; never rotate another active session.
- HTTP 403: use the registered origin and exact loopback Host.
- Runtime/server failure: run preflight and inspect owner-private diagnostics.
  Raw paths, exception details and stack traces never enter the UI.
- Authenticated but no live findings: deleted disposable canary; not a connection
  error and not a compliance pass.

## Validation

`npm run build`, `npm test`, `npm run typecheck`. Deterministic preflight tests
prove missing `harness.json`, unsafe bind, public token permissions and digest
drift fail before browser admission. Bridge tests prove readiness does not call
the SDK and keep anonymous/origin/host/model guards. Browser diagnostic fixtures
cover unreachable, 401, 403 and server/preflight errors without real requests.

The real lifecycle evidence is in `demo-readiness-evidence.json`. Only the
existing Preview B app is updated; A/C remain at their earlier deployments.

Final gate PASS: native Windows Python/OpenSSH/Chrome, zero unexpected console
errors and only `[readiness]`. Source `58a7600`, existing B deployment job 4.
The first strict gate exposed a missing favicon 404; a bundled data favicon
fixes it without ignoring console failures. Model attempts stayed 17/18.
