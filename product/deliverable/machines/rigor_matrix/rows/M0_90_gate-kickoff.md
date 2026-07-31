---
kind: matrix-row
name: gate-kickoff
statement: "GATE kickoff: one handover carries the plan and the rigor column; the owner blesses - past it the iteration is set."
state_kind: gate
filled_by: agent
depends_on:
  - onboard-retro
floor: true
legal_tools:
  - se_survey
  - se_note_drain
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: retro_drained
    description: "every inbox note has a recorded disposition"
    killer: true
  - name: goal
    description: "the confirmed one-line iteration goal"
  - name: pulled_in
    description: "what this iteration absorbs, each item with its origin"
  - name: left_out
    description: "what explicitly stays out, and where it went"
  - name: change_size
    description: "patch, minor, major or product, with reasoning; strikes named"
---

## Guidance

Review per [[meth-gate-review]]. The kickoff handover is ONE brief carrying everything: the drained retro, the iteration goal, the scope as pulled-in/left-out, and the CHANGE SIZE (the `change_size` field: patch, minor, major or product) with its reasoning - strikes named when a cell reduces the walk. THE FIRST ITERATION OF A PRODUCT IS `product`: it authors the vision packet, the stakeholders and the actual state, and every later iteration inherits those by pointer. A later iteration sizes itself against that standing baseline. The agent bakes scope and column into the brief - no separate confirmation rounds before the gate. One bless sets the iteration; a rejection names what to redo. The column choice is a prediction: the walk escalates visibly when the work outgrows it, never silently. The bless SEEDS the iteration: the engine compiles the blessed column into the iteration's state machine and pins it to the record - the seeded machine is part of this gate's output.
