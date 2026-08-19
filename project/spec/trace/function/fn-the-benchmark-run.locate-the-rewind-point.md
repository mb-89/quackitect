---
minted_in: i37-training-iterations-a-disposable-iterati
id: fn-the-benchmark-run.locate-the-rewind-point
type: "[[function]]"
cluster: the-benchmark-run
statement: find the commit before the chosen iteration started
satisfies:
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
inputs:
  - flow-chosen-iteration
outputs:
  - flow-rewind-point
---

## Rationale

Solution-neutral on purpose. WHAT is wanted is the tree as it stood when the
iteration began. That every record's lifecycle commit happens to carry its id
in the message is how it is found today, not what the function is for.
