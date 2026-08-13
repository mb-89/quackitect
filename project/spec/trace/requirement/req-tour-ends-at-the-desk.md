---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-tour-ends-at-the-desk
type: "[[requirement]]"
statement: When the last stop completes, the tour shall return to the front desk and show the offer list.
kind: functional
verify_method: demonstration
breaks_if_removed: The tour dead-ends; what was learned never connects to what to ask for.
breaks_how_badly: corrosive
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery step 5
priority: could
---
