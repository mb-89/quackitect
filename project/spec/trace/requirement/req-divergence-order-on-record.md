---
id: req-divergence-order-on-record
type: "[[requirement]]"
statement: "The engine shall record the order in which the problem, each option and the choice were entered."
kind: functional
verify_method: inspection
breaks_if_removed: "Options back-filled after a made decision read exactly like real divergence, and ratification is undetectable."
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding ext 1a
priority: could
---
