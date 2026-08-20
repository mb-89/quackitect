---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.reduce-a-milestone-to-one-difficulty
type: "[[function]]"
cluster: the-sizing
statement: reduce the difficulties of the steps sized together to the one difficulty published for them, never weaker than any of them, and keep the spread that reduction hides
satisfies:
  - req-a-milestone-takes-the-maximum-complexity-over-its-rows
inputs:
  - flow-step-difficulty
outputs:
  - flow-milestone-difficulty
---

## Rationale

THE REDUCTION IS NO LONGER THE MAXIMUM BY OBLIGATION, corrected 2026-08-20.
This line used to say the function need not name the maximum because the
requirement did. `req-a-milestone-takes-the-maximum-complexity-over-its-rows`
was restated at gate-architecture and no longer names one.

WHAT SURVIVED THE RESTATEMENT IS THE OUTCOME. No step is driven weaker than its
own difficulty, and the spread is visible. The maximum is one way to reach that
and it is M4's to choose, not this node's to freeze.

WHAT THE FUNCTION FIXES is that the steps sized together get ONE answer, that
the answer is never weaker than any of them, and that the inputs to it survive.

IT SAYS "SIZED TOGETHER" AND NOT "WALKED TOGETHER", corrected 2026-08-20 with
the requirement above it. The engine sizes and publishes; it never selects who
walks a step, because `req-the-machine-names-a-driver-and-starts-nothing`
forbids the lane starting anything. A function whose statement said the steps
are DRIVEN at the reduced difficulty claimed an act the design does not have.

IT EMITS A DIFFERENT FLOW FROM THE ONE IT CONSUMES, corrected 2026-08-20. It
first declared `flow-step-difficulty` on both sides, so the milestone maximum
travelled typed as a step difficulty and the reduction was invisible to the
type system. `flow-milestone-difficulty` is the output now.

KEEPING THE SPREAD IS HALF THE FUNCTION. Without it nothing in the record says how much of a milestone was walked by more than it needed, and the only signal that would ever justify splitting one is gone.
