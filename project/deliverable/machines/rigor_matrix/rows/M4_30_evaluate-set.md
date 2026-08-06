---
kind: matrix-row
name: evaluate-set
statement: "Evaluate the candidate set: multi-objective scores, the Pareto front, eliminations recorded."
state_kind: work
filled_by: agent
busbar: true
depends_on:
  - run-candidates
  - derive-criteria
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
  - name: scores
    description: "candidates x criteria and metrics"
  - name: front
    description: "the surviving set"
  - name: eliminations
    description: "each dominated candidate with its reason"
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: scores on the weighted criteria and matrix metrics,
  the Pareto front, every elimination reasoned, examples exercised
  through each candidate. No winner here.
minor_note: |
  Does not apply. No candidate set at this size. STRIKE PROPOSAL - owner
  adjudicates.
patch_note: |
  Does not apply. No candidate set exists at this size. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the score table and the Pareto front with every
  elimination reasoned. History, kept: it is what makes the next major's
  "why not X" answerable without re-arguing.
specification_note: |
  DOCUMENT FORM: the score table (candidates x criteria) derived, the
  front named, eliminations as one-line reasons under it.
---

## Guidance

Per [[meth-set-based-pareto]]: score on the weighted criteria and the matrix metrics; keep the non-dominated front; record every elimination with its reason. The formulated examples are walked through each candidate (exercised). No winner is picked here.
