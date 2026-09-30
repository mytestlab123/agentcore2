# RESULT — Issue #3 AgentCore Compliance Lab

Source of truth: https://github.com/mytestlab123/agentcore2/issues/3
Owner: Kiro (execution) · Codex (controller/acceptance review)
Branch: `issue-3/agentcore-lab` (off `main` @ f70102e0)
Primary PR: https://github.com/mytestlab123/agentcore2/pull/5 (draft — do not merge until roadmap closeout)

## Milestone status

| Milestone | Status | Notes |
|-----------|--------|-------|
| M1 — platform + shared contracts + Preview A | **PASS (code/build)**; Amplify preview PENDING | monorepo, contracts, mock backend, Preview A build all green; live Amplify URL still to be deployed |
| M2 — ≥3 UI previews | **PASS (code/build)**; stable preview URLs BLOCKED (Amplify) | Preview A/B/C all build on the same seam — 3 distinct interaction models; `docs/preview-comparison.md` written; deploy gated on Amplify permission |
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

## M2 evidence

- **Three distinct previews, one seam.** All consume `@agentcore2/contracts`:
  - Preview A — Config-style table + detail drawer (baseline, little/no AI).
  - Preview B — Cloudscape + right-side contextual copilot; selected finding is
    bounded context (Explain / Investigate / Preview Fix / Approve Once / Reject);
    cannot become a generic chatbot.
  - Preview C — generative action cards (impacted resource / tool selected /
    approval state / run state / evidence); no chat page.
- **Build:** `npm run build` → all four packages build (A ~156 kB, B ~155 kB,
  C ~152 kB JS). `npm test` → 6/6.
- **Comparison notes:** `docs/preview-comparison.md` — operator observations per
  preview, no premature winner (Issue M2 deliverable).
- **M2 acceptance:** meaningfully different interaction models ✅ · same
  mock/backend seam ✅ · comparison without declaring a winner ✅ · **≥3 stable
  Amplify preview URLs — BLOCKED on Amplify permission** (see Blockers).

## Blockers

- **Amplify not permitted for the LAB role (live-preview gate).** Verified
  2026-09-30 in `ap-southeast-1`: `arn:aws:sts::672172129528:assumed-role/u-tf-role/dev`
  is denied `amplify:ListApps` AND `amplify:CreateApp` ("no identity-based policy
  allows the ... action"). The role does have EC2/SSM/Route53/SecretsManager and
  IAM-read; S3 read works. So general AWS access is fine — only Amplify is
  ungranted. Granting it is an IAM change, which is a hard stop gate: not
  self-performed. Existing GitHub CodeConnections in the account: `cloudos`,
  `nextflow`, `ami-factory-github-codebuild-dev`, `af-cloudos-cli-gh-dev`
  (available) — reusable for an Amplify GitHub app once permission exists.
- **Impact:** M1's "one working Amplify preview" and the M2 "≥3 Amplify preview
  URLs" acceptance are blocked on this permission. Mock-first work (M2 Preview
  B/C build, contracts) is NOT blocked and continues.
- **Options pending Amit's decision:** (a) grant the LAB role scoped Amplify
  permissions for this experiment; or (b) approve an alternative static host the
  role can already use (e.g. S3 website / CloudFront) as the preview surface,
  which is a deviation from the Issue's explicit "Amplify previews."

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
