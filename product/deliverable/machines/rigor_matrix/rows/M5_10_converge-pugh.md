---
kind: matrix-row
name: converge-pugh
statement: "Converge on the winner: Pugh controlled convergence over the front."
state_kind: work
filled_by: agent
depends_on:
  - gate-candidates
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
  - name: matrix_runs
    description: "the recorded runs with datum choices"
  - name: winner
    description: "the selected candidate and the why beyond the arithmetic"
---

## Guidance

Per [[meth-pugh-convergence]] and steps 5-8 of [[meth-eight-step-decision]]. Datum = strongest viable rival; iterate with the winner as new datum; discuss high scorers with qualitative criteria before selecting. The output is accepted only in the decision-matrix form (machines/forms/decision-matrix.md) - v1's field-tested shape.
