---
kind: matrix-row
name: derive-functions
statement: Derive the solution-neutral function structure from the requirements.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
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
  - name: function_structure
    description: overall function and sub-functions, solution-neutral
  - name: coverage
    description: every requirement mapped, every use-case step covered - the matrix filters show no holes
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full for the change's cone: new functions derived
  solution-neutral, coverage closed. The resident structure inherits
  outside the cone.
minor_note: |
  The function structure EXTENDS: new requirements map to new or existing
  functions, solution-neutral, coverage closed for the delta. The
  structure is not re-derived.

  ESCALATE: a new function that fits no existing cluster is the
  architecture moving - the tell that this is a major.
patch_note: |
  Does not apply. No new requirements means no new functions. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the solution-neutral function structure, every
  requirement mapped, every use-case step covered. The coverage matrix
  shows no holes at rest.
specification_note: |
  DOCUMENT FORM: function nodes with requires edges; the function
  structure as a DERIVED FIGURE, the coverage matrix as a DERIVED TABLE.
  The design-output chapter holds both, each with its one what-to-see
  line.
---

## Guidance

Per [[meth-function-structures]]: requirements first, functions from them - the entry into concepting. Verb + noun, no technology named. Every requirement maps to at least one function (requires edge); every use-case step covered. The function structure is the feedstock of M4's partitioning.
