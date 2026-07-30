---
kind: matrix-row
name: consolidate-baseline
statement: "Consolidate the baseline: the winner's matrices ARE the architecture."
state_kind: work
filled_by: agent
depends_on:
  - reverse-sensitivity
---

## Guidance

Nothing is redrawn: the winner's allocation DMM, element DSM, interface set and metrics become THE baseline ([[meth-dmm]], [[meth-dsm]]). Mechanical properties hold: every function allocated exactly once (a column property), interfaces declared at both ends (a symmetry property) - review-class now, engine-computed later. Diagrams, where wanted, are derived views of these matrices.

## Evidence form

- baseline | the consolidated matrix set with element black-box descriptions | required
- allocation_exact | every function allocated exactly once | required
- interfaces_both_ends | the element DSM is symmetric where it must be | required
