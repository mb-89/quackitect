---
minted_in: i1
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
weighs_against:
  - req-tour-highlights-the-named-part > — a tour that never connects to an ask wastes the whole tour; a missing highlight wastes one stop
---
