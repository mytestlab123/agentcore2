# Issue39 — M2–M4 source / M5 delivery record

Dot implemented natively; no Direct, X or delegated code writer. M1 merged PR40
(aaf26834). This slice reuses the existing single standalone UI and executor.

- M2: bounded browser-local file staging, exact-schema validation, filtered group
  preview and explicit load into a separate MOCK_IMPORT dataset. Unknown controls
  stay manual, raw unknown labels discarded. 24 candidates, live coverage UNKNOWN.
- M3: existing compatible multi-select / frozen proposal / Approve Once / Reject.
  Imported batches add input/scope SHA-256, five-minute expiry and exact target
  account/Region/revision drift guards. No browser decision grants AWS authority.
- M4: existing per-target progress, partial/mismatch/interruption and same-run
  resume. Selected current imported-run JSON/Markdown preserves original findings,
  scope/input digest, decision, simulated provider/compliance, source fingerprint,
  unknown hosted version and REAL_WRITES=0. Incomplete/inconsistent export refuses.
  Legacy fixture export rejects imported epochs rather than claiming its old schema
  can reopen them. New receipt is read-only evidence, not importable authorization.
- M5: v1.10 source release prepared. Publication and one hosted journey are separate
  recorded gates; do not call this released merely from a merge. #37 real viewer
  remains NOT_RUN. #38 draft/card unchanged; no imaginary feedback.

## Four-minute demo

1. Open Defence Factory import; download its two-resource synthetic sample.
2. Select that file, inspect grouped counts, explicitly Load imported simulation.
3. Select all compatible targets; choose provider-success/compliance-needs-review
   scenario, Preview bulk fix; inspect exact targets, SHA-256 and expiry.
4. Approve Once; observe two simulated results and NEEDS_REVIEW; download current
   run JSON/Markdown. Original imported observations remain unchanged.

Reject is a legitimate alternate outcome and yields zero simulated/real writes.
Restore official fixture returns to the original dataset and invalidates scope.
The comparison/model labels remain illustrative; no provider/model invocation.

Validation: existing VM/state/safety checks with focused intake/scope regressions;
Node assert intake probes; mirror and SHA parity checks. No new framework/mobile
work or repeated broad E2E. One final native offline desktop journey is separate
from hosted owner-auth proof; record actual result in the PR.

## Backend handoff and costs

Canonical contract awsops#90; both repos hold identical intake and scope helpers.
awsops can normalize/plan offline, but its live executor remains disabled. The
personal-LAB AWS connection needs reauthentication for new M3 identity evidence;
no real resource was touched. No new AWS infrastructure/recurring cost; API cost
is never assumed free. Do not widen IAM or apply #89 fixtures to finish a demo.

Native browser launch was unavailable: command sandbox blocked Chromium's socket;
normal escalation failed in the environment wrapper before launch. The cloud
browser rejected file: navigation by policy; that route was not bypassed. The
existing pinned GitHub browser harness now supports the explicit
`validation:defence-finish` label for ONE focused final journey (same server,
browser, download, trace and failure handling). No new framework/browser dependency.
The normal failure-fixture path and default legacy journey remain unchanged.
Actual labelled CI receipt, not a local attempt, determines browser acceptance.
