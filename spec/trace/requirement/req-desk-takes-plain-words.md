---
minted_in: i1
id: req-desk-takes-plain-words
type: "[[requirement]]"
statement: When a person states wanted work at the front desk, the desk shall accept it as free text and shall demand no format of the person.
kind: functional
verify_method: demonstration
breaks_if_removed: The person composes paperwork instead of saying a sentence and the desk's promise fails.
breaks_how_badly: crippling
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 1
  - stk-engineer-driving-agents
  - uc-get-work-routed ext 1a
priority: must
---

## Detail

What the desk does with what it hears:

- When one message carries more than one piece of work, the desk shall sort the pieces and shall recommend a vehicle for each piece on its own.
