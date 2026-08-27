---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: req-the-raw-note-stays-local-and-is-marked-drained
type: "[[requirement]]"
statement: When an option is minted, the system shall mark the source note drained and shall leave the note where it is, neither moving it, copying it into the repository, nor deleting it.
kind: constraint
verify_method: test
breaks_if_removed: Two of the three wrong endings are silent. Copying the note into the repository is the leak the whole boundary exists to stop. Deleting it destroys the only record of what was actually captured, and SE-C-002 means it cannot be recovered. Leaving it undrained puts it back in the next retro inbox, which is how one finding gets minted twice.
breaks_how_badly: crippling
refines:
  - uc-put-a-finding-where-it-outlives-the-machine
source_refs:
  - raid-risk-the-option-and-its-note-drift-apart
  - vp-the-ledger
priority: must
---

## Detail

| after a mint | binding |
| --- | --- |
| the note file | unchanged in place, in the machine-local store |
| the note's disposition | drained, so it leaves the inbox count and the pending feed |
| the repository | carries the option and no part of the note's own text |

THE DRIFT IS ACCEPTED, NOT MITIGATED. Two objects with different lifetimes can
stop describing each other and nothing will notice. That is the price of the
privacy boundary, it is on the register as expected damage, and the ruling is
that THE OPTION IS THE TRUTH FROM THE MINT ONWARD. This row does not try to
keep them equal; it only stops either from being destroyed.

## Pass line

Metric: mints after which the note file changed, vanished, or stayed pending.
Target: zero.

## Addition — work tokens

TWO THINGS THIS ROW ALREADY DEMANDS NOW BIND EVERY PIECE OF WORK, not only a
note at its mint.

PRIVATE STAYS OFF TRUNK. Anything marked private is refused a write into
version control, whatever kind of item it is. Private and committed are
incompatible, so two homes is what privacy costs rather than an
implementation choice.

PLACE AND STATUS DO NOT MOVE TOGETHER. Marking a note drained leaves it
where it is; the same separation binds a work token. Moving one leaves its
status untouched, and settling one leaves its place untouched. Routing work
out of scope therefore returns it to having no home rather than marking it
finished.
