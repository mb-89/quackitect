---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-desk-greets-walkable
type: "[[requirement]]"
statement: When a session first enters the desk, the desk shall greet the person with every door walkable at that moment.
kind: functional
verify_method: demonstration
breaks_if_removed: The newcomer faces a silent prompt with no notion of what can happen next.
breaks_how_badly: corrosive
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect step 6
  - uc-install-quackitect guarantee
  - stk-newcomer
priority: should
weighs_against:
  - req-reachable-capability-is-traced >
---
