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
    killer: true
  - name: complete_allocation
    description: "every candidate allocates ALL functions; interfaces and rationale recorded"
  - name: criteria_traced
    description: "weights derived from requirements and tensions"
  - name: front_recorded
    description: "the Pareto front with every elimination reasoned"
  - name: feasibility_checked
    description: "rough checks per survivor"
---

## Guidance

Set-based discipline: convergence happens at M5, not here. Review per [[meth-gate-review]].
