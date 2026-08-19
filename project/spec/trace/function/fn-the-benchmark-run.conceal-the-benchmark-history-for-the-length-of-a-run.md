---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.conceal-the-benchmark-history-for-the-length-of-a-run
type: "[[function]]"
cluster: the-benchmark-run
statement: hide the benchmark reports from every lane verb while a run is bound, and only while it is bound
satisfies:
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound
inputs:
  - flow-bound-run
outputs:
  - flow-bound-run
---

## Rationale

SEPARATE FROM THE CEILING because they conceal different things for different
reasons. The ceiling hides the FUTURE of the walked iteration. This hides the
PAST of the instrument, so a run does not anchor on its own last reading.

THIS IS THE FUNCTION WITH A DEPENDENCY. Three lists decide what a lane verb
sees today and the reading verb consults none of them.
