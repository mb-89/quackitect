---
kind: matrix-row
name: gate-candidates
statement: "GATE candidates: the front is blessed, never a winner."
state_kind: gate
filled_by: agent
depends_on:
  - evaluate-set
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: viable_set
    description: "at least two viable candidates survive, or the no-real-alternatives case is argued and recorded"
  - name: complete_allocation
    description: "every candidate allocates ALL functions; interfaces and rationale recorded"
  - name: criteria_traced
    description: "weights derived from requirements and tensions"
  - name: front_recorded
    description: "the Pareto front with every elimination reasoned"
  - name: feasibility_checked
    description: "rough checks per survivor"
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: at least two viable candidates or the no-alternatives
  case argued, complete allocation each, criteria traced, front recorded,
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

Set-based discipline: convergence happens at M5, not here. Review per [[meth-gate-review]].
