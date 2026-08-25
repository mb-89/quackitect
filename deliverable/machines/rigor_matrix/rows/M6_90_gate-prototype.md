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
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
evidence:
  - name: buildable
    template: choice-with-rationale
    options:
      - yes
      - no
    description: the one judgment this gate asks — is the design buildable as evidenced, and why
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: the riskiest assumptions validated by evidence, the
  design buildable, every spike's evidence pinned.
minor_note: |
  Does not apply. M6 is struck whole at this
  size, so this gate would guard an empty milestone.
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

BUILDABLE is the gate's judgment — yes or no with the why.

RESULTS RECORDED is struck as mechanical:
every seeded spike leaves an experiment node, and fold-back's submit
refuses while any node's fold keys stand unanswered.

ASSUMPTIONS VALIDATED is UNDER DISCUSSION with the owner —
its shape here is not settled. Until it is, the bless reads the
register's assumptions and their probe results as data.

Review per [[meth-gate-review]]. Promotion of spike output into M7 is
legal - the spike is downstream of the whole process.
