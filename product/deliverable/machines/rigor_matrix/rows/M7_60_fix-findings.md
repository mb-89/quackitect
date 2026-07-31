---
kind: matrix-row
name: fix-findings
statement: "Fix the battery's findings: all of them, in one pass."
state_kind: work
filled_by: agent
depends_on:
  - verification
edge_role: fallback
guard: "verification_attempts < 3"
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
  - se_lint
  - se_git
evidence:
  - name: findings_fixed
    description: "every finding and its fix, one pass"
---

## Guidance

The battery law's fix half ([[meth-test-first]]). FALLBACK from verification while verification_attempts < 3; the recovery edge re-runs verification ONCE. Collect EVERY finding the run surfaced before fixing anything; fix them all; then the single confirm run. When the guard exhausts, the machine escapes to a human.
