---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-work-store-to-work-offer
type: "[[interface]]"
statement: Every piece of work the store holds is readable by the offer, which never writes one.
source: el-work-store
destination: el-work-offer
carries:
  - flow-work-item
form: a read over the store's work, per position
bound: inherited — in-process, and the most frequent read in the pair
source_refs:
  - decompose-structure, the element matrix's owed cell
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

THIS IS THE READ AND WRITE SPLIT, and it is the whole reason the two elements
are two.

WHAT IT CARRIES. Each piece of work with its identity, its place, its status,
its difficulty, and whatever predecessor it declares.

A PREDECESSOR IS ONE OF TWO KINDS and the contract carries which. It names
another piece of work with the outcome it must reach, or it names a POSITION
that must finish. The offer withholds on either and reads them the same way.

THE DIRECTION IS ONE WAY. The offer reads and never writes, so a wrong read
shows a wrong number and loses nothing.

WHY THE COUNT IS NOT ON THE WRITE PATH. Every look at a position counts what it
owes; only entering one mints. Folding the two would put a derivation on every
entry into every position, which is what the round's sharpest open assumption is
about.

FAILURE BEHAVIOUR: an unreadable piece of work is reported rather than skipped.
A count that quietly omits one is worse than a count that refuses.
