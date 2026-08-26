---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-iss-no-write-verb-announces-the-door-refusals-before-firing-them
type: "[[raid]]"
kind: issue
statement: A write verb's description says nothing about the guards that refuse it, so an author meets SE-C-146, SE-C-149 and SE-C-150 for the first time as a refusal.
owner: the maintainer
trigger: any change to a write verb's description, and the next record that adds a door
status: open
breaks_how_badly: annoying
how_likely: expected
impact: "An author spends a round learning a rule that could have been fed forward. Measured on this record: the departure refusal was met by its own builder as a surprise."
weighs_with: none
weighs_against: none
---

## What is wrong

The craft rule is ONE TABLE, THREE OUTPUTS: where a rule is enforced, the
warning it prints and the tool description that announces it generate from one
table, so feed-forward and feedback cannot drift apart.

Three clauses are enforced on the write path and none of them is announced.
`deliverable/engine/tools.ts` mentions no departure, no governed reach and none
of the three clause numbers.

## Why the obvious fix is the wrong one

Hand-writing a sentence into each verb's description is a second copy of a rule
the guard already holds. That is the drift this very rule exists to stop, and it
would go stale the first time a door's wording changed.

The fix is a generated line, off the same door table the guard reads.

## What it is not

It is not new with this record. SE-C-146 has carried the same hole since the
widget guard shipped, and this record inherited the shape rather than
introducing it.
