---
kind: matrix-row
name: gate-kickoff
statement: "GATE kickoff: the gate of milestone M0 - sets the change size and the rigor of the machine below."
state_kind: gate
busbar: true
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
  - se_log_query\n  - se_answer\n  - se_web_search\n  - se_web_fetch\nevidence:
  - name: retro_drained
    description: what happened to each pending note, in one word and a reason
    template: per-item
    items:
      - $inbox
  - name: goals
    description: the iteration's goals, one line each - every gate below measures what it produced against these
    template: list
  - name: pulled_in
    description: what this iteration absorbs, each item with its origin
    template: list
  - name: left_out
    description: what explicitly stays out, and where it went
    template: list
  - name: change_size
    description: the proposed column and its rationale; strikes named
    template: choice-with-rationale
    options:
      - patch
      - minor
      - major
      - product
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
  the goal, what was pulled in and left out, and the column with its reasoning. It renders in the archive
  per iteration, never in the book's reader chapters. Template: the
  evidence form of the row, one instance per iteration, prefills
  commented until confirmed.
---

## Guidance

Review per [[meth-gate-review]].

The kickoff handover is ONE brief carrying everything:

- the drained retro
- the iteration GOALS, one line each
- the scope, as pulled-in and left-out
- the CHANGE SIZE, with its reasoning

The change size is the `change_size` field. It is one of patch, minor, major
or product. Strikes are named where a cell reduces the walk.

THE FIRST ITERATION OF A PRODUCT IS `product`. It authors the vision packet,
the stakeholders and the actual state.

Every later iteration inherits those by pointer, and sizes itself against that
standing baseline.

The agent bakes scope and a PROPOSED column into the brief. There are no
separate confirmation rounds before the gate.

THE COLUMN IS A PROPOSAL, NEVER A DECISION. The agent names one with its
reasoning, and the bless IS that choice.

WHO BLESSES IS THE DIAL'S ANSWER, exactly as at every other weighted step
(corrected 2026-08-19). Below the dial the choice is the person's. Above it the
agent may stamp its own. This line read "the person chooses" flatly, which
disagreed with the engine standing beside it and left two sources of truth.

AND THE PERSON OVERRIDES THE DIAL BY SAYING SO. An instruction to hold every
gate in one iteration outranks the setting, and it is recorded on that
iteration's record so a later session reads it before the first gate.

Seeding never asked for a size. Nothing was decided before this state, and
nothing should be assumed here.

One bless sets the iteration. A rejection names what to redo.

The column choice is a prediction. The walk escalates visibly when the work
outgrows it, never silently.

THE BLESS SEEDS THE ITERATION. The engine compiles the blessed column into the
iteration's state machine and pins it to the record, and that seeded machine
is part of this gate's output.

## The goals

THE GOALS ARE A LIST. One line each, and they bind the whole walk.

Every gate below carries a `goals_served` field. It lists these goals back and
asks what that milestone produced for each one. A milestone with nothing for a
goal, and nothing coming, is a walk that has drifted off its own kickoff.

Three rules on the list itself:

- ENGINE IMPROVEMENTS is a standing goal, always available. It is where the
  iteration pulls in the machine's own repairs. It needs no argument.
- MORE THAN HALF A DOZEN GOALS IS TOO BIG. Split the iteration.
- THE COUNT INFORMS THE COLUMN. One goal has a patch's shape. Two or three
  have a minor's. More than that argues for major.

WHY THE GOALS LIVE HERE AND NOT IN THE TRACE (owner ruling 2026-08-17): a goal
is not an artifact that anything refines. It is what every artifact is measured
against. It travels with the iteration, like the change size and a probed
assumption, and it never enters the trace graph.

WHAT IT COST TO LEARN THIS. Iteration 33 signed a scope naming four
milestones. It then wrote stories, use cases, requirements and build chunks
for one of them. Seven coverage checks passed, because every one compares a
node to its NEIGHBOUR and not one looks up at the goal.
