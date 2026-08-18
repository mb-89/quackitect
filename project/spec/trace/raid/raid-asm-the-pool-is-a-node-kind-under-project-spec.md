---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-asm-the-pool-is-a-node-kind-under-project-spec
type: "[[raid]]"
kind: assumption
statement: The options pool is a node kind stored under project/spec/ like every other corpus node, so minting an option needs no store of its own.
owner: the driving agent
trigger: the first mint, or the first sweep that walks a minted option
status: open
impact: This is what makes i17 a minor. If the pool needs its own store, the architecture moves, the minor column is wrong, and M4 through M6 have to open.
breaks_how_badly: crippling
how_likely: conceivable
probed: 2026-08-18
probe: OWED. Express three of the i17 arrival's own findings as pool nodes at M1 and check that the corpus reader loads them, the sweep walks them, and the reference views resolve them - all unchanged. A change to any of the three falsifies it.
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
weighs_with: none
weighs_against: none
---

## Why it is believed

THE CORPUS ALREADY STORES TYPED NODES with frontmatter under `project/spec/`,
and the sweep reads 1304 of them in about half a second. An option carries a
statement, a ready-when and a source - the same shape a register entry carries.

THE DRAIN ALREADY DEMANDS THE HARD PART. `engine/inbox.ts` refuses a backlog
disposition with no `where`, and `where` is the re-entry condition. So the
field the pool needs most is already required at the only door that mints.

## What would falsify it

A pool item that cannot be a corpus node without changing the reader, the
sweep or the views. The likeliest shape of that: an option whose lifecycle
needs states the corpus has no room for, or a volume the sweep cannot carry -
which is the neighbouring assumption about 205 nodes.

## Probe

OWED, and this is how it gets checked. Express three of the i17 arrival's own
findings as pool nodes at M1 - the autonomy word, the identity check's false
reds, the reading probe's verbatim refusal - and then run three passes over the
corpus unchanged:

- the corpus reader loads them
- the sweep walks them
- the reference views resolve them

A CHANGE TO ANY OF THE THREE FALSIFIES IT, and the falsification is loud: it
means the pool needs a store of its own, the architecture moves, and the minor
column this gate proposed is wrong.

WHY THREE AND NOT ONE. One node proves the format parses. Three of different
shapes - a defect, a rule and a question - is the smallest set that shows the
kind carries what an option actually is.
