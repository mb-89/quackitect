---
kind: matrix-row
name: evaluate-baseline
statement: "Evaluate the baseline: the ATAM-lite walk of the quality scenarios."
state_kind: work
filled_by: agent
depends_on:
  - consolidate-baseline
evidence:
  - name: walk
    description: "each quality scenario with its verdict and carrying decision"
  - name: fitness_candidates
    description: "the measurable scenarios that could automate at M7"
---

## Guidance

Per [[meth-atam-lite]]: walk each quality scenario through the matrices; record addressed / at-risk / unaddressed; name candidate fitness functions. Evaluation, never verification.
