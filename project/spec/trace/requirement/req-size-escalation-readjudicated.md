---
id: req-size-escalation-readjudicated
type: "[[requirement]]"
statement: If mid-walk work outgrows the blessed change size, then the engine shall surface the escalation and obtain a fresh person adjudication before the added work proceeds.
kind: functional
verify_method: test
breaks_if_removed: The walk outgrows its column silently and the struck rigor never returns.
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration ext 6a
priority: must
---
