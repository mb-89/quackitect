---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.state-the-conditions-of-the-run
type: "[[function]]"
cluster: the-benchmark-run
statement: record the model, the effort, the harness, the size, the matrix hash and the se version
satisfies:
  - req-a-benchmark-report-carries-the-conditions-of-its-run
inputs:
  - flow-bound-run
outputs:
  - flow-run-conditions
---

## Rationale

SEPARATE FROM DERIVING THE COST because the cost comes from the log and the
conditions come from the environment. One can be right while the other is
missing, and a report missing its conditions is not a result at all.
