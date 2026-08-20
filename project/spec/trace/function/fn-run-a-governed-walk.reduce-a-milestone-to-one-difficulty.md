---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.reduce-a-milestone-to-one-difficulty
type: "[[function]]"
cluster: the-walk
statement: reduce the difficulties of the steps a milestone holds to the single difficulty that milestone needs, and keep the spread
satisfies:
  - req-a-milestone-takes-the-maximum-complexity-over-its-rows
inputs:
  - flow-step-difficulty
outputs:
  - flow-milestone-difficulty
---

## Rationale

THE REDUCTION IS THE MAXIMUM and this function does not say so, because the requirement does. What the function fixes is that a milestone gets ONE answer and that the inputs to it survive.

IT EMITS A DIFFERENT FLOW FROM THE ONE IT CONSUMES, corrected 2026-08-20. It
first declared `flow-step-difficulty` on both sides, so the milestone maximum
travelled typed as a step difficulty and the reduction was invisible to the
type system. `flow-milestone-difficulty` is the output now.

KEEPING THE SPREAD IS HALF THE FUNCTION. Without it nothing in the record says how much of a milestone was walked by more than it needed, and the only signal that would ever justify splitting one is gone.
