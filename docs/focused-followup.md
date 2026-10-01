# Focused F1–F5 follow-up

Authority: [G operating decision](https://github.com/mytestlab123/agentcore2/issues/3#issuecomment-5923329299).
X/core2 is primary executor. Kiro provides read-only reviews. Home Crew is not
used and its security policy remains enabled. PR #5 remains draft/open/unmerged.

## F1 — code checkpoint

- Current-tree account identifiers removed from CONTEXT.md and three evidence
  docs. Historical exposure remains in Git history by explicit owner decision;
  no history rewrite or force push is authorized.
- The managed AgentCore Harness owns the model loop. Its only registered inline
  tool is read-only inspection. Exact SSL-policy mutation remains a deterministic
  implementation of the shared ComplianceBackend contract, outside model control.
- Stable caller intent IDs make proposals replayable. File locking covers both
  HTTP and fixed RPC transports. Write intent and native request IDs are journaled;
  uncertain mutations fail closed before retry.
- Provider GetBucketPolicy and a separate fresh SSL control evaluation remain
  distinct. This does not claim AWS Config convergence.
- A LIVE badge now requires both provider evidence and an authenticated transport;
  identifiers alone leave the static previews MOCK.
- Kiro [F1 review](https://github.com/mytestlab123/agentcore2/pull/5#issuecomment-5923548574):
  ARM64 base pinned; proposal intent replay fixed; shared lock added; explicit
  missing-environment error added. Actual runtime environment/role/SDK stream
  validation belongs to F2 and is not claimed from local tests.

Validation: 23 TypeScript tests plus 7 deterministic harness tests; full preview
build and typecheck. No cloud resource created at this checkpoint.

## Planned execution and retention

F2: one NEW ECR image, NEW narrow runtime role and managed Harness/runtime.
F3: three NEW manual-deployment Amplify apps. F4: one NEW tagged SSL-only canary,
Block Public Access enabled, explicit rejection then approved exact remediation.
F5: live CLI/SDK proof and closeout. Persist native IDs before retry. Derive a
testing TTL of 02-10-26 for resources, with canary removed during closeout and
remaining resources retained only within the ~USD 10 boundary. TTL is a review
deadline, not automatic deletion authority.
