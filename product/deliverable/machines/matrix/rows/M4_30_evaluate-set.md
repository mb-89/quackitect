---
kind: matrix-row
name: evaluate-set
statement: "Evaluate the candidate set: multi-objective scores, the Pareto front, eliminations recorded."
state_kind: work
filled_by: agent
depends_on:
  - enumerate-space
  - derive-criteria
---

## Guidance

Per [[meth-set-based-pareto]]: score on the weighted criteria and the matrix metrics; keep the non-dominated front; record every elimination with its reason. The formulated examples are walked through each candidate (exercised). No winner is picked here.

## Evidence form

- scores | candidates x criteria and metrics | required
- front | the surviving set | required
- eliminations | each dominated candidate with its reason | required
