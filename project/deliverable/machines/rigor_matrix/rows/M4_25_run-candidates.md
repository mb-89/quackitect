---
kind: matrix-row
name: run-candidates
statement: The placeholder the seeded candidate machine fills - one parallel compose state per shortlisted combination.
state_kind: work
filled_by: agent
depends_on:
  - enumerate-space
runs: candidates
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
  - name: candidate_records
    description: "each composed candidate: allocation, interfaces, metrics, rationale - one record per compose state"
major: full
minor: none
patch: none
product: tailored
specification: tailored
major_note: |
  Applies in full: one compose state per shortlisted combination,
  parallel; the unchanged baseline enters each as a fixed block; the
  join hands the composed set to evaluate-set.
minor_note: |
  Does not apply - the architecture holds and enumerate-space is struck,
  so nothing is seeded to run. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply - no design space opens for a behavior fix, so nothing
  is seeded to run. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the composed candidate records the chart's
  one-pagers are built from.
specification_note: |
  DOCUMENT FORM: rides enumerate-space's chapter - the one-pagers are
  this run's output; no separate section.
---

## Guidance

enumerate-space AUTHORS the candidate drawing (machines/candidates.md); entering this state RUNS it - one compose state per shortlisted combination, parallel, the unchanged baseline entering each as a fixed block. An unseeded drawing refuses mechanically. Judging stays at evaluate-set - composing and evaluating never share a state.
