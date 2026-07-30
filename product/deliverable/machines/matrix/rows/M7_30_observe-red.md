---
kind: matrix-row
name: observe-red
statement: "Observe RED: every new check runs and fails before the build."
state_kind: work
filled_by: agent
depends_on:
  - plan-build
evidence:
  - name: red_observed
    description: "every new check with its observed failure"
---

## Guidance

Last before the build, before any code lands ([[meth-test-first]]). A check green with no realized design is suspect. Record each observed failure; the mechanical observe-red lane takes this over when the executor upgrade lands.
