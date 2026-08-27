---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-work-offer-to-work-store
type: "[[interface]]"
statement: The work a hand took is named back to the store, which is the only element that may settle it.
source: el-work-offer
destination: el-work-store
carries:
  - flow-offered-work
form: one call naming the work taken and the hand that took it
bound: inherited — in-process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - raid-dec-the-position-owns-its-work-and-the-merge-cost-is-accepted
---

THE OFFER HANDS OUT AND THE STORE WRITES DOWN. Nothing else may write.

WHAT IT CARRIES. The identity of the work a hand took, and which hand took it.

WHY IT IS NOT THE OFFER'S OWN WRITE. Keeping every write in one element is what
makes the merge surface countable. The decision that accepts that surface
depends on it staying in one place.

FAILURE BEHAVIOUR: work taken twice is refused on the second take, because the
first take already moved its status.
