---
id: req-chain-reaches-the-proposition
type: "[[requirement]]"
statement: "The engine shall count every node lacking an unbroken upward chain to a proposition as a coverage defect, with zero orphans passing the check."
kind: functional
verify_method: test
breaks_if_removed: "A why-question dead-ends mid-chain a year later, answered from memory."
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin step 5
  - uc-trace-a-decision-to-its-origin ext 3a
  - ".se/req-mine-v2.md: spec discipline"
priority: should
---
