---
kind: matrix-row
name: gate-prototype
statement: "GATE prototype: the riskiest assumptions are validated by evidence."
state_kind: gate
filled_by: agent
depends_on:
  - fold-back
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: assumptions_validated
    description: "the ranked riskiest assumptions hold or the design changed"
    killer: true
  - name: buildable
    description: "the design is buildable as evidenced"
  - name: results_recorded
    description: "every spike's evidence pinned; promotions marked"
---

## Guidance

Review per [[meth-gate-review]]. Promotion of spike output into M7 is legal - the spike is downstream of the whole process.
