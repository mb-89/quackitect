---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-work-outlives-its-state-or-goes-with-it-and-says-which
type: "[[requirement]]"
statement: The system shall carry on every piece of work which of two lifetimes it has, keeping finished work that belongs to the record with the state that finished it and removing temporary work when its state completes.
kind: functional
verify_method: test
breaks_if_removed: Nothing says whether a finished work token is part of the record or a scaffold, so either the archive fills with scaffolding or the record loses the evidence its own states produced.
breaks_how_badly: crippling
refines:
  - uc-work-a-states-work-tokens-to-completion
  - uc-read-what-the-system-owes-and-what-it-is-doing
source_refs:
  - "record.md line 38: an ephemeral token is minted when a state is first entered and disappears when it is done; a durable token is seeded once, and when it is done it stays with the state where that happened"
  - req-work-outside-a-record-goes-when-its-state-completes
  - req-settled-work-is-the-evidence-inside-a-record
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

TWO LIFETIMES AND THE WORK ITSELF SAYS WHICH.

| lifetime | where it comes from | what happens when it is done |
| --- | --- | --- |
| temporary | minted when the state is first entered | it goes when the state completes |
| lasting | seeded once, into the record | it stays with the state that finished it, and stops being displayed |

STOPS BEING DISPLAYED IS NOT THE SAME AS GONE. Finished work belonging to the
record is what a later reader follows, and what a gate judges on. It leaves
the count and it does not leave the record.

THIS ROW AND THE OUTSIDE-A-RECORD ROW ARE NOT THE SAME DEMAND, and the
difference is worth stating. That row says a state with no record around it
keeps nothing. This one says the two lifetimes exist at all, and that a
finished lasting work token has a home.

WHAT DECIDES WHICH ONE A PIECE OF WORK HAS is the design's to choose. The
record's own rule of thumb is that minting on entry makes it temporary and
seeding makes it lasting, and this row demands the distinction rather than
that mechanism.
