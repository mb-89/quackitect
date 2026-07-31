---
kind: matrix-row
name: consolidate-baseline
statement: "Consolidate the baseline: the winner's matrices ARE the architecture."
state_kind: work
filled_by: agent
depends_on:
  - reverse-sensitivity
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: baseline
    description: "the consolidated matrix set with element black-box descriptions"
  - name: allocation_exact
    description: "every function allocated exactly once"
  - name: interfaces_both_ends
    description: "the element DSM is symmetric where it must be"
---

## Guidance

Nothing is redrawn: the winner's allocation DMM, element DSM, interface set and metrics become THE baseline ([[meth-dmm]], [[meth-dsm]]). Mechanical properties hold: every function allocated exactly once (a column property), interfaces declared at both ends (a symmetry property) - review-class now, engine-computed later. Diagrams, where wanted, are derived views of these matrices.
