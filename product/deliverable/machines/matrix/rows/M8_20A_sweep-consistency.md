---
kind: matrix-row
name: sweep-consistency
statement: "Sweep the describing surfaces: everything this iteration changed is re-documented where it is taught."
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
floor: true
evidence:
  - name: swept
    description: "the changes and the surfaces updated for each"
---

## Guidance

Per [[meth-consistency-sweep]]. A doc that still teaches the superseded way is a defect here, not a later surprise.
