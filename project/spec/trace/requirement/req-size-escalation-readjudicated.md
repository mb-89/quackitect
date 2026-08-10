---
id: req-size-escalation-readjudicated
type: "[[requirement]]"
statement: If mid-walk work outgrows the blessed change size, then the engine shall surface the escalation and obtain a fresh person adjudication before the added work proceeds.
kind: functional
verify_method: test
verified_by:
  - "tests/iterations.test.ts :: escalation reopens exactly the grown steps"
  - "tests/iterations.test.ts :: the pin: the bless compiles the change size live; escalation only grows it"
breaks_if_removed: The walk outgrows its column silently and the struck rigor never returns.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration ext 6a
priority: must
---
