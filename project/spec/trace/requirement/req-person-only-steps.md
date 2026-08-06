---
id: req-person-only-steps
type: "[[requirement]]"
statement: "Where a step is marked above every autonomy setting, the engine shall accept that step's completion from a person's own hand alone."
kind: functional
verify_method: test
breaks_if_removed: "An agent can pass a step only a person may pass, and the gate's authority is gone."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy ext 4a
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
priority: must
---

## Detail

## Detail

- No setting value grants passage; the ceiling sits above the dial's whole range.
- The person's completion is recorded as the person's own act.
