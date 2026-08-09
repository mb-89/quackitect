---
id: req-instruction-names-its-source
type: "[[requirement]]"
statement: The engine shall name, on every served instruction, the source file it compiles from.
kind: functional
verify_method: test
breaks_if_removed: A driver judging guidance wrong cannot find where it compiles from, so the correction lands in a copy and takes no effect.
breaks_how_badly: corrosive
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk step 1
  - uc-change-the-method-mid-walk step 2
  - uc-change-the-method-mid-walk ext 5a
  - ".se/req-mine-sebots.md: capture, decisions, change"
priority: should
weighs_against:
  - req-fallen-condition-named >
---

## Detail

What travels with the instruction:

- Where a walk-governing rule records a settled decision as its source, the engine shall serve that decision's reference with the guidance.
