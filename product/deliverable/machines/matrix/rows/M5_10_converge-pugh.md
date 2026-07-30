---
kind: matrix-row
name: converge-pugh
statement: "Converge on the winner: Pugh controlled convergence over the front."
state_kind: work
filled_by: agent
depends_on:
  - gate-candidates
evidence:
  - name: matrix_runs
    description: "the recorded runs with datum choices"
  - name: winner
    description: "the selected candidate and the why beyond the arithmetic"
---

## Guidance

Per [[meth-pugh-convergence]] and steps 5-8 of [[meth-eight-step-decision]]. Datum = strongest viable rival; iterate with the winner as new datum; discuss high scorers with qualitative criteria before selecting.
