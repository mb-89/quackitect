---
id: req-rejection-holds-the-walk
type: "[[requirement]]"
statement: "When a gate verdict is a rejection, the engine shall hold the walk at the gate with the evidence form open for refill."
kind: functional
verify_method: test
breaks_if_removed: "A rejected gate lets work continue on top of what the person judged not good enough."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 5a
priority: must
---
