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
