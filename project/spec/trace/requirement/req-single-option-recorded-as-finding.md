---
id: req-single-option-recorded-as-finding
type: "[[requirement]]"
statement: If exactly one option stands when divergence ends, then the engine shall record the outcome as a finding naming the suspected constraint, never as a choice.
kind: functional
verify_method: test
breaks_if_removed: A one-option outcome passes as a decision, and an over-constrained problem is never surfaced as a finding.
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding ext 3a
priority: could
---
