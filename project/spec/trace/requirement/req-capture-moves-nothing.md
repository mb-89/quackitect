---
id: req-capture-moves-nothing
type: "[[requirement]]"
statement: When a stray is captured, the engine shall leave the walk unchanged, with zero state transitions and zero plan changes caused by the capture.
kind: functional
verify_method: test
breaks_if_removed: Capturing a finding abandons the state in hand — the exact failure the note lane exists to prevent.
breaks_how_badly: crippling
refines:
  - uc-capture-a-stray
  - uc-change-the-method-mid-walk
source_refs:
  - uc-capture-a-stray step 3
  - uc-capture-a-stray ext 1a
  - uc-change-the-method-mid-walk ext 5a
  - ".se/req-mine-sebots.md: rumination — dissent is a captured note"
priority: must
---
