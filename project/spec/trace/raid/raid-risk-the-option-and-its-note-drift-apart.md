---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-risk-the-option-and-its-note-drift-apart
type: "[[raid]]"
kind: risk
statement: "The raw note and the minted option are two objects with different lifetimes, so the option can stop describing what the note said and nothing notices."
owner: the driving agent
trigger: "the first time a minted option is re-read against the note it came from, or the first migration"
status: open
impact: "Two objects is the price paid for the privacy boundary, and drift is what that price buys. An option that no longer matches its note is not wrong in any way a check can see - it is simply about something else, and the pool's whole worth is that a later reader can trust what it says."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
weighs_with: none
weighs_against: none
---

## Where it comes from

RULED AT M1, CONFLICT ONE. Both halves of the seed are absolutes - the pool
must travel, a raw note must never travel - and the rewrite is what makes both
true. Nothing is copied, so there are two artifacts.

LINEAR AND GITHUB BOTH AVOID THIS by keeping ONE object end to end
(ref-triage-and-option-pools-2026). They can, because their capture is already
inside the shared system. Ours cannot.

## Why expected rather than plausible

DRIFT NEEDS NO EVENT. It happens by the note being edited, or by the option
being amended, or by neither - the two simply stop being checked against each
other, because after the drain nobody has a reason to open the note again.

## What would reduce it

- THE OPTION CARRIES ITS NOTE'S REF, so the pair is at least findable. Cheap,
  and it does not stop drift, it makes drift visible.
- THE NOTE IS MARKED DRAINED AND CLOSED TO EDITS after the mint. Then only one
  side can move.

## What is accepted

THE OPTION IS THE TRUTH FROM THE MINT ONWARD. That is the design, not a
mitigation: a reader of the pool reads the option, and the note is history.
This entry exists so nobody later reads the pair as two views of one thing.
