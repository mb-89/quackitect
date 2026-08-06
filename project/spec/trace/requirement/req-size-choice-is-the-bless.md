---
id: req-size-choice-is-the-bless
type: "[[requirement]]"
statement: When the person answers the change-size decision, the engine shall record that answer as the bless and compile the column the person named.
kind: functional
verify_method: test
breaks_if_removed: A chosen size needs a second confirmation, or the proposal overrides the person.
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 5
  - uc-open-an-iteration ext 5a
priority: must
---

## Detail

## Detail

- Accepting the proposal compiles the proposed column.
- Naming a different size compiles the named column. No re-argument step exists.
- No separate confirmation follows the choice. The choice is the recorded bless.
