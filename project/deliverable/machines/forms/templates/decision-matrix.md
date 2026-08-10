---
id: template-decision-matrix
statement: The Pugh convergence drawn from the scores — criteria with their damage grade, the datum column, signed cells per rival, totals and the leader marked.
editor: decision-matrix
line_pattern: ""
line_help: "the runs, written by the arithmetic — nothing here is typed"
---

# decision-matrix

A READING, not a question. It takes no input.

## What the field declares

```
- name: matrix_runs
  template: decision-matrix
  reads: evaluate-set#scores
```

- `reads` — names the sibling form and section the scores come from. The cut
  order arrives from cut-criteria's cuts section the same way.

## What is computed

Everything on the sheet.

- The AXES are cut-criteria's live rows, in its signed order, each carrying
  its damage grade off the requirement node.
- A CELL is the sign of score(rival) minus score(datum) on that axis.
- The DATUM starts as the strongest rival: second by plain score sum.
- The RUNS iterate: the leader takes the datum seat until the seat holds.
- The TOTALS are plain sign counts. No band value is typed yet, so nothing
  is weighted by an invented number.

## What a person still owes

Two things, and both live in the winner field rather than here.

- The why beyond the arithmetic.
- The veto on the computed winner.

## It stores nothing

A derived field is a reading. A stored run would drift from the scores the
moment one number moved, and nothing would report the disagreement.

A field that declares `reads` is never required, for the same reason. Nobody
can fill it, so nobody is asked to.
