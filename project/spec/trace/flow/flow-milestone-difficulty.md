---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: flow-milestone-difficulty
type: "[[flow]]"
statement: the single difficulty a milestone needs, reduced from the difficulties of the steps it holds, with the spread it was reduced from
kind: signal
source_refs:
  - req-a-milestone-takes-the-maximum-complexity-over-its-rows
---

## Why it is its own flow

IT WAS MISSING AND THE OMISSION WAS A TYPING DEFECT. `reduce-a-milestone-to-one-difficulty`
declared `flow-step-difficulty` as both its input and its output, so a
milestone-level value travelled typed as a step-level one.

`flow-step-difficulty` SAYS WHAT IT IS: how hard a STEP's own work is at a given
change size. A maximum over many steps is not that, and a reduction that emits
the flow it consumes has not reduced anything the type system can see.

FOUND BY AN ADVERSARIAL PASS AT M3, 2026-08-20, under a form whose neutrality
section claimed the layer had been checked for exactly this class of problem.

## It carries the spread, not only the maximum

THE REQUIREMENT DEMANDS BOTH: the maximum governs, and the per-step values are
reported alongside it. So this flow is a value and its inputs, never a bare
number — otherwise nothing downstream could say how much of a milestone was
walked by more than it needed.
