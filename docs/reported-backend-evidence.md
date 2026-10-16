# Issue39: canonical reported backend receipts

Authority: [owner override](https://github.com/mytestlab123/agentcore2/issues/39#issuecomment-6207040070).
Goal: M-CORE2-EVIDENCE-20261016-R1. Source only; no Site, model or AWS action.

## Use

Open the existing standalone showcase index.html and expand **Defence Factory ·
backend receipt review**. Download its synthetic sample, then select that JSON
file. This is a local file interaction; no server, dependencies, network or
credentials are required. Clear removes the session's reported view only.
The existing grouped MOCK intake/approval/execution journey remains separate.

The file is a JSON array of exactly four unchanged defence-factory/1 envelopes:
Batch, Decision, Run, Evidence (one of each, any envelope order). This is a file
packaging convention, not a new wire schema. awsops still owns v1.schema.json;
its bytes are unchanged. The HTML embeds that exact schema, receipt reader and
synthetic example for portable offline operation. Existing strict JSON syntax
parsing and canonical SHA-256 scope helpers are reused. No awsops checkout edits.

## Admission and display

- 256 KiB UTF-8 / 500-target ceiling, strict canonical schema and unknown-field
  refusal; duplicate JSON keys, private shapes and malformed timestamps refused.
- Batch digest recomputed from the whole canonical frozen Batch excluding only
  scopeDigest; sorted unique compatible targets required. Decision/run/evidence
  references and decision validity window must match that exact Batch.
- Exactly one result for every frozen target, matching finding and resource
  alias. Missing/extra/duplicate targets or inconsistent write sums are refused.
  REJECT/BLOCKED/NOT_RUN require zero writes; UNKNOWN execution may retain a
  producer's attempted-call count, but stays review-only. MOCK/LAB_READ actual
  writes must be zero. VERIFIED claims need complete successful MATCH/COMPLIANT/
  FRESH results with receipt aliases. These checks establish consistency only.
- Display reported mode, dataset/registration revision, frozen digest/window,
  decision, run status, per-resource outcomes, separate provider/compliance/
  freshness claims, reported real and simulated mutation attempts (resource
  changes are not confirmed), source version/revision,
  independently stated hosted version (or NOT_VERIFIED), evidence time/limitation.
  MOCK MATCH/compliance values are explicitly SIMULATED. Local viewer writes=0.
- Malformed input clears the previous receipt rather than retaining a stale
  accepted view. File loading/clearing cancels older pending reads by generation.
  Only inert text nodes render fields. No URL following, network, persistence,
  approval or execution path is added. Downloaded sample is entirely synthetic.

## Trust limits

File-loaded/manual evidence is ALWAYS IMPORTED_ASSERTION, even when the file
claims TRUSTED_PROVIDER_READ, VERIFIED, or an approved LAB run with actual writes.
Such counts remain reported claims; they never increase the local MOCK executor's
write counters or authorize provider access. Historical reported FRESH is not an
independent freshness measurement. Source/hosted revisions remain declarations.

There is no existing authenticated canonical backend acquisition origin wired
into this standalone GUI. Therefore origin/live acceptance is NOT_VERIFIED;
private registrations/principal bindings/provider reads are not attested here.
The prior hosted receipt remains historical; this source fingerprint is not
published. Issue37 real-viewer acceptance remains NOT_RUN. Browser approval
does not confer AWS authority. Next smallest useful step is M's independent
review followed by separately scoped authenticated acquisition, not a new GUI.

## Proof

Use the existing fast lane: npm run verify:cloud -- fast. Its existing state
check now includes one focused receipt boundary section: synthetic pass, claimed
trusted LAB provenance remains an assertion, scope/target/total/schema negatives,
and actual GUI rendering without changing MOCK proposal/run/selection state.
This is local source validation, not hosted/browser/provider acceptance. No new
test suite or broad synthetic browser run was added.

This source receipt records the v1.10.1 predecessor; the uncertain-attempt
consumer correction is tracked in [PR46](https://github.com/mytestlab123/agentcore2/pull/46).

## Optional application E2E artifacts

The existing focused VM harness accepts the backend's test-only artifact
directory through `CORE2_APP_E2E_DIR`. The directory must be under
`~/.AGENTS-temp` and contain `app-e2e-summary.json` plus the receipt and optional
audit filenames listed in its manifest. Run
`CORE2_APP_E2E_DIR=<artifact-directory> node showcases/chatgpt-sites-preview-b/check-state.cjs`.
The harness bounds the set to 2 MiB, checks the required `success`,
`uncertain-policy`, and `reject` cases, and sends each canonical receipt through
the existing reader and GUI VM. It requires `TEST_SIMULATION`, `FAKE_SDK`, and
`actualAwsCalls: 0`; synthetic evidence remains IMPORTED_ASSERTION with origin
NOT_VERIFIED and local real writes zero. Audit sidecars are checked as bounded
JSON test data only and are never supplied to the four-envelope reader.

This optional input mode is not acceptance evidence until run against actual
artifacts from the backend's deterministic fake-SDK application command. It
does not make fake approval or provider activity live authority.

The existing browser smoke also accepts `SHOWCASE_JOURNEY=app-receipts` with
the same `CORE2_APP_E2E_DIR`. It uploads the three required receipt files via
the existing file input, checks the reported view and unchanged MOCK state,
then clears and refuses malformed input. Use the existing pinned Playwright
dependency and a local browser, for example:
`SHOWCASE_JOURNEY=app-receipts CORE2_APP_E2E_DIR=<artifact-directory> SHOWCASE_BROWSER=/usr/bin/google-chrome node showcases/chatgpt-sites-preview-b/smoke.cjs`.
Browser evidence defaults to a private subdirectory of `~/.AGENTS-temp`; no
other browser requests are allowed by the existing loopback-only route guard.

Milestone readback: build PASS; 23 contract tests + 12 Harness tests PASS;
typecheck PASS; existing showcase state/receipt boundary check PASS; changed-file
secret/account/private-path/endpoint scan PASS; canonical schema unchanged.
Machine receipt: reported-backend-evidence.json. The state check uses a minimal
DOM in Node, so actual browser/hosted/real-viewer acceptance is NOT_RUN here.
