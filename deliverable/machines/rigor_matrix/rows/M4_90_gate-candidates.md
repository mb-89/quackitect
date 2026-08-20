---
kind: matrix-row
name: gate-candidates
statement: "GATE candidates: the front is blessed, never a winner."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - evaluate-set
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_web_search
  - se_web_fetch
evidence:
  - name: reasons_hold
    template: free-form
    description: the reasons behind the cuts and the moves, judged
    guidance: |
      Everything countable is already counted and shown above. Read the
      reasons instead.

      - Each cut. Is it identical by construction, checkable against the
        candidate records? Or does it just look about the same?
      - Each row moved out of rank order. Does the reason hold, or does it
        favour one candidate?
      - A front of one. Is that honest, or did the space collapse
        upstream?

      A guess that cuts an axis moves the ranking. That is what this gate
      is for.

      See [[meth-gate-review]].
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: at least two viable candidates or the no-alternatives
  case argued. Every candidate allocates completely. The criteria are traced and the front recorded,
  feasibility checked. Set-based discipline holds.
minor_note: |
  Does not apply. Nothing enumerated, nothing to bless. STRIKE PROPOSAL -
  owner adjudicates.
patch_note: |
  Does not apply. Nothing to bless where nothing was enumerated. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  The bless of the front, standing as the record that alternatives were
  real. Its evidence ages but never expires - it is the proof against
  decision theater.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table, as at
  every gate.
---

## Guidance

SET-BASED DISCIPLINE: convergence happens at M5, never here. The front is blessed, never a winner. Review per [[meth-gate-review]].

THIS GATE ASKED FOR SEVEN THINGS AND SIX OF THEM WERE ALREADY TRUE (owner ruling 2026-08-08). Each was either computed by the engine or refused upstream before the walk could reach here.

- viable_set. The front's size is counted.
- complete_allocation. A candidate visits every cluster or the chart draws it unfinished.
- criteria_traced. Every pair settled, no cycle, every axis tracing to a row - all derived.
- cuts_reasoned. cut-criteria refuses a cut with no reason.
- band_recorded. cut-criteria refuses a ranking with no cutoff.
- front_recorded. Computed from the scores; nobody types it.

feasibility_checked was the seventh, and it belongs to run-candidates, where the rough checks are actually done.

A CHECKLIST OF THINGS THAT CANNOT BE FALSE TEACHES PEOPLE TO TICK. Seven boxes that always pass are seven boxes nobody reads, and the one judgment that matters hides among them.

SO THE GATE ASKS ONE THING, and it is the thing no check can make.

- A CUT'S REASON. "Identical by construction" is checkable against the
  candidate records.
  - "They look about the same" is a guess, and a guess that cuts an axis moves
    the ranking.
- A ROW MOVED OUT OF RANK ORDER. The order was fixed before any candidate
  existed.
  - Moving one row past another jumps it, and it is the only edit here that
    can be aimed at a favourite.
- A FRONT OF ONE. Arithmetic can say it.
  - Only a person can say whether it is honest, or whether the space collapsed
    upstream.

The engine enforces that a reason EXISTS. It cannot tell a real one from a plausible one. That is the whole job left here.
