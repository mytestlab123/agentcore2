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

**All live paths for stable previews + M3/M4 are permission-gated on the LAB
role; mock-first M1/M2 is complete.** Verified 2026-09-30 in `ap-southeast-1`
for the former LAB role `u-tf-role/dev` (superseded, see Resolution):

| Capability | Probe | Result | Blocks |
|-----------|-------|--------|--------|
| Amplify | `amplify:ListApps`, `amplify:CreateApp` | DENIED | stable preview URLs (M1/M2 acceptance) |
| AgentCore | `bedrock-agentcore:ListAgentRuntimes` | DENIED | M3 real Harness agent |
| Bedrock models | `bedrock:ListFoundationModels` | DENIED | M3 model invocation |
| S3 | `s3api list-buckets` | OK (16 buckets) | — (M4 canary substrate reachable, but M4 agentic path needs M3) |

The role does have EC2/SSM/Route53/SecretsManager + IAM-read. General AWS access
is fine — the experiment-specific services (Amplify, AgentCore, Bedrock) are
simply ungranted. **Granting them is an IAM change = Issue #3 hard stop gate; I
will not self-grant.** Existing GitHub CodeConnections reusable for Amplify:
`cloudos`, `nextflow`, `ami-factory-github-codebuild-dev`, `af-cloudos-cli-gh-dev`.

### Decision needed from Amit (one of)

1. **Grant the LAB role scoped permissions** for this experiment — `amplify:*`
   (or a preview-scoped subset), `bedrock-agentcore:*`, and `bedrock:InvokeModel`
   + `bedrock:ListFoundationModels` (with model access enabled) — keeping the
   Issue's Amplify + real-AgentCore path. Then M1 preview deploy, M2 URLs, and
   M3/M4 proceed.
2. **Approve an alternative static host** the role already has (S3 website /
   CloudFront) for the preview surface — unblocks preview URLs only; still needs
   AgentCore+Bedrock for M3/M4. This deviates from the Issue's explicit "Amplify
   previews," so it needs your OK.
3. **Keep it mock-only** for now — M1/M2 stand as a complete mock-first proof;
   M3/M4 remain BLOCKED and documented.

### Resolution (2026-10-01)

Owner decision: use IAM user `amit` (local `amit` profile on the Home Crew
host, `ap-southeast-1`); do not use `u-tf-role/dev`. Read-only re-probe under
`amit`:

| Capability | Probe | Result |
|-----------|-------|--------|
| Amplify | `amplify list-apps` | OK (0 apps) |
| AgentCore | `bedrock-agentcore-control list-agent-runtimes` | OK (5 pre-existing, not issue-owned) |
| Bedrock models | `bedrock list-foundation-models` | OK (40 models) |
| S3 | `s3api list-buckets` | OK (18 pre-existing) |

`amit` has `AdministratorAccess`, an explicit owner-approved exception to the
Issue boundary, with the guardrails recorded in `CONTEXT.md`. No IAM changes
were made.


## Evidence gaps / follow-ups

- **Screenshot:** no browser available this run (`playwright-cli` not installed;
  the in-panel browser refuses loopback URLs). Visual proof deferred to the
  Amplify preview URL in M2, which is the real artifact anyway.
- **Dependency advisory:** `esbuild`/`vite` GHSA-67mh-4wv8-2f99 is a **dev-server-only**
  issue; it does not affect the static production bundle Amplify serves. Plan: pin
  `vite` to a patched 5.4.x during M2 hardening (avoid `--force` which jumps out of range).

## AWS resources

None created. Runtime identity: IAM user `amit` (owner decision 2026-10-01),
region `ap-southeast-1`; account ID held in host runtime config. All future resources will carry the `~/.agent/AWS.md`
tag/name/TTL schema and be recorded here with exact IDs + cleanup state.

## Spend

- To date: **$0** (no cloud resources).
- Envelope: ~USD 10 first-month LAB target.

## Cleanup state

- Nothing to clean up yet. `.kiro/` local state preserved and untracked.

_Last updated: 2026-09-30._
