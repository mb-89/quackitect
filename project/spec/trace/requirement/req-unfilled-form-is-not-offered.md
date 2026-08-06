---
id: req-unfilled-form-is-not-offered
type: "[[requirement]]"
statement: "If the gate's evidence form holds an unfilled field, then the engine shall refuse to offer the gate for adjudication."
kind: functional
verify_method: test
breaks_if_removed: "The person adjudicates a hole, and the use case's precondition is silently waived."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate precondition
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
priority: should
---
