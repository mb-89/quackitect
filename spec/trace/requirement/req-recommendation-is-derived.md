---
minted_in: i1
id: req-recommendation-is-derived
type: "[[requirement]]"
statement: When the desk recommends a vehicle, the desk shall derive the recommendation from the state standing at that moment and shall carry every part the Detail table names.
kind: functional
verify_method: inspection
breaks_if_removed: The desk answers from memory and recommends against a system that has moved.
breaks_how_badly: corrosive
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 2
  - uc-get-work-routed step 4
  - uc-get-work-routed step 3
priority: should
weighs_against:
  - req-nothing-a-copy-does-reaches-its-source >
---

## Detail

What the recommendation reads, and what it carries:

- When the desk composes a recommendation, the desk shall derive it from the open records, the pending notes, and the doors standing at that moment.
- When the desk recommends a vehicle, the desk shall recommend the smallest vehicle that honours the gates, and the recommendation shall carry every part the Detail table names.
- When the desk judges a piece of work, the desk shall record its size judgment before it names a vehicle.
