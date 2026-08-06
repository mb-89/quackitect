---
id: req-land-demands-fresh-green
type: "[[requirement]]"
statement: "When the walk reaches the land gate, the engine shall run the full battery and refuse the advance while any test fails."
kind: functional
verify_method: test
breaks_if_removed: "Red work reaches trunk behind a stale green verdict."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 3
  - uc-land-work-on-trunk ext 3b
  - uc-land-work-on-trunk ext 3a
  - ".se/req-mine-v1.md: tests and the battery"
priority: must
---

## Detail

What the gate demands of the battery:

- When the walk reaches the land gate, the engine shall run the full battery and accept zero cached verdicts in its place.
- While the battery reports one or more failing tests, the engine shall refuse advance past the land gate and offer zero paths to mark a test known-broken.
