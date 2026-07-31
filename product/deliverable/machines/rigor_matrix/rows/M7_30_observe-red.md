---
kind: matrix-row
name: observe-red
statement: "Observe RED: every new check runs and fails before the build."
state_kind: work
filled_by: agent
depends_on:
  - plan-build
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
  - name: red_observed
    description: "every new check with its observed failure"
---

## Guidance

Last before the build, before any code lands ([[meth-test-first]]). A check green with no realized design is suspect. Record each observed failure; the mechanical observe-red lane takes this over when the executor upgrade lands.
