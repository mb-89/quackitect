---
id: req-state-opens-only-read
type: "[[requirement]]"
statement: "The engine shall open a state only when every document the state owes has been credited."
kind: functional
verify_method: test
breaks_if_removed: "Work starts without the method in hand, and the use case's guarantee is void."
refines:
  - uc-be-handed-the-method
  - uc-take-a-step
source_refs:
  - uc-be-handed-the-method step 5
  - uc-be-handed-the-method step 6
  - uc-be-handed-the-method guarantee
  - uc-take-a-step precondition
  - uc-take-a-step ext 2a
  - ".se/req-mine-sebots.md: verification — trust nothing self-attested"
priority: must
---
