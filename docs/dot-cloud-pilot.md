# Dot cloud pilot — Issue #12

2026-10-03 reconciliation: PR #13 merged at
`098e0254c2d5167a985073f0dc40dccf731c183b`. Final pilot head
`17feaeb58a4a6747efaf856482b88574e5942b4c` passed
[CI 37018552864](https://github.com/mytestlab123/agentcore2/actions/runs/37018552864)
(fast 38 s; browser 75 s). Later draft/open wording is historical.
[Issue #14](https://github.com/mytestlab123/agentcore2/issues/14) owns repository-only
deployment readiness; no live-deployment authority transfers from pilot PASS.

Status: **cloud-only pilot PASS**, with draft PR #13 open and both CI lanes passing. Earlier blocked-access records below are historical.

## Current saved-environment continuation (2026-10-02)

- Owner authorized a new task to adopt published saved network settings; the old
  task remains idle. The existing executor is usable, including after a reported
  disconnect callback. No replacement execution or Home/office fallback was used.
- Origin and clean local HEAD verified first. The single original
  `gh api repos/mytestlab123/agentcore2` read succeeded with exit 0 in about 0.49 s
  using existing configured credentials. No secret value was read or printed;
  no alternate auth, route, proxy bypass or access-policy change was attempted.
- Read the checkout AGENTS.md, CONTEXT.md, SPEC.md and Issue #12 with its latest
  comments. Plain `gh issue view --comments` hit a legacy Projects GraphQL error;
  selecting explicit JSON fields succeeded through the same CLI/auth route.
- Remote main remains `e2f64c522b005ada178c2c98fc2318dac2ab7dcd`. Target branch
  and matching PR were absent before restoration; no base reconciliation needed.
- Source transfer is the exact diff from that base to preserved original head
  `03d590ad98a7be2a1174c450c2038cf29f9dcd64`. Standard Python base64 + lzma decode
  verified **27,591 bytes**, SHA256
  `59b510008d54c15f999243580b420507b0fe58775a1a5f47d5619f1cb93165f2`.
  Patch was inspected, `git apply --check` passed at the clean exact base, and all
  nine restored blob hashes matched. Commit `d0ce9c9` preserves those files;
  it does **not** preserve or claim the original commit identities/history.
- This environment has Node 24.19.0, npm 11.9.0 and Python 3.12.14. Normal root
  `npm ci --no-audit --no-fund --fetch-retries=0 --cache /workspace/.npm-cache`
  passed: 74 packages, 1.51 s. No browser package or binary was installed here.
- Entrypoint/smoke syntax checks and diff whitespace checks passed. Canonical
  showcase HTML, state/safety script, root lockfile and inert deployment workflow
  remain unchanged from the approved base.
- Internet access was needed for GitHub; npm used the configured registry/cache.
  CI will need Actions, Node, registry and browser/system-package downloads.
  Existing GitHub credentials are the only publication auth used; no AWS or
  application credentials are needed. Owner settings/publication UI work was
  reported in the handoff; this task did not operate that UI.
- Browser execution in this cloud environment remains **NOT_RUN / owner-deferred**.
  The approved separate GitHub CI browser job supplies browser evidence when run.
  Browser failure artifact capture remains untested until an actual failure.

### Current-task verification

| Check | Result | Elapsed |
| --- | --- | --- |
| Root npm ci (workspace cache) | PASS, 74 packages | 1.51 s |
| `npm run verify:cloud -- fast` | PASS, browser explicitly SKIPPED | 25.09 s |
| Included build | PASS, contracts + previews A/B/C | 8.00 s |
| Included tests | PASS, 23 contract + 12 Python | 4.10 s |
| Included typecheck | PASS | 6.51 s |
| Included showcase state/safety | PASS, zero model calls/real writes | 6.23 s |
| `node ops/verify-cloud.cjs browser` prerequisite probe | Expected exit 2: missing tooling; smoke NOT_RUN | <1 s |

### Published proof and remaining limits

- Draft PR: [#13](https://github.com/mytestlab123/agentcore2/pull/13), branch
  `issue-12/cloud-verification`. No merge was performed or authorized.
- Validated implementation/evidence head:
  `6fa16b3d04591edebf18789adbcc974a3bdcf18d`.
- [Cloud verification run 37018266868](https://github.com/mytestlab123/agentcore2/actions/runs/37018266868)
  completed successfully on that head on 2026-10-02.
  [Fast job](https://github.com/mytestlab123/agentcore2/actions/runs/37018266868/job/110874450632)
  passed in 29 s; [browser job](https://github.com/mytestlab123/agentcore2/actions/runs/37018266868/job/110874450906)
  passed in 52 s, including tooling, browser and system-library installation.
- Browser logs report matching Chromium headless shell 151.0.7922.34 (Playwright
  build v1234), smoke PASS in 13.63 s, desktop 1440×1000 and mobile 390×844,
  one local document request, zero unexpected requests/browser errors, zero real
  writes/model calls, and all retained synthetic approval/rejection assertions.
- This closing evidence update is documentation-only. Its exact head and CI
  result are recorded in the PR description and final handoff after publication,
  avoiding a self-referential commit SHA in this file.
- CI emitted a nonblocking Node 20 action-runtime deprecation warning for the
  pinned checkout/setup-node actions; GitHub ran them on Node 24 successfully.
  No workflow behavior change was needed for the pilot.
- Failure artifact capture remains **NOT_RUN**: there was no browser failure,
  so artifact upload was correctly **SKIPPED**. Cloud-environment browser setup
  remains owner-deferred; browser evidence comes from GitHub-hosted CI only.
- No remaining blocker for Phase 1. Owner review/merge and any future AWS/OIDC
  experiment remain separate decisions. No laptop power-state claim is made.

The following sections preserve earlier task evidence and access failures;
statements about blocked publication describe those earlier attempts, not the
successful original API read in this new task.

## Authority and baseline

- [Issue #12](https://github.com/mytestlab123/agentcore2/issues/12), Phase 1 only.
- [Start gate release](https://github.com/mytestlab123/agentcore2/issues/12#issuecomment-5950622930).
- Approved implementation base: `e2f64c522b005ada178c2c98fc2318dac2ab7dcd`.
- Clean provisioned checkout and origin `https://github.com/mytestlab123/agentcore2.git` verified; initial `git ls-remote origin refs/heads/main` matched the base.
- GitHub connector read confirmed PR #5 merged at that SHA. Historical unmerged statements are superseded by that evidence.
- Read AGENTS.md, CONTEXT.md, SPEC.md, owning issue/current comments, workspace manifests/lockfile, showcase scripts and offline harness tests. No checkout `.agents/skills` directory was present.

## Environment and access

Saved cloud environment provisioned successfully. Node 24.19.0, npm 11.9.0,
Python 3.12.14 and GitHub CLI are present. No local laptop execution was used.
The checkout was provisioned before this task; cloning it was not independently
performed or timed. npm workspaces and package-lock.json are the install path;
node_modules was initially absent; root installation now passes. Browser smoke
requires Playwright and Chromium and remains deferred.

Network access is declared enabled. HTTP/HTTPS proxies and custom CA settings
are configured; api.github.com has no explicit proxy exemption. GH_TOKEN is
present, but its value was not read or printed and its authorization is unverified.
Git transport and connector reads succeeded; this does not establish CLI API
access. No relevant local environment setup documentation was found.

The initial read and one explicitly authorized retry both failed:

```text
gh api repos/mytestlab123/agentcore2 --jq '{permissions: .permissions}'
Get "https://api.github.com/repos/mytestlab123/agentcore2": Forbidden
```

Retry exited 1 in approximately 0.3 seconds (tool wall time). No diagnostic
response body or headers distinguish proxy denial from GitHub authorization;
root cause is **unknown**. No alternate route, credential or proxy bypass was
attempted, and no security/network setting was changed.

Owner setup friction: review the saved environment's outbound proxy/access
policy for HTTPS api.github.com and the denial record for this request. If the
request reached GitHub, review the existing environment GitHub authorization
for this repository. The evidence does not justify prescribing a permission
expansion or a specific allowlist change. No owner UI repair was observed.

Subsequent owner-reported screenshot evidence: the saved environment network
mode is **Package managers**, with no additional allowed domains. This supports
the possibility that api.github.com is excluded, but does not prove the source
of the observed denial. The UI also reported **Could not publish** because
settings changed or the environment was in use; no successful settings update
is established. No further access retry is authorized at this point.

The owner requested no Chrome installation and asked for browser setup to be
commented out for now. The setup assistant reportedly disabled the browser
helper/setup smoke while retaining build/test/typecheck. These are reported
setup changes, not independently verified here. Do not install browser
dependencies or re-enable those saved setup checks without new instruction.
Separate future CI browser testing was recommended, but does not authorize an
environment access change.

## Executed local checks

Both checks used existing source and runtime tooling without package downloads,
cloud credentials or AWS calls. Python tests use stubs and a local loopback test
server with generated test-only authentication material.

| Command | Result | Approximate elapsed |
| --- | --- | --- |
| `node showcases/chatgpt-sites-preview-b/check-state.cjs` | PASS: state/governance/source safety; zero real writes/model calls | 6.86 s |
| `python3 -m unittest discover -s harness -v` | PASS: 12 tests | 1.18 s |

Timing attempts using `/usr/bin/time` initially exited 127 because that utility
is absent; neither test started on those attempts. Bash's `time` keyword then
measured the successful commands. The Node VM check is not browser proof.

## Remaining evidence gaps

Root install, build, full npm tests and typecheck now PASS (see latest results
below). Earlier installation was withheld, not proven blocked by the unrelated
GitHub denial. Official npm registry operations succeeded through the existing
configuration. Browser installation/setup smoke remains deferred by owner
instruction even after access resolution unless separately authorized. Actual
browser binary/system-library download requirements remain unmeasured.

A local verification entrypoint and separate PR CI jobs are now prepared on
`issue-12/cloud-verification`. No branch was pushed, draft PR opened, CI run
observed or issue comment published; there are no PR/CI links. The exact local
commit is reported in the handoff; use `git rev-parse HEAD` in this checkout. GitHub-dependent work remains paused. No AWS, OIDC, deployment,
Home/office fallback, live Preview B change or merge occurred. No complete
cloud-loop acceptance or laptop power-state claim is made.


## Local implementation under subsequent owner approval

The owner authorized local code improvements while GitHub publication remains
blocked. `npm run verify:cloud` defaults to the **fast** lane:

```sh
npm ci --no-audit --no-fund
npm run verify:cloud -- fast
```

It requires Node >=20, Python 3 and installed workspace dependencies, then runs
build, full npm tests (including Python tests), typecheck and the existing
showcase state/safety check sequentially. It fails on the first unsuccessful
command. Browser coverage is explicitly SKIPPED in this lane, not implied by
its success. It never installs dependencies or browsers automatically.

The **browser** lane is separate. These commands are for authorized CI/future
setup, **not instructions to re-enable this saved environment's deferred browser
setup**:

```sh
npm ci --prefix tools/browser --ignore-scripts --no-audit --no-fund
node tools/browser/node_modules/playwright-core/cli.js install --with-deps chromium
npm run verify:cloud -- browser
```

Playwright Core is isolated from the product workspaces and pinned to 1.62.0 in
its own manifest/lockfile. Official registry metadata confirmed version 1.62.0,
tarball URL and SHA-512 integrity. npm regenerated the lockfile using a
package-lock-only operation with scripts disabled; no browser tool package or
binary was installed. This also corrected the initial assumed Node >=18
requirement to the registry-declared Node >=20. Tarball installation of this
browser tool remains unexecuted.
The matching browser is selected by that pinned package's browser manifest;
there is no independently drifting browser version or custom executable in the
verification lane. Missing package/browser or version mismatch exits nonzero.

The existing smoke assertions are retained. The test serves only the canonical
HTML at an ephemeral 127.0.0.1 HTTP port, accepts the single initial document
request and aborts/fails unexpected requests before transmission. It does not
open the live demo link or use file://, disable web security, or alter product
HTML. Service workers are blocked. A failure attempts a screenshot, trace and
JSON diagnostic under ignored `artifacts/showcase/`, then closes browser/server.
These failure artifacts contain synthetic test content; CI retains them seven
days. Browser-install failures are recorded in CI logs, with no fabricated trace.

`cloud-verification.yml` runs independent fast/browser jobs on pull requests to
main, with read-only contents permission and checkout credential persistence
disabled. It requests no repository secrets or OIDC permission. GitHub's ordinary
checkout token is still used for checkout; “credential-free” means no supplied
cloud/application credentials, not anonymous GitHub execution. The existing inert
`showcase-c1.yml` is unchanged. CI requires GitHub Actions/toolchain downloads,
npm registry access and, in its browser job only, browser/system-package downloads.
Node 24.19.0 and Ubuntu 24.04 match the chosen explicit CI setup; remote action
and Node downloads remain NOT_RUN here; npm registry metadata access succeeded.

### Post-change local results

- Showcase state/safety: PASS, 6.38 s; canonical HTML digest/approval/rejection
  assertions unchanged, zero model calls or real writes.
- Python harness: PASS, 12 tests, 1.10 s.
- Node syntax checks for entrypoint and smoke: PASS.
- Fast/browser missing-dependency and invalid-lane probes: expected exit 2,
  no false PASS (each approximately 0.02–0.03 s).
- Manifest/lockfile JSON parsing: PASS.
- Workflow YAML parsing and bounded permission/job checks: PASS.
- Staged diff whitespace check: PASS; canonical HTML, state check, root lockfile
  and inert AWS workflow are byte-unchanged against the base.
- Initial fast-lane probe correctly failed when workspace dependencies were absent;
  the complete fast lane subsequently passed after installation (see below).
- Actual browser lane, failure artifact capture and GitHub CI: NOT_RUN.

No GitHub request was retried during this implementation. Next: independent
review, then owner resolution of the existing access blocker before publishing
one draft PR and observing CI. No merge is authorized.


### Authorized registry installation and full fast verification

No GitHub request or alternate route was used. Only the existing official npm
registry route was used; no proxy, credential or network policy changed.
Install-script inspection identified esbuild 0.21.5 and macOS-only optional
fsevents 2.3.3. Root/workspace manifests have no install hooks. Packages were
first downloaded with scripts disabled, then esbuild's actual install.js was
read: it selects/validates the matching optional platform binary, with npm
registry fallback if missing. The normal install then completed successfully.

The first `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0`
failed in 4.78 s with ENOENT creating `/home/agent/.npm/_cacache`; npm also
emitted tarball warnings and cleanup ENOTEMPTY warnings. This was an observed
local cache-path failure, not evidence of a registry authorization denial.
Using the writable workspace cache resolved it without a security change.
No dependencies or credentials were placed in temporary directories.

| Command | Result | Elapsed |
| --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --cache /workspace/.npm-cache` | PASS, 74 packages | 2.31 s |
| `npm ci --no-audit --no-fund --fetch-retries=0 --cache /workspace/.npm-cache` | PASS, 74 packages; scripts enabled after inspection | 1.03 s |
| `npm run verify:cloud -- fast` | PASS: fast lane only; browser explicitly SKIPPED | 24.03 s |
| included `npm run build` | PASS, contracts + previews A/B/C | 7.60 s |
| included `npm run test` | PASS, 23 contract + 12 Python tests | 3.91 s |
| included `npm run typecheck` | PASS | 5.96 s |
| included showcase state/safety | PASS | 6.32 s |
| `npm view playwright-core@1.62.0 version dist.integrity dist.tarball --json --fetch-retries=0 --cache /workspace/.npm-cache` | PASS, registry metadata | not separately timed |
| `npm install --prefix tools/browser --package-lock-only --ignore-scripts --no-audit --no-fund --fetch-retries=0 --cache /workspace/.npm-cache` | PASS, generated lock integrity; no browser binaries | 0.35 s |

Browser execution, browser artifact capture and GitHub CI are still NOT_RUN.
The separate CI workflow is code-reviewed locally only, not remotely validated.
GitHub publication is still blocked by the earlier API denial; its cause remains
unproven. The npm cache path is an environment-specific setup requirement; use
an existing writable cache in future runs, without broadening permissions.


### Retry after reported saved-environment update

On 2026-10-02, the owner reported updated unrestricted-internet settings and the
controller confirmed a new saved environment version. This same task resumed;
HEAD was verified as `a12644698ca1465497fd8a640732aa2037f77e27` with a clean
working tree on `issue-12/cloud-verification` before the authorized single retry.
The original repository API read, using existing routing and credentials, again
exited 1 with:

```text
Get "https://api.github.com/repos/mytestlab123/agentcore2": Forbidden
```

The result does not establish whether the running task adopted the new saved
settings or whether the denial is from a proxy or GitHub authorization. No
further retry, alternate route/credential, replacement task or security-setting
change was attempted. Current remote main and existing Issue #12 PRs were not
reconciled after this denial. No branch was pushed, PR created, CI observed,
browser installed or merge performed. Prior local fast-lane results stand;
publication remains blocked pending environment/access resolution.


## Issue #12 controlled failure-artifact proof (2026-10-06)

This follow-up closes the unexercised-capture evidence gap, not the already-passing
normal smoke path. Base main: `dbe1e9ffc64f0a1051414ce5028fc2d465b3c2f4`.
Run `node ops/browser-failure-proof.cjs` only where the pinned browser is already
installed. Local browser installation remains deferred; existing CI supplies it.

The existing smoke recognizes test-only `SHOWCASE_FAILURE_FIXTURE=capture-v1`
and throws a fixed marker after real localhost rendering and MOCK badge checks.
It still exits **1** through the existing JSON/screenshot/trace catch/finally path.
The full desktop journey runs without that flag only when explicitly requested
by a major-finish/high-risk validation label. Ordinary PRs exercise the focused
fixture. Mobile assertions are retired by the standing project policy.
The proof command fails for unexpected success, wrong failure, timeout/signal,
missing artifacts or failed content verification. No continue-on-error is used.

The fixture runs in a fresh browser context and fresh temporary home with an
allowlisted subprocess environment. Runner credential/session variables are not
forwarded; a synthetic private sentinel seeded in the parent must be absent from
child logs and all artifact bytes, including decompressed trace resources.
The verifier requires exactly failure.json, failure.png and trace.zip, the exact
fixed diagnostic, a full PNG decode using the pinned Playwright bundle with
bounded desktop dimensions, trace frame snapshots and exactly one localhost
GET. Recorded auth/cookie headers, nonempty session state, extra files and known
credential-shaped bytes are rejected. Offline negative cases test these guards.
This is provenance and validation for this controlled synthetic fixture, **not a
general-purpose sanitizer for arbitrary browser sessions or arbitrary secrets**.

Only after verification succeeds does CI upload those three exact fixture files
as `showcase-expected-failure`, retained seven days. If verification fails, the
fixture directory is not published. The original normal-failure upload retains
its failure condition and its three standard file paths, excluding the separate
fixture directory. Normal test failures still fail the job. Neither fixture nor
CI success is live hosting/provider evidence.

Final SHA, exact-head CI, artifact ID/digest, download inspection and screenshot
review will be recorded in the draft PR / Issue #12 after execution. No synthetic
artifact is committed to Git; no public URL, credentials or live browser profile
is used by the fixture. No product HTML or external Site is changed.


### PR #21 review correction and separate local visual proof

The HTTP rejection subcases now start from independent valid localhost GETs, so
POST cannot accidentally fail only because an earlier external URL survived.
Screenshot verification uses existing ImageMagick `convert` to fully decode the
PNG, rejects decoder errors/warnings, and checks width 1440 and full-page height
1000–10000. No new image dependency is installed. Unit fixtures are valid RGB
PNGs generated with stdlib; negatives include signature-only junk, truncation,
invalid compressed pixels, incomplete decoded pixels and wrong dimensions.
Forty offline tests pass; negative controls removing the method or image-decode
guard fail the corresponding regression.

A separate local run used the saved environment's already-present Playwright
1.62.1 and `/usr/bin/chromium`, not the CI-pinned Playwright 1.62.0 toolchain.
It used a fresh home/context and an allowlisted environment, rendered localhost,
and exited 1 with the expected marker. Verification found one local GET, six
trace snapshots and no recorded session state. The actual screenshot decoded as
1440×1702, 306611 bytes, SHA256
`fad76c016f9b14ae2a173772fe5e87861db1b559af9c9e432f145d9d5c98cd3e`.
The image-viewing tool confirmed a rendered MOCK workspace with synthetic
findings, visible MOCK banner and zero-real-writes/model-calls label; no visible
credentials or private-session data. This is **local visual proof only**, not
independently downloaded hosted bytes or a substitute for full hosted acceptance.

The previous denied artifact-download route was not retried or bypassed. Hosted
post-download byte validation and visual acceptance remain unresolved. Current
head/CI evidence is recorded on PR #21 / Issue #12; the PR remains draft and
unmerged pending independent review. No product or external Site changed.


### Test-economy policy reconciliation (2026-10-06)

Read the canonical [TESTING.md at dotfiles 606384fc](https://github.com/amitkarpe/dotfiles/blob/606384fcf258da7f282251ef9826db1ffb765d6b/agent/.agent/TESTING.md)
and main's AGENTS/CONTEXT policy at `413fa53`. The actual CONTEXT insertion
conflict was already resolved in `52c0ae7`, preserving both policy and milestone;
there is no remaining Git conflict. This clarification changes documentation
only and adds/runs no further tests or browser flows.

The existing eight focused artifact-verifier tests are retained because they
protect distinct, stable acceptance risks: corrupt/missing/wrong evidence,
nonlocal/non-GET requests, session/credential leakage, and the exact controlled
failure contract. The HTTP-isolation and image-decoding regressions were explicit
review requests for demonstrated gaps, not coverage-count expansion. Prior local
visual/decode proof is retained without repeating it. No mobile work is planned;
historical mobile results above remain historical only.

Existing repository CI automatically runs fast, deployment and normal browser
checks on PR updates. The normal smoke still contains legacy mobile assertions;
this is disclosed existing CI behavior, not renewed mobile acceptance authority.
This policy-only reconciliation does not mute/delete those checks or rewrite
historical evidence. It does not manually dispatch or rerun broad CI/E2E.

CI run 37410501023 failed because `convert` is absent on its runners. Normal fast
checks and normal browser smoke passed, but image-dependent verification failed
closed and fixture upload was skipped. This is still a tooling gate, not grounds
to weaken real decoding or add dependencies automatically. Local visual proof,
CI execution and hosted downloaded-byte/visual acceptance remain separate; the
last remains unresolved and the denied artifact route has not been retried.


### Active-path policy and decoder compatibility resolution

This supersedes the preceding docs-only policy interpretation. Current smoke
commands no longer switch to a mobile viewport, assert mobile behavior or emit
mobile acceptance fields. Historical reports above are unchanged. Ordinary PRs
run the existing fast checks and the focused failure fixture, not the full UI
journey. Apply `validation:major-finish` only for an explicit major finish
(normally about five milestones) or `validation:high-risk` for a concrete risk
to request the desktop E2E step. Label additions/removals trigger evaluation;
no such label is added by this task. Any selected check still fails normally.

The CI portability fix reuses pngjs already bundled in pinned Playwright 1.62.0
(`lib/utilsBundle.js`). CRC checking and complete RGBA pixel decoding replace
the unavailable ImageMagick command; dimension limits remain. No dependency is
added. This internal bundled capability is version-bound and fails closed if a
future Playwright upgrade changes it. The existing eight artifact-verifier cases
move to `tools/browser/tests`, run after the existing browser-tool installation;
fast's provider-free deployment suite remains separate. No cases are added.

Focused local validation: eight existing verifier cases, revalidation of the
already-generated local screenshot/trace with the replacement decoder, JavaScript
syntax, workflow parsing/source inspection and diff whitespace. No new browser
journey or mobile flow was run. Existing automatic CI still performs build,
contract/harness/state checks and the 32 offline deployment tests, then the eight
artifact cases and focused capture; full desktop E2E is explicitly gated. Current
SHA/CI results are in PR #21. Independent review is required before merge.
