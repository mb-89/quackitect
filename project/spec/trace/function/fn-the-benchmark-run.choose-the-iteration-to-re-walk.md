---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.choose-the-iteration-to-re-walk
type: "[[function]]"
cluster: the-benchmark-run
statement: resolve a request into one archived iteration, recording the seed where the choice was drawn
satisfies:
  - req-a-benchmark-run-modifies-no-record-and-appears-in-no-survey
inputs:
  - flow-benchmark-request
  - flow-benchmark-report
outputs:
  - flow-chosen-iteration
---

## Rationale

Three ways in and one way out. A named id, a draw by size, or nothing at all.

THE REPORTS ARE AN INPUT HERE AND NOWHERE ELSE. Cycling reads which iteration
was benchmarked least recently, which is why this function consumes the report
flow it does not produce. No second ledger exists.

IT MODIFIES NOTHING. Choosing an iteration is a read over the archive, and the
chosen record is never touched.
