---
kind: matrix-row
name: log-risks
statement: "Log the top risks: the RAID register opens."
state_kind: work
filled_by: agent
depends_on:
  - draft-vision
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
  - name: raid_opened
    description: "the top entries, each with kind, owner and trigger"
---

## Guidance

Open the register ([[meth-raid]]). The goal system's named conflicts are the first entries; add the top risks the vision and delta expose. Owners and revisit triggers on each.
