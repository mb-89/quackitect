---
kind: matrix-row
name: generalize-use-cases
statement: Generalize the stories into Cockburn-shape use cases.
state_kind: work
filled_by: agent
depends_on:
  - write-stories
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
  - name: use_cases
    description: "the generalized set, every story covered"
---

## Guidance

Per [[meth-cockburn-use-case]]. Every story maps into a scenario path; extensions from numbered steps; no UI mechanics. M3 derives the requirements from these steps and extensions.
