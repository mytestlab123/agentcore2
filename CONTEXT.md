# Current context

Authority: Issue #3 and [G executor decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5923329299).
Repository: mytestlab123/agentcore2. Branch: issue-3/agentcore-lab. Primary PR: #5,
draft/open/unmerged. X/core2 is primary executor; Kiro is review-only. Home Crew
is not used for this follow-up and its security rules remain unchanged.

## Current truth

- The prior v4.2 run reached final task 15/15. M1/M2 code and M5 documents passed;
  live resources were blocked. Prior provider claims and evidence are historical
  in docs/final-handback.md. PR #5 base for this follow-up was 7495283.
- F1 adds the smallest managed Harness S3 specialist custom ARM64 environment,
  registered read-only tool and deterministic SSL-only ComplianceBackend RPC.
  The model cannot approve or execute mutations. Stable intent IDs, ownership
  tags, policy drift checks and durable write-intent/request-ID evidence guard
  execution. See harness/README.md and docs/focused-followup.md.
- Current-tree account identifiers have been scrubbed. Historical exposure is
  retained as a known repo-history issue by owner decision; no force push.
- Static Preview A/B/C remain MOCK until connected to authenticated live transport.
  Provider identifiers alone cannot enable a LIVE badge.
- Selected runtime identity: Home Dell, profile amit, region ap-southeast-1;
  personal LAB identity checked locally. Never publish its account identifier.
- Model gate resolved by [G Nova decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5924722893).
  Exactly Nova Micro APAC, Nova Lite APAC (default) and Nova 2 Lite global are
  allowed. Synthetic model inference may cross Regions; resources stay Singapore.
  No Anthropic subscription or agreement is authorized or used.
- F2 in progress: one new ECR repo agentcore2-issue3-f1-20261001-490ceb and
  one new runtime role of that name plus -runtime created. Provider response IDs
  are in the private Home journal. No runtime, previews or canary created yet.
  An IAM duplicate-case TTL tag rejection was reconciled with GetRole absence
  before retry. Lowercase lifecycle tags are now used.
- The ARM64 build is still running on Home (buildx and emulated pip observed);
  an SSH transport loss did not authorize a second build.
- Home Docker buildx and qemu-user-static were installed under the explicit
  tooling approval; ARM64 binfmt registration is verified. SDK 1.43.104 is
  isolated in private task state. Crew security/configuration is unchanged.
- Local .kiro state is preserved. It must remain untracked and must not be ignored
  broadly or included in commits.

## Next action

Complete the existing ARM64 build, then F2 deployment and model/tool proof,
F3 previews, F4 SSL-only canary remediation, and F5 non-GUI proof/closeout. Keep
S3 Block Public Access enabled. Stop on the Issue #3 identity, ownership, IAM,
public-exposure, budget, evidence or non-fast-forward hard gates.

Validation: npm run build; npm test; npm run typecheck. Evidence: docs/focused-followup.md.
