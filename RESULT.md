# RESULT — Issue #3 AgentCore Compliance Lab

Source of truth: https://github.com/mytestlab123/agentcore2/issues/3
Owner: Kiro (execution) · Codex (controller/acceptance review)
Branch: `issue-3/agentcore-lab` (off `main` @ f70102e0)
Primary PR: _pending push_

## Milestone status

| Milestone | Status | Notes |
|-----------|--------|-------|
| M1 — platform + shared contracts + Preview A | **PASS (code/build)**; Amplify preview PENDING | monorepo, contracts, mock backend, Preview A build all green; live Amplify URL still to be deployed |
| M2 — ≥3 UI previews | NOT STARTED | |
| M3 — real AgentCore Harness S3 specialist | NOT STARTED | |
| M4 — governed disposable-S3-canary remediation | NOT STARTED | |
| M5 — demo closeout + harvest | NOT STARTED | |

## M1 evidence

- **Build:** `npm run build -w @agentcore2/contracts` → clean. `npm run build -w
  @agentcore2/preview-a` → static bundle (`dist/`, ~156 kB JS / 50 kB gzip).
- **Tests:** `npm test -w @agentcore2/contracts` → 6/6 pass. Proves the governed
  seam: REJECT and no-decision both yield zero writes and no provider exec id;
  APPROVE_ONCE converges with distinct PROVIDER_READBACK and COMPLIANCE_READBACK
  evidence; runs are resumable by `runId`; findings with no registered capability
  cannot be silently remediated.
- **Preview A markers present in built bundle:** MOCK badge, "Preview Fix",
  "Approve Once", "Config-style baseline".
- **Local serve:** `python3 -m http.server --bind 127.0.0.1 apps/preview-a/dist`
  → HTTP 200.

### M1 acceptance check (Issue criteria)

- one working Amplify preview — **PENDING** (built + locally served; not yet on Amplify)
- mock Config-style dashboard useful without AI — **YES**
- one shared contract powers UI and mock backend — **YES** (`@agentcore2/contracts`)
- no AWS credentials needed for normal development — **YES** (mock bundled)
- new experiments added without copying the whole app — **YES** (workspace + seam)

## Evidence gaps / follow-ups

- **Screenshot:** no browser available this run (`playwright-cli` not installed;
  the in-panel browser refuses loopback URLs). Visual proof deferred to the
  Amplify preview URL in M2, which is the real artifact anyway.
- **Dependency advisory:** `esbuild`/`vite` GHSA-67mh-4wv8-2f99 is a **dev-server-only**
  issue; it does not affect the static production bundle Amplify serves. Plan: pin
  `vite` to a patched 5.4.x during M2 hardening (avoid `--force` which jumps out of range).

## AWS resources

None created. LAB identity: account `672172129528`, role `u-tf-role/dev`,
region `ap-southeast-1`. All future resources will carry the `~/.agent/AWS.md`
tag/name/TTL schema and be recorded here with exact IDs + cleanup state.

## Spend

- To date: **$0** (no cloud resources).
- Envelope: ~USD 10 first-month LAB target.

## Cleanup state

- Nothing to clean up yet. `.kiro/` local state preserved and untracked.

_Last updated: 2026-09-30._
