---
minted_in: i27
id: req-a-shipped-record-is-never-reclaimed
type: "[[requirement]]"
statement: When a record ships, the engine shall mark its claim spent in the ledger, and shall refuse entry to it thereafter from every machine including the one that shipped it.
kind: functional
verify_method: test
breaks_if_removed: The ledger shows finished work as a live holding forever, so a peer asking what is free cannot tell work in progress from work that is over.
breaks_how_badly: crippling
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-close-a-record
  - "owner ruling 2026-08-13: there is not going to be another i8"
  - "observed 2026-08-13: two shipped records stood in the ledger reading as live claims"
priority: must
---

## Detail

A CLAIM WAS TAKEN AT ENTRY AND NOTHING EVER ENDED IT. Both shipped
records stood in the ledger as live holdings on 2026-08-13.

A RELEASE AND A COMPLETION ARE NOT THE SAME ACT, and conflating them was
the hole. A force-release hands a record back to the pool and the next
machine may take it. This ENDS it.

So the ledger needs two words, and the spent one closes the door.

## Including the machine that shipped it

The check stands AHEAD of the holder branch on purpose. A holder's own
claim normally admits it back in, so without that ordering the machine
that finished the work walks it a second time - into a record whose
evidence already stands signed and whose worktree is gone.

## Why the ledger and not the record

The record's own status says shipped already, and it says so on a branch
nobody fetches by default. THE LEDGER IS THE ONE FILE EVERY MACHINE
READS BEFORE IT ENTERS ANYTHING, so it is the only place a completion
actually reaches a peer.

## Behaviour

A STATE MODEL EARNED ITS PLACE and is owed at design. A claim has four
states - unclaimed, claimed, released, done - and exactly one of the
transitions is terminal. Which transitions exist and which are refused
is the whole content of this row.
