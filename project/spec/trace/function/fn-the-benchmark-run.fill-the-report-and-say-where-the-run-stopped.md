---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.fill-the-report-and-say-where-the-run-stopped
type: "[[function]]"
cluster: the-benchmark-run
statement: fill the benchmark report from the cost and the conditions, naming the requested stop point and the state actually reached
satisfies:
  - req-a-benchmark-report-carries-the-conditions-of-its-run
  - req-a-run-that-stopped-early-says-where-it-stopped
inputs:
  - flow-walk-cost
  - flow-run-conditions
outputs:
  - flow-benchmark-report
---

## Rationale

THE ONLY THING A RUN COMMITS. Everything else is discarded with the tree.

A RUN THAT STOPPED EARLY IS STILL A MEASUREMENT, and the report has to say so
or a short run gets compared against a full one and the delta measures the stop
point.
