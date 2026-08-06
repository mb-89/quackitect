---
id: req-lowered-setting-binds-forward
type: "[[requirement]]"
statement: "When the autonomy setting drops mid-walk, the engine shall stop at the next hop above the new setting while keeping every hop already taken."
kind: functional
verify_method: test
breaks_if_removed: "A lowered dial either fails to bind or rolls back finished hops."
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy ext 4b
priority: should
---

## Detail

## Detail

- Hops already taken stand; zero rollbacks follow a lowered setting.
- The new setting binds from the next weighing onward.
