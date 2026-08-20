---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.obtain-a-step-s-difficulty
type: "[[function]]"
cluster: the-sizing
statement: obtain how hard a step's work is at the change size being walked, from the step's own declaration rather than from a judgment made at the time
satisfies:
  - req-every-matrix-row-declares-its-complexity
  - req-the-complexity-value-is-read-live-and-never-pinned
inputs:
  - flow-compiled-machine
outputs:
  - flow-step-difficulty
---

## Rationale

CLUSTERED AS `the-sizing` AT M4, ON A MEASUREMENT RATHER THAN A FEELING. The four
functions of this chain are coupled to each other by three flows nothing else in
the corpus touches — `flow-step-difficulty`, `flow-milestone-difficulty` and
`flow-driver-recommendation` — and to the rest of the system at exactly two
points: `flow-compiled-machine` arriving here, and `flow-instruction` leaving the
last of them. Dense internal coupling with two external interfaces is a cluster
by the DSM's own test.

SOLUTION-NEUTRAL ON PURPOSE: this says obtain, not read a frontmatter key. A later design may derive the value from what will judge the step's output instead of taking a typed one, and that would satisfy this function unchanged.

AT THE CHANGE SIZE BEING WALKED, which the function first left out. The row is not the unit; the cell is. Corrected after a probe found one row spanning three rungs across its columns.

TAKEN AT THE MOMENT IT IS NEEDED. A difficulty carried in a record's frozen demands would move every claim in every open record the day the ladder changed, which is why the constraint sits beside this function rather than inside it.
