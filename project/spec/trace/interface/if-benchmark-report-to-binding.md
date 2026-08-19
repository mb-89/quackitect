---
minted_in: i37-training-iterations-a-disposable-iterati
id: if-benchmark-report-to-binding
type: "[[interface]]"
statement: "The reports folder tells the binding which iteration was benchmarked least recently, and it is the only state a cycling run reads."
source: el-benchmark-report
destination: el-benchmark-binding
carries:
  - flow-benchmark-report
form: file read
bound: 1 second
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - cand-the-refusing-run-with-recorded-conditions
---

THE ONLY CROSSING THAT RUNS BACKWARDS, and it exists because the reports ARE
the scheduler's state.

## What crosses

One answer: which archived iteration has gone longest without being
benchmarked. Nothing else.

## When it is crossed

Once, before a run binds, and only when the person named no iteration. A named
run never crosses it.

## The ordering that makes it legal

It is read BEFORE the binding opens, so the concealment that hides this same
folder during a run has not yet come into force. Reading it later would be the
anchoring failure `req-the-benchmark-history-is-unreadable-while-a-run-is-bound`
forbids.

THAT ORDERING IS THE WHOLE DESIGN OF THIS CROSSING, and it is why it is drawn
rather than treated as an internal detail of the binding.
