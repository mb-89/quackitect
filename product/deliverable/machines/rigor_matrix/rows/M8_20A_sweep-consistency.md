---
kind: matrix-row
name: sweep-consistency
statement: "Sweep the describing surfaces: everything this iteration changed is re-documented where it is taught."
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
floor: true
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_lint
evidence:
  - name: swept
    description: "the changes and the surfaces updated for each"
---

## Guidance

Per [[meth-consistency-sweep]]. A doc that still teaches the superseded way is a defect here, not a later surprise.
