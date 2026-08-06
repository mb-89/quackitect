---
id: req-gate-needs-a-persons-verdict
type: "[[requirement]]"
statement: When the walk reaches a gate, the engine shall hold the walk until a person's verdict is recorded.
kind: functional
verify_method: test
breaks_if_removed: An agent blesses its own work and the gate stops meaning anything.
refines:
  - uc-adjudicate-a-gate
  - uc-land-work-on-trunk
source_refs:
  - uc-adjudicate-a-gate step 1
  - uc-adjudicate-a-gate step 6
  - uc-adjudicate-a-gate step 5
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
  - uc-adjudicate-a-gate ext 5a
  - uc-land-work-on-trunk step 2
  - uc-land-work-on-trunk step 5
priority: must
---

## Detail

Every moment the rule binds:

- When the walk reaches a gate, the engine shall halt the walk until a person's verdict is recorded.
- The engine shall record a gate verdict only from a channel a person holds.
- When a gate verdict is a rejection, the engine shall hold the walk at the gate with the evidence form open for refill.
- The engine shall advance the walk past the land gate only on a person's bless.
