---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: if-satellite-to-walk-engine
type: "[[interface]]"
statement: A write a satellite serves reaches the walk engine's guard before it lands, carrying the content as it would be written.
source: el-satellite
destination: el-walk-engine
carries:
  - flow-dispatched-call
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
  - fn-run-a-governed-walk.guard-a-write
  - req-a-write-that-breaks-the-corpus-refuses
  - "owner ruling 2026-08-16: write the interface, stay at minor"
---

The crossing the write guard demands. A satellite serves the write; the
guard that decides whether it may land lives in the walk engine.

## What crosses

THE CALL AS IT WAS MADE, and the content it would write. Not the file on
disk — the guard's whole point is that it sees the write BEFORE anything
lands, so the bytes travel rather than a path to read afterwards.

## Why it is synchronous where the account crossing is append

`if-satellite-to-account` appends and does not wait. This one waits,
because the answer decides whether the write happens at all.

THAT IS THE COST OF CONFORMANCE AT THE WRITE, and it is the thing
`raid-asm-a-bound-check-runs-inside-the-write-budget` measures. A write
today costs 4 to 12 ms against a 1000 ms budget, so the round trip has
room; a check that spends it belongs in the sweep instead, per
`req-a-check-too-slow-for-the-write-moves-to-the-sweep`.

## What comes back

ONE OF TWO THINGS, and never both.

- A REFUSAL, typed, naming the file, the line, the offending value and
  the fix. Nothing lands.
- THE WRITE, landing, with any standing break REPORTED on the result.

The seam between them is
`raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus`, and
it turns on whether the break arrived with this write.

## Why it did not exist before

NOTHING IN THE WALK ENGINE CONSUMED A DISPATCHED CALL. It served steps,
judged claims and answered capability questions, all of which start from
a form or a query rather than from a write.

THE COMPUTED ELEMENT MATRIX FOUND THE GAP, not a reviewer. Allocating
`guard-a-write` made the crossing owed, and the matrix named the cell
with no interface in it.
