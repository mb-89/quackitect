---
kind: matrix-row
name: gate-implementation
statement: "GATE implementation: built inside the baseline, verified green across all iterations."
state_kind: gate
filled_by: agent
depends_on:
  - verification
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_test
evidence:
  - name: build_planned
    description: "the seeded chunk machine exists and was walked"
    killer: true
  - name: models_adhered
    description: "the build fills the allocated elements - no unsanctioned element"
  - name: red_observed
    description: "every new check failed before the build"
  - name: designs_realized
    description: "every requirement has a realized design"
  - name: verification_green
    description: "the battery passes, all iterations"
  - name: quality_ok
    description: "internal quality reviewed"
  - name: risks_acceptable
    description: "implementation risks judged and folded into the RAID register"
---

## Guidance

Review per [[meth-gate-review]]. Models-adhered-to is a matrix check: the build filled the allocated elements and only those; a genuinely-needed new element goes back through the architecture gate.
