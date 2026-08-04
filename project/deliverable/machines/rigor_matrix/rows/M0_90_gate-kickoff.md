---
kind: matrix-row
name: gate-kickoff
statement: "GATE kickoff: the gate of milestone M0 - sets the change size and the rigor of the machine below."
state_kind: gate
filled_by: agent
motivation: Work is priced before it is done. Too little rigor ships an untested change; too much drowns a small one in ceremony. The kickoff sizes the bet once, while it is cheap, and the machine below grows to match - nothing downstream re-litigates it.
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
    description: "every inbox note with its disposition - one line per note"
    template: per-item
  - name: goal
    description: "the confirmed one-line iteration goal"
  - name: pulled_in
    description: "what this iteration absorbs, each item with its origin"
    template: list
  - name: left_out
    description: "what explicitly stays out, and where it went"
    template: list
  - name: change_size
    description: "the proposed column and its reasoning; strikes named"
    template: change-size
major: full
minor: full
patch: tailored
product: full
specification: tailored
major_note: |
  FLOOR - applies in full. The column argument for major names the
  architectural suspicion: WHICH part of the baseline the change is
  expected to move, so the walk downstream knows its cone.
minor_note: |
  FLOOR - applies in full. The brief carries the drained retro, the goal,
  pulled-in/left-out, and the column choice with its reasoning. The
  column argument for minor states the PREDICTION explicitly: which
  requirements move, and why the architecture holds.
patch_note: |
  FLOOR - never struck. Tailored to one breath: the one-line goal, the
  column choice (patch) with its one-line reason, and what stays out.
  The onboard-retro rides in ahead of it like at every size (owner
  2026-08-04); a rejection names what to redo, exactly as at full size.

  ESCALATE when the goal cannot be said in one line, or the reason for
  patch does not survive writing it down - that is a minor wearing a
  patch's clothes.
product_note: |
  At product scale this is the FOUNDING BRIEF: the project's own kickoff,
  blessed once, standing as the record of why the product exists as a
  driven effort. Every iteration kickoff diffs against it implicitly.
specification_note: |
  DOCUMENT FORM: the kickoff brief as the iteration record's opening -
  goal, pulled-in/left-out, column with reasoning. Renders in the archive
  per iteration, never in the book's reader chapters. Template: the
  evidence form of the row, one instance per iteration, prefills
  commented until confirmed.
---

## Guidance

Review per [[meth-gate-review]]. The kickoff handover is ONE brief carrying everything: the drained retro, the iteration goal, the scope as pulled-in/left-out, and the CHANGE SIZE (the `change_size` field: patch, minor, major or product) with its reasoning - strikes named when a cell reduces the walk. THE FIRST ITERATION OF A PRODUCT IS `product`: it authors the vision packet, the stakeholders and the actual state, and every later iteration inherits those by pointer. A later iteration sizes itself against that standing baseline. The agent bakes scope and a PROPOSED column into the brief - no separate confirmation rounds before the gate. THE COLUMN IS A PROPOSAL, NEVER A DECISION: the agent names one with its reasoning, the person chooses, and the bless IS that choice. Seeding never asked for a size, so nothing was decided before this state and nothing should be assumed here. One bless sets the iteration; a rejection names what to redo. The column choice is a prediction: the walk escalates visibly when the work outgrows it, never silently. The bless SEEDS the iteration: the engine compiles the blessed column into the iteration's state machine and pins it to the record - the seeded machine is part of this gate's output.
