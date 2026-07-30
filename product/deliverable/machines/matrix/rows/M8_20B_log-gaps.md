---
kind: matrix-row
name: log-gaps
statement: Log the validation gaps into RAID.
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
evidence:
  - name: gaps
    description: "the entries added, or none-found stated"
---

## Guidance

Every unfilled slide, every at-risk scenario, every deferred concern lands in the register with owner and trigger ([[meth-raid]]).
