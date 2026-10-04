# Offline deployment recovery — Issue #16

Repository preparation only. **Live identity, OIDC, AWS operations, deployment
and hosted acceptance: NOT_RUN.** Parent [Issue #14](https://github.com/mytestlab123/agentcore2/issues/14)
retains all private activation gates in the [readiness packet](cloud-deployment-readiness.md).

## Baseline and gap

PR #15 merged at `41bd3a3e0dc6bacbd5db7318fbab32f38487be98`.
Its final preparation head `3c784aed0c080b390650ea323b58ccb34e2167a5`
passed [CI 37116441432](https://github.com/mytestlab123/agentcore2/actions/runs/37116441432).
This task verified clean origin/main and Issue #16 before creating its branch.
Issue #7 / PR #8 remains untouched. No checkout `.agents/skills` is present.

The existing preflight tests covered uncertain create and blocked redispatch,
but not the rest of the lifecycle. The helper had no receipt inspection or
observation-only resume. Old receipts lacked exact ZIP/target binding.

The same helper now uses versioned receipts, exclusive initial reservation,
private-mode files, fsynced file contents and atomic subsequent replacements.
The create intent is saved before CreateDeployment; job ID before upload;
start intent before StartDeployment; observations before completion. Save failure
stops the next operation. Runner loss can still destroy local files, including a
receipt before artifact upload; these local guarantees are not a remote journal.

## Immutable binding and trust limits

Schema v1 binds all of the following:

- Exact frozen C1 source reference, HTML SHA256, MOCK mode and wrapper commit.
- SHA256 of the **whole ZIP**, not just HTML; identical product bytes in a
  different archive are not the original artifact.
- `targetSha256`: SHA256 of canonical JSON (sorted keys, compact separators)
  containing the configured app ARN (account/region/app), exact `showcase-c1`
  branch, and expected assumed-role ARN prefix without its run session.
- Original GitHub run ID, phase, recorded job ID once known, and observed state.
  A later observer may use a new run session on the same role; current caller
  identity and app/branch ownership are rechecked before provider job observation.

No plaintext account, role, app identity, signed URL, provider diagnostic or
endpoint is stored in a new receipt. The target hash is an equality binding,
**not encryption, a signature, approval, or proof of provider truth**. Keep the
original receipt and independently approved target fingerprint together in the
private operator record; never choose the expected hash from an untrusted receipt
just to make it pass. No actual private fingerprint is supplied by this task.

Legacy, missing, truncated, oversized, duplicate-key, unknown-field or inconsistent
receipts fail closed. Do not migrate them by guessing values, delete them to
bypass the gate, or conclude no mutation happened because a receipt is absent.

## One offline inspection command

For an existing receipt and its exact original archive:

```sh
python3 ops/deploy-showcase-c1.py --inspect-receipt \
  --bundle <ORIGINAL_ZIP> --journal <PRESERVED_RECEIPT> \
  --expected-revision <APPROVED_WRAPPER_SHA> \
  --expected-target-sha256 <INDEPENDENTLY_APPROVED_TARGET_FINGERPRINT>
```

Inspection requires no credential/config environment and performs no subprocess,
provider/HTTP access or receipt write. Exit 0 means receipt/binding inspection
succeeded, **not** permission to deploy. Invalid inputs exit nonzero with a fixed
sanitized diagnostic; raw input, exception text and filenames are not echoed.
Successful output contains fixed status/next-action values and
`redispatchAllowed: false`, never arbitrary receipt strings.

| Recorded condition | Next action |
| --- | --- |
| CREATE_INTENT without job ID | Privately reconcile uncertain creation. No automatic resume or redispatch. |
| UPLOAD_INTENT / START_INTENT | Reconcile uncertain write; only existing-job observation can resume. Never repeat PUT or StartDeployment. |
| STARTED / active or no recorded result | Resume bounded observation only after separate authorization. |
| FAILED / CANCELLED | Stop; owner reviews terminal outcome. No retry. |
| HTTP_DIGEST_VERIFIED | Receipt reports source readback complete; browser evidence and owner acceptance still required. Inspection makes no fresh live claim. |
| Missing/invalid/mismatched receipt | Preserve all evidence and reconcile privately. No provider call or new write is attempted by resume. |

## Prepared observation-only resume, not executed live

The same helper accepts `--resume-observation` with the original bundle/journal.
This mode can perform identity/app/branch/GetJob reads and HTTP provenance reads
**only after separate authorization and existing approved private configuration**.
It is not the offline inspection command. No workflow dispatch or new workflow
mode is added here. Do not rerun the existing deployment workflow to resume.

It validates the receipt against current HEAD, the original archive and configured
target/role before any provider call. CREATE_INTENT without an ID and terminal
receipts stop; completed receipts return without new observation. Other valid
receipts revalidate current caller and target, then poll only the recorded job ID
and validate returned job ID/status. There is no CreateDeployment, upload PUT,
StartDeployment, retry or replacement-artifact path in observation-only resume.
HTTP mismatch leaves completion unverified and may be re-observed later without
writes. Polling is bounded; timeout stops with the last receipt preserved.

Use one observer at a time and preserve original evidence. A local receipt does
not replace provider-side reconciliation after runner loss. Unknown private
identity/subject/target, budget, lifecycle and activation approval remain blocks
to live work. No IAM policy, trust template, workflow guard, live Preview B code
or deployment setting is changed by this milestone.

## Reproduce and evidence

```sh
npm ci --no-audit --no-fund --cache /workspace/.npm-cache
npm run verify:cloud -- fast
# Needed only if this frozen public source object is absent in the checkout:
git fetch origin 68aa168f764531697ef34c472f87468ad738e36a --depth=1
npm run verify:cloud -- deployment
```

The existing read-only PR workflow already discovers `ops/tests`; no extra runner
or framework is needed. Browser coverage remains in its separate approved CI job;
no browser is installed in this cloud task.

Synthetic tests cover uncertain create/upload/start/poll, rejected upload, bounded
timeout, terminal FAILED/CANCELLED, interruption at each write/poll boundary,
receipt-save failures, wrong job/state, HTTP mismatch, repeated resume, exact
artifact/target/revision rejection, sanitized CLI output and exclusive reservation.
Fakes count create/PUT/start operations before and after recovery; no real AWS or
HTTP access is used. Synthetic success output is captured to avoid implying live
proof in test logs. Local/full CI results are recorded after verification below.

Local validation in the existing Codex Cloud environment (Node 24.19.0,
Python 3.12.14): npm ci PASS (74 packages); build 7.49 s; 23 contract + 12 harness
tests 4.00 s; typecheck 5.67 s; state/safety 6.01 s. Deployment lane PASS:
31 tests (14 existing + 17 recovery), 0.47 s including interpreter overhead.
Python compilation and diff whitespace PASS. Workflow/IAM templates, root
lockfile and canonical product HTML are unchanged from the approved base.
Draft [PR #17](https://github.com/mytestlab123/agentcore2/pull/17), implementation
head `313674d94e4351f6fc791f5933a261a0b538b427`, passed both jobs in
[CI 37165163502](https://github.com/mytestlab123/agentcore2/actions/runs/37165163502):
fast including 31 deployment tests 32 s; browser 55 s. Repository milestone PASS;
no live result is implied. The existing action-runtime deprecation warning is
nonblocking. Browser failure-artifact upload was SKIPPED because smoke passed.
This closing evidence update changes documentation only; final head and its CI
are recorded in the PR description/handoff rather than a self-referential SHA.
Next gate remains owner review of the private identity/target/budget/lifecycle
and activation packet in #14. No merge, live observation or deployment occurred.
