---
kind: matrix-row
name: run-candidates
statement: "The placeholder the seeded candidate machine fills - one parallel compose state per shortlisted combination."
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
---

## Guidance

enumerate-space AUTHORS the candidate drawing (machines/candidates.md); entering this state RUNS it - one compose state per shortlisted combination, parallel, the unchanged baseline entering each as a fixed block. An unseeded drawing refuses mechanically. Judging stays at evaluate-set - composing and evaluating never share a state.
