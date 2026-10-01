# MOCK-first dashboards: the Contextual Copilot practice

Use an attractive, deterministic showcase to learn the operator workflow before
connecting infrastructure. This v1.2 case was authored and accepted in ChatGPT
Work / @Sites, then exported back to Git. The portable file preserves the accepted
Site exactly. It is an interaction prototype, not evidence of production security,
AWS throughput, provider mutation or enterprise readiness.

Case: [public Site](https://contextual-copilot-mock.amit-6719.chatgpt.site/) ·
[durable Issue #9](https://github.com/mytestlab123/agentcore2/issues/9) ·
[source and release mapping](../showcases/chatgpt-sites-preview-b/README.md).

## The feedback loop

1. Define audience, one operator task and the hard MOCK boundary.
2. Reuse the real product's terms and layout. Make the table useful before AI.
3. Generate realistic invented records with known, repeatable scenarios.
4. Model decisions and failure states before adding visual polish.
5. Build in Work / @Sites. Review the actual hosted result, then give precise
   feedback about a named table, control, dialog or state.
6. Test the meaningful journey: filter → select → preview → reject/approve →
   evidence. Inspect narrow-screen and keyboard behavior separately.
7. Save exact source/version/fingerprint, tests, evidence and limitations in Git.
8. Connect a real backend only as a separately authorized engineering project.
   Never turn a polished mock approval button into provider authority by accident.

Mocking removes infrastructure setup from the early feedback loop and makes
failures repeatable. It does not remove the later need to test authentication,
authorization, concurrency, data freshness and real provider results.

## Front-end vocabulary in ten short points

1. HTML gives the page structure and meaning: headings, tables, buttons.
2. CSS controls layout, color, typography, spacing and responsive behavior.
3. JavaScript changes state when a person filters, selects or makes a decision.
4. A component is a reusable interface unit, such as a table or command menu.
5. State is the current data and choices; rendering turns it into visible UI.
6. A design system keeps colors, spacing and common controls consistent.
7. Responsive layout adapts to screen width; it needs actual mobile review.
8. Accessibility makes controls usable with keyboards and assistive technology.
9. Progressive disclosure reveals detail when needed, keeping the main task clear.
10. E2E tests operate the rendered app; unit/state tests inspect narrower behavior.

## Ten reusable components without clutter

| Component | Why it earns space | Use in this case / future prompt |
| --- | --- | --- |
| Data Table | Scan, filter, compare and select many resources | “Keep the table primary; support compatible bulk selection.” |
| Command menu | Quickly reach a known action or filter | “Scrollable Ctrl+K menu with predefined commands; never auto-approve.” |
| Overview and chart | Explain scale and help narrow scope | “Computed synthetic counts; clicking severity filters the table.” |
| Filters and pagination | Find relevant rows without rendering every record | “One filter state; distinguish filtered count from inventory total.” |
| Tabs | Separate context, proposed change and evidence | “Context / Change / Evidence; show one view at a time.” |
| Inspector dialog | Show detailed facts without another permanent panel | “Open exact selected-resource details in an accessible dialog.” |
| Tooltips | Explain unfamiliar actions without constant prose | “Short contextual hints; keep critical warnings visible.” |
| Progress and outcomes | Make a long batch understandable | “Simulated progress; VERIFIED / BLOCKED; no hidden retries.” |
| Resizable panels | Let operators prioritize table or detail | “Keyboard and pointer resizing on desktop; stack on mobile.” |
| Collapsible learning area | Teach architecture and scenarios on demand | “Keep advanced demo controls under Learn / Demo.” |

Use a component because it reduces effort for the operator. Avoid adding
widgets merely because they exist. This accepted static project uses semantic
HTML/native primitives; a future Sites framework project can reuse its installed
component library without rewriting this product into a different design.

## Bulk fixing: model authority before the button

A real 1,000-bucket operation needs exact scope, permissions, current provider
state, request evidence and bounded failure/retry handling. The mock teaches the
interaction contract, not those real execution guarantees.

- Filter to one resource type/control; select actionable compatible targets.
- Distinguish this page, all matching compatible rows and “up to 1,000”.
- Freeze IDs, account/region, control, capability, revisions and parameters.
- Preview before/after and offer the complete target snapshot before approval.
- Consume one decision once. Reject produces zero writes; stale scope fails early.
- Keep provider write, provider readback and compliance evaluation distinct.
- Report partial outcomes per target. Do not silently retry blocked targets.
- Keep the current finding separate from last-run evidence. Replay is visual only.

In v1.2, 1,000 compatible BPA targets approve to 1,000 simulated writes; with
every-17th blocking, 942 verify and 58 remain NON_COMPLIANT. Every real-write
count is zero. The command menu can prepare this batch but cannot approve it.

## Scale and visual strategy

Generate actual records rather than inventing headline counts. Here 58 LAB
labels produce 49,476 baseline records, with one illustrative control per
resource; the largest uniform scenario produces 75,400. Mount 25 table rows,
not tens of thousands of DOM elements. Keep overview inventory counts and table
filtered counts explicitly separate. Node VM timings are not browser performance
benchmarks. A mock dataset does not establish production-scale readiness.

Use a compact type hierarchy, consistent spacing, explicit status text, light/
dark contrast and restrained color. Keep the right panel tied to the focused
finding. Put scenarios, architecture and teaching material behind one collapsed
area. Avoid a generic chatbot that loses the operator's resource context.

## Browsing and feedback: what is actually visible

On 2026-10-01 the owner-selected public access setting was confirmed through
Sites. The web reader returned “Internal Error” for the URL, while the cloud
Chrome browser opened the actual v1.2 page and Playwright-backed controls worked.
The retrieval error's root cause was not established. It is not proof that the
Site is private, unavailable, or blocking automated browsers.

| Surface | Good for | Limit |
| --- | --- | --- |
| Web search / page reader | Finding sources and reading retrieved text | Not a substitute for rendered interaction testing |
| Work browser / Computer Use | DOM, screenshots, clicks and verification on a connected page | Does not automatically see the user's regular Chrome or arbitrary side panel |
| Playwright test runner | Repeatable desktop/mobile E2E, requests and page errors | Needs an available browser executable and test environment |
| Chrome DevTools tooling | Layout, console and network diagnostics | Requires an exposed/connected tool; not assumed from a public URL |

This session's browser exposed Playwright-backed locators and console reading.
It did not expose a separate Chrome DevTools MCP or viewport-emulation API.
The local Playwright module had no Chromium executable, and the standard official
installer returned an invalid/truncated ZIP. Desktop interaction proof therefore
exists; offline/mobile E2E is still unverified. Blob download completion
timed out in the cloud tool and must be checked independently. Do not broaden a
PASS from one surface into claims about another.

For precise feedback, name the visible component and outcome: “In Findings,
after filtering S3 BPA, make selection scope clearer.” When a connected browser
can open the page, a screenshot from the user is not required for DOM-based
feedback. When visual context cannot be inspected, provide an annotation or
attachment. A missing image path is not a screenshot the agent has seen.

For deeper diagnostics in supported desktop environments, OpenAI documents
Developer mode under Settings → Browser → Enable full CDP access, using
@Browser or @Chrome. It requires the supported connection and explicit access
approval; this session did not enable it. A public URL alone does not create
that tool connection. The current cloud browser was sufficient for the focused
interaction checks.

Official references: [Sites](https://learn.chatgpt.com/docs/sites),
[Work browser and comments](https://learn.chatgpt.com/docs/browser),
[Playwright emulation](https://playwright.dev/docs/emulation).

## Version, rollback and long-term reuse

Keep a human GUI version plus machine-checkable identity. `RELEASE.json` maps
v1.2.0 to accepted Site source commit, saved version 3, exact HTML SHA-256 and
GUI fingerprint. The upstream PR commit identifies the documentation/test sync;
it is a different repository commit from the Site source commit. No Git tag is
claimed unless one was actually created.

Retain saved Site version 2 for rollback. Redeploy it on the same Site, preserving
the current owner-selected audience. Never reset history or recreate the Site
just to revert a GUI. Exclude hosting IDs, tokens and credentials from public
learning documents. Reuse the existing Issue and one PR through review fixes.

Carry forward this small kit: accepted page source, reusable Site prompt,
synthetic generator/scenarios, explicit decision state machine, state harness,
offline E2E smoke, sanitized proof with limitations, source identity and rollback
instructions. This captures the practice without creating another framework.
