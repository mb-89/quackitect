---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-begin-says-own-window
type: "[[requirement]]"
statement: When the scaffold completes, the engine shall state that the new product opens in its own window and that the current product keeps running.
kind: functional
verify_method: demonstration
breaks_if_removed: The person waits in the old window for a hand-off that never comes.
breaks_how_badly: abrasive
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 4
  - uc-begin-a-product step 5
priority: could
weighs_against:
  - req-colors-are-configuration > — a person waiting for a hand-off is felt now; palette drift is felt at the next theme change
---
