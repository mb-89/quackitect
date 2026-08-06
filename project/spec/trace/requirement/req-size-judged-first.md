---
id: req-size-judged-first
type: "[[requirement]]"
statement: "When the desk judges a piece of work, the desk shall record its size judgment before it names a vehicle."
kind: functional
verify_method: inspection
breaks_if_removed: "Vehicle choice floats free of size and every piece of work drifts into the heaviest record."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 3
priority: could
---
