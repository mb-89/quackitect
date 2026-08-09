---
id: req-state-opens-only-when-earned
type: "[[requirement]]"
statement: The engine shall open a state only when every document it owes is credited and every entry condition holds, naming whatever is missing.
kind: functional
verify_method: test
breaks_if_removed: Work begins on guidance nobody read and inputs nobody produced, which is the failure the whole walk exists to prevent.
breaks_how_badly: fatal
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
  - uc-take-a-step step 6
  - uc-take-a-step ext 6a
priority: must
---

## Detail

Both gates on the doorway:

- The engine shall open a state only when every document the state owes has been credited.
- If the next state's entry conditions do not hold, then the engine shall keep the walk at the current state and name each unmet condition.
