# Issue42 — loaded release label

The header label is derived at runtime from the same RELEASE constant used by
application evidence. v1.10.0-mock displays as v1.10; accessible label/title retain
the full MOCK version. There is no separate hard-coded display version, network
version fetch, new badge authority, or claim that a main commit is already hosted.
The adjacent SHOWCASE / MOCK badge, theme and commands are unchanged.

Source baseline: main712f0a, accepted PR40/41, prior private publication recorded
in Issue39 comment6192919422. That published HTML has no new header label yet.
The new HTML hash/fingerprint is in RELEASE.json; publication of this exact patch
is NOT_RUN in this source change. Do not claim the screenshot/hosted label passed.

Validation: existing Node VM/state harness plus narrow assertions for release
metadata equality, derived header text, visibility and accessible label. No new
framework, browser suite or mobile milestone. One actual hosted header readback/
screenshot after authorized private publication is separate from human viewer
acceptance. Issue37 remains NOT_RUN; no MOCK result is REAL.
