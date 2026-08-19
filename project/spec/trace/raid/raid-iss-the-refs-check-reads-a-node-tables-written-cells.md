---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-the-refs-check-reads-a-node-tables-written-cells
type: "[[raid]]"
kind: issue
statement: "The reference check reads the first two cells of a bound table's row, so a register whose second column holds ids has them checked as references of the wrong type."
owner: the maintainer
trigger: any evidence field bound as a node table whose columns carry ids, and any bound table whose live source is empty
status: open
impact: "The state cannot close. The refusal names every value in the column as the wrong kind of node, which reads as a corpus full of mistyped edges rather than as one check counting one cell too many."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - raid-iss-a-bound-tables-header-reads-as-a-reference
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## What was found

MEASURED ON THIS CLONE, 2026-08-19, when i5's specify-build refused with
twenty complaints of the form `el-bootstrap is element`.

TWO FAULTS, ONE CHECK.

- THE COLUMN COUNT. The extractor reads two leading cells, because a
  comparison card's row carries two items before its verdict. A node-table's
  row carries ONE node and then that node's own frontmatter, which the table
  WRITES rather than resolves. Reading the second cell turned every element id
  in a design spec's `realizes` column into a reference of the wrong type.
- THE EMPTY TABLE. A bound table whose live source returns nothing has a
  header and no rows, and the check demanded a line saying `none`. The author
  has no line to write: the rows are not theirs to choose.

## Why it is the same family as the header defect

BOTH COME FROM ONE CHECK WRITTEN FOR A DASH-LED LIST and later pointed at
tables. Every assumption it makes about a line — that the leading cells name
artifacts, that an empty field is the author's silence — holds for a list and
fails for a register the engine builds itself.

## What was done

- A node-table's references are read from the FIRST cell only.
- A node-table over an empty live source is an answer, not a blank.

## Why it was fixed here rather than noted

IT BLOCKS, the same way the header did, and for the same reason: no content
the agent writes changes what the engine generates.

THE FIX IS OUTSIDE THIS RECORD'S BLESSED SCOPE, said out loud at
gate-implementation rather than folded in quietly.
