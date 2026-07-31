---
kind: matrix-row
name: log-gaps
statement: Log the validation gaps into RAID.
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
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
  - name: gaps
    description: "the entries added, or none-found stated"
---

## Guidance

Every unfilled slide, every at-risk scenario, every deferred concern lands in the register with owner and trigger ([[meth-raid]]).
