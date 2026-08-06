---
id: req-form-machine-built
type: "[[requirement]]"
statement: "When a state owes evidence, the engine shall build the evidence form itself and hand it over with every field named and typed."
kind: functional
verify_method: test
breaks_if_removed: "The agent invents the record's shape, and no two states' evidence compare."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step step 4
  - ".se/req-mine-v1.md: the lane — mediated I/O"
priority: should
---
