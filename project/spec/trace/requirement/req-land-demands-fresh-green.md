---
minted_in: i1
id: req-land-demands-fresh-green
type: "[[requirement]]"
statement: When the walk reaches the land gate, the engine shall run the full battery to its end and refuse the advance while any test fails.
kind: functional
verify_method: test
breaks_if_removed: Red work reaches trunk behind a stale green verdict.
breaks_how_badly: fatal
refines:
  - uc-land-work-on-trunk
  - uc-let-the-system-catch-up
  - uc-answer-a-question-with-tests
  - uc-adjudicate-a-gate
source_refs:
  - uc-land-work-on-trunk step 3
  - uc-land-work-on-trunk ext 3b
  - uc-land-work-on-trunk ext 3a
  - ".se/req-mine-v1.md: tests and the battery"
  - uc-let-the-system-catch-up step 5
  - ".se/req-mine-sebots.md: verification — trust nothing self-attested"
  - uc-answer-a-question-with-tests ext 6b
  - uc-adjudicate-a-gate step 3
priority: must
---

## Detail

What the gate demands of the battery, and how it reads the answer:

- When the full battery runs, the engine shall run its whole scope and report every failure at the end.
- The land-gate form shall present the battery verdict as a field filled from the recorded run result, never from an agent's claim.

What the gate demands of the battery:

- When the walk reaches the land gate, the engine shall run the full battery and accept zero cached verdicts in its place.
- While the battery reports one or more failing tests, the engine shall refuse advance past the land gate and offer zero paths to mark a test known-broken.
