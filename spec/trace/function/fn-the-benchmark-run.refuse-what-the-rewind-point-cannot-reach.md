---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.refuse-what-the-rewind-point-cannot-reach
type: "[[function]]"
cluster: the-benchmark-run
statement: refuse any request for a commit that is not an ancestor of the rewind point, and refuse when ancestry cannot be established
satisfies:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - req-a-ceiling-that-cannot-prove-ancestry-refuses
inputs:
  - flow-bound-run
outputs:
  - flow-bound-run
---

## Rationale

ONE FUNCTION FOR BOTH REQUIREMENTS, because they are one decision with two
outcomes. Splitting them into two functions would let a build satisfy the happy
path and leave the silent half to a later chunk.

IT CONSUMES AND PRODUCES THE SAME FLOW. The binding is what it guards, and
guarding it does not change it.
