---
minted_in: i2
id: req-walk-branches-at-waypoint
type: "[[requirement]]"
statement: When a completed leg leaves its busbar waiting, the walk shall return to the fork the legs hang off and offer the next owed leg from there, without an escape; the drawn route shall follow that same path.
kind: functional
verify_method: test
breaks_if_removed: Every busbar costs an escape-and-aim round trip per leg, and the panel draws the loop-the-machine line the owner called insane.
breaks_how_badly: corrosive
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step
priority: should
weighs_against:
  - req-pin-writes-seeded-scaffolds >
---
