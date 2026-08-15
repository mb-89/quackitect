---
minted_in: i2
id: req-autonomy-is-categorical
type: "[[requirement]]"
statement: The session autonomy shall be a categorical tier - operational, tactical, strategic, with emergency above - and no numeric autonomy value and no slider shall remain on any surface, state note or guidance page.
kind: functional
verify_method: inspection
breaks_if_removed: The retired 0-to-1 scale contradicts the owner's ruling on every surface it survives on, and the tier vocabulary the states already carry stays half-wired.
breaks_how_badly: corrosive
refines:
  - uc-set-the-autonomy
source_refs:
  - uc-set-the-autonomy
priority: should
weighs_against:
  - req-nodes-scoped-to-iteration =
---

## Detail

- The state levels already speak the tiers (operational, tactical,
  strategic); the session control and the weighing machinery cut over to
  the same words.
- Cut over, then remove - never both in one commit
  (raid-risk-autonomy-rework-breaks-walking carries the mitigation).
- The mapping of which tier gates and blesses sit at is the owner's call
  at cut-over, recorded when made.
