---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-complexity-rides-the-cell-the-compiled-state-already-carries
type: "[[option]]"
cluster: the-sizing
question: where the difficulty number comes from
statement: "the complexity is a value on the matrix cell beside its applies word, compiled onto the state exactly as the cell's prose already is, so obtaining a step's difficulty is a field read on the state the walker is already holding"
found_by: probe
source: "probe 4 at find_by_probing — reading engine/rigor-matrix.ts to find where a per-column value could land"
---

## Mechanism

THE PER-COLUMN CHANNEL ALREADY EXISTS AND ALREADY RUNS. Found by reading, not
by reasoning: `cellsOf` at engine/rigor-matrix.ts:417 builds a RigorMatrixCell
for every row and every column, carrying `applies` from `fm[col]` and `body`
from `fm[col + "_note"]`. `compileColumn` at :609 pulls that cell and folds its
body into the compiled state's guidance at :612.

SO THE PROSE OF A CELL ALREADY REACHES THE WALKER AND ITS VALUE DOES NOT.
`cell.applies` is read once, at :593, to decide whether the row is in the machine
at all. Nothing else about the cell survives as data.

WHAT THIS OPTION IS. A third cell key beside those two — the complexity for this
row at this column — read by cellsOf, carried by compileColumn onto the StateDecl.
Three edits to code that exists, on a path that runs on every pin.

WHAT IT COLLAPSES. obtain-a-step-s-difficulty stops being a lookup against the
matrix and becomes a read of a field on the step in hand. There is no join, no
row resolution, and no way for the walker to ask about a state it is not in.

IT IS NOT THE FIELD-COUNT DERIVATION AND THE TWO ARE COMPATIBLE.
opt-the-difficulty-is-computed-from-the-row-s-own-field-count says where the
number comes FROM; this says where it LIVES and how it travels. A derived number
can ride the same cell.

WHAT IT COSTS, AND IT IS THE REAL OBJECTION: the compiled machine is pinned.
engine/iterations.ts:236 compiles the column at pin time and the pin is written to
disk, so a complexity riding the compiled state is a value fixed when the record
was blessed, not when the step is walked. That is the thing
req-the-complexity-value-is-read-live-and-never-pinned forbids in its first half —
see raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs, because
the reason behind that requirement is about the demand ledger and this does not
touch it.
