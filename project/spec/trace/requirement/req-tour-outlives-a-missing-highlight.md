---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-tour-outlives-a-missing-highlight
type: "[[requirement]]"
statement: If the panel cannot highlight the named part, then the stop shall run without the highlight and the engine shall record the miss as a defect against the tour.
kind: functional
verify_method: test
breaks_if_removed: One unhighlightable part kills the tour, or the miss vanishes unrecorded.
breaks_how_badly: crippling
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery ext 3a
priority: could
---
