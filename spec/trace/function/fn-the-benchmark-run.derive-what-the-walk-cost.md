---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.derive-what-the-walk-cost
type: "[[function]]"
cluster: the-benchmark-run
statement: turn the call log of a bound run into cost per state
satisfies:
  - req-a-benchmark-report-carries-the-conditions-of-its-run
inputs:
  - flow-bound-run
outputs:
  - flow-walk-cost
---

## Rationale

A DERIVATION, NEVER A CAPTURE. Everything it needs is already logged per call.
Saying so here keeps a later design from adding a second recorder beside the
one that already works.
