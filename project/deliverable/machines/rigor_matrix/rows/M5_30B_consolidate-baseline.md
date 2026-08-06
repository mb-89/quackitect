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
    description: the consolidated matrix set with element black-box descriptions
  - name: allocation_exact
    description: every function allocated exactly once
  - name: interfaces_both_ends
    description: the element DSM is symmetric where it must be
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full: the winner's matrices become THE baseline - allocation
  DMM, element DSM, interfaces, metrics. Every function allocated exactly
  once, interfaces declared at both ends. The old baseline is superseded,
  never left ambiguous.
minor_note: |
  ONE edit is legal at this size: the new functions ALLOCATE into
  existing elements - the allocation DMM gains rows, nothing else moves.
  Every new function allocated exactly once, as ever. Clusters,
  interfaces and element set stand.

  ESCALATE: wanting a new element or a new interface IS the architecture
  moving.
patch_note: |
  Does not apply. The baseline matrices stand untouched. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: THE ARCHITECTURE - allocation DMM, element DSM,
  interfaces, metrics, element black-box descriptions. The single truth
  the build fills and the diagrams derive from. At rest it matches the
  code; the models-adhered check at every size keeps it that way.
specification_note: |
  DOCUMENT FORM: the architecture chapter - the allocation DMM and
  element DSM as DERIVED FIGURES from the baseline data, element
  black-box descriptions as marked prose per element. Diagrams are
  views; the matrices are the truth the figures draw from.
---

## Guidance

Nothing is redrawn: the winner's allocation DMM, element DSM, interface set and metrics become THE baseline ([[meth-dmm]], [[meth-dsm]]). Mechanical properties hold: every function allocated exactly once (a column property), interfaces declared at both ends (a symmetry property) - review-class now, engine-computed later. Diagrams, where wanted, are derived views of these matrices.
