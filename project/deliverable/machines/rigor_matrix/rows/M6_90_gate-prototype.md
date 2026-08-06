---
kind: matrix-row
name: gate-prototype
statement: "GATE prototype: the riskiest assumptions are validated by evidence."
state_kind: gate
busbar: true
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
  - name: buildable
    description: "the design is buildable as evidenced"
  - name: results_recorded
    description: "every spike's evidence pinned; promotions marked"
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: the riskiest assumptions validated by evidence, the
  design buildable, every spike's evidence pinned.
minor_note: |
  Applies when spikes ran: the delta's riskiest assumptions hold or the
  design changed, evidence pinned. With no spikes, the gate passes on the
  recorded "none" from rank-unknowns - a pass-through, not a skip.
patch_note: |
  Does not apply. Nothing was proved because nothing needed proving.
  STRIKE PROPOSAL - owner adjudicates.
product_note: |
  The bless that the product's riskiest assumptions were validated by
  evidence. Standing: the evidence stays pinned and reachable from the
  assumptions it settled.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table;
  every spike's evidence pinned and reachable from it.
---

## Guidance

Review per [[meth-gate-review]]. Promotion of spike output into M7 is legal - the spike is downstream of the whole process.
