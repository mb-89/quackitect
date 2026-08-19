---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run
type: "[[function]]"
cluster: the-benchmark-run
statement: put a discardable tree at the rewind point and bind a run over it
satisfies:
  - req-a-benchmark-run-modifies-no-record-and-appears-in-no-survey
inputs:
  - flow-rewind-point
outputs:
  - flow-bound-run
---

## Rationale

THE BINDING IS THE UNIT, not the tree. The ceiling and the concealment are
properties of a bound run, and both end when the binding does.

THE TREE IS DISCARDABLE BY CONSTRUCTION so that nothing the walk does can
reach the real record.
