---
form: the-cell-declares-a-difficulty
by: agent
signed_off: 2026-08-20T20:29:25.980Z
authors: agent
files: null
---

# Evidence form / the-cell-declares-a-difficulty

## current_situation

The loader half rode the previous chunk, because the fatal ledger guard could not mean anything while no cell could carry a complexity to change. What this chunk owed was the rules AROUND the value: which cells must have one, which may not, and what happens to a matrix that has none.

FIVE OF THE NINE CASES IN `tests/sizing-block.test.ts` ARE NOW GREEN. The four still red are the sizing block itself, which is the next two chunks.

## built

THREE RULES DECIDE WHETHER A CELL OWES A DIFFICULTY.

- A ROW THAT APPLIES IN A CHANGE-SIZE COLUMN OWES ONE, and a missing one refuses naming the row and the column.
- A ROW THAT DOES NOT APPLY THERE OWES NOTHING. `applies: none` means it is not walked in that column.
- A ROW THAT SEEDS A SUB-MACHINE MAY NOT CARRY ONE ANYWHERE, and carrying one refuses. `exp-two-hands-rating-the-same-six-cells`.

ONLY A CHANGE-SIZE COLUMN OWES ONE, and finding that out fixed a real defect rather than a test. The demand first covered all five columns, and `specification` is not a change size — it says how a row is DOCUMENTED, not how hard it is to walk. The requirement says "every row in every change-size column in which that row applies", and the code now says the same.

### Three defects in my own work, found by running rather than by reading

THE DESIGN SPEC PROPOSED A SHAPE THE SURFACE CANNOT EDIT. It said a nested `complexity:` block keyed by column. The loader's own comment beside `applies` says why that fails: a Bases table edits a cell inline and cannot edit a nested map. The shape is one scalar, `<column>_complexity: C3/R1`, and the spec is corrected.

THE README WAS AN INPUT TO THE LOAD AND NOT TO THE CACHE KEY. The rated line decides whether a missing complexity refuses, and the matrix content hash covered `rows/` only. A fixture that wrote the line got a stale answer with nothing to say so. Both the stamp and the hash now carry it.

A FIXTURE RATED ONE COLUMN AND ASSERTED A REFUSAL ABOUT ANOTHER. `rateEverything` filled `major` only, so the load refused on the first unrated `patch` cell it reached — a true refusal about the wrong cell, which made the case pass for the wrong reason. It now rates every cell that owes one.

AND ONE CASE WAS VACUOUS. "A row that does not apply in a column owes nothing there" looked for a row excluded at `major`, and the live matrix applies every row at `major`. It now searches every change-size column, finds 58 such cells, and asserts the excluded one carries no difficulty either.

## follow_up

THE LOAD-TIME REFUSAL IS STILL OFF, and it is off in the shipped matrix rather than in the code. The line that turns it on is one sentence in `project/deliverable/machines/rigor_matrix/README.md`, and writing it is the same act as claiming every active cell is rated.

THAT DEBT IS OWED A REGISTER ENTRY and `trace-design` is the next state that can write one. Until the line exists, `req-every-matrix-row-declares-its-complexity` is satisfied at the point of use rather than at load, which is narrower than what it asks for.

THE NEXT CHUNK CARRIES THE DIFFICULTY ONTO THE COMPILED STEP, which is what makes `difficultyOf` a field read rather than a join — `if-engine-delta-to-sizing` and `if-method-compiler-to-sizing` both hand the element a compiled machine, and neither hands it the matrix.

## anything_else

