---
kind: matrix-row
name: gate-kickoff
statement: "GATE kickoff: one handover carries the plan and the rigor column; the owner blesses - past it the iteration is set."
state_kind: gate
filled_by: agent
depends_on:
  - onboard-retro
floor: true
---

## Guidance

Review per [[meth-gate-review]]. The kickoff handover is ONE brief carrying everything: the drained retro, the iteration goal, the scope as pulled-in/left-out, and the CHANGE-SIZE COLUMN with its reasoning - strikes named when a cell reduces the walk. The agent bakes scope and column into the brief - no separate confirmation rounds before the gate. One bless sets the iteration; a rejection names what to redo. The column choice is a prediction: the walk escalates visibly when the work outgrows it, never silently. The bless SEEDS the iteration: the engine compiles the blessed column into the iteration's state machine and pins it to the record - the seeded machine is part of this gate's output.

## Evidence form

- retro_drained | (killer) every inbox note has a recorded disposition | required
- goal | the confirmed one-line iteration goal | required
- pulled_in | what this iteration absorbs, each item with its origin | required
- left_out | what explicitly stays out, and where it went | required
- column | the change size for this iteration with reasoning; strikes named | required
