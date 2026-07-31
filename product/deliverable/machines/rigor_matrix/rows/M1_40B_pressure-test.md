---
kind: matrix-row
name: pressure-test
statement: Pressure-test the drafted packet with a working-backwards PR-FAQ.
state_kind: work
filled_by: agent
depends_on:
  - frame-delta
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
  - name: prfaq
    description: "the press release and the hostile FAQ"
  - name: findings_folded
    description: "what the test changed upstream, or none-with-reason"
---

## Guidance

After drafting, never before ([[meth-pr-faq]]). Every question the FAQ cannot answer cleanly folds back into the vision or the risk log before the gate.
