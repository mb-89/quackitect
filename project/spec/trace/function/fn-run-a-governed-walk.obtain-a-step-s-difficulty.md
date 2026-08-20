---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.obtain-a-step-s-difficulty
type: "[[function]]"
cluster: the-walk
statement: obtain how hard a step's work is, from the step's own declaration rather than from a judgment made at the time
satisfies:
  - req-every-matrix-row-declares-its-complexity
  - req-the-complexity-value-is-read-live-and-never-pinned
inputs:
  - flow-compiled-machine
outputs:
  - flow-step-difficulty
---

## Rationale

SOLUTION-NEUTRAL ON PURPOSE: this says obtain, not read a frontmatter key. A later design may derive the value from what will judge the step's output instead of taking a typed one, and that would satisfy this function unchanged.

TAKEN AT THE MOMENT IT IS NEEDED. A difficulty carried in a record's frozen demands would move every claim in every open record the day the ladder changed, which is why the constraint sits beside this function rather than inside it.
