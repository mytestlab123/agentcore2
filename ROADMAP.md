# Roadmap

## Now

- **Verify Preview A/B/C URLs (task 6/15): BLOCKED.** No Amplify apps exist
  (`aws amplify list-apps` = `[]`), so there are no stable URLs, no deployed
  revision, and no live badge to verify. Upstream deploy (task 5) did not
  perform the AWS write. Evidence: `docs/preview-verification.md`.
- Preview A/B/C are built locally from revision `765479d`, each emitting a
  truthful **MOCK** execution-mode badge. No winning UI declared (premature).

## Next

- Re-run the Preview A/B/C Amplify deploy to create Issue #3-owned apps and
  capture ≥3 stable URLs, then re-verify served revision + rendered badge and
  record the URLs here.
- Then M3: wire one preview to the real AgentCore Harness agent.

## Later

- M4/M5: governed live invocation, disposable S3 canary + remediation proof,
  non-GUI channel, closeout evidence, and exact-resource cleanup.
