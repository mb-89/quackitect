---
id: req-autonomy-change-applies-forward
type: "[[requirement]]"
statement: When the autonomy setting changes mid-walk, the engine shall apply it from the next pull onward and shall record the change.
kind: functional
verify_method: test
verified_by:
  - "tests/route.test.ts :: the route weighs the slider hop by hop and names where it stops"
breaks_if_removed: A dial that only takes effect at a restart is not a live control, and an unrecorded change cannot be audited.
breaks_how_badly: crippling
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy step 1
  - uc-set-the-autonomy trigger
  - ".se/req-mine-sebots.md: the person's dial and the manual path"
  - uc-set-the-autonomy ext 4b
  - uc-set-the-autonomy step 2
  - ".se/req-mine-v1.md: the ledger and truth"
priority: must
---

## Detail

The one change, and what it binds:

- While a walk is in progress, the engine shall accept a new autonomy setting and apply it from the next pull onward, with zero restarted states.
- When the autonomy setting drops mid-walk, the engine shall stop at the next hop above the new setting while keeping every hop already taken.
- When the autonomy setting changes, the engine shall record exactly one durable entry carrying the prior value, the new value, and the time of the change.
