---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-record-store-to-work-store
type: "[[interface]]"
statement: The record store says which position the walk stands in, and the work store answers only for that position's work.
source: el-record-store
destination: el-work-store
carries:
  - flow-position
form: a read of the standing position, on every mint, place and settle
bound: inherited — in-process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

WORK BELONGS TO A POSITION, and the position comes from here.

WHAT IT CARRIES. Which record is open, which position stands inside it, and
whether that record is still open at all.

WHY IT MATTERS AT THE CLOSE. The record store owns closing, and closing is when
the work store folds its files into one. This crossing is what tells it to
fold.

FAILURE BEHAVIOUR: no open record means no position, so a mint has nowhere to
land. The store refuses rather than minting into nothing.
