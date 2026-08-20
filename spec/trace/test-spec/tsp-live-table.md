---
minted_in: i1
id: tsp-live-table
type: "[[test-spec]]"
statement: The live table derives from the notes, lands every edit in its note, keeps its whole shape on the view file, and refuses what it cannot draw, verified by test over the table stack.
method: test
verifies:
  - req-table-rows-derive-from-notes
  - req-cell-edit-lands-in-the-note
  - req-table-refuses-what-it-cannot-draw
  - req-view-writes-round-trip
  - req-query-is-the-file
  - req-grouping-and-sorting-hold
  - req-expressions-evaluate-per-reference
files:
  - tests/tables.test.ts
  - tests/bases.test.ts
  - tests/baseui.test.ts
  - tests/expr.test.ts
  - tests/grouping.test.ts
  - tests/vault-sync.test.ts
---

## Scope

The live table end to end: rows from notes, cell edits into notes, the
view file as the one query, the control round-trips, group and sort
semantics, and the expression language. This is the iteration's own
deliverable, mapped last because its requirements were written last.

## Approach

Component level over vault fixtures, one fresh root per case. Round-trip
design dominates: what a control writes, the renderer reads back; what a
cell writes, the note carries. Equivalence classes over the expression
language, one case per documented function. Fault-based for the refusal
walls, one case per unknown shape.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: every built row reads back as the same
row; the body is never touched by a cell edit; the query is the file on
disk, verbatim; an expression outside the subset REFUSES rather than
hiding rows; what setGroupBy wrote is what the renderer reads back.
