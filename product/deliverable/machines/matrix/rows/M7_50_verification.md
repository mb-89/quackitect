---
kind: matrix-row
name: verification
statement: The full battery runs mechanically - once, at the gate side, across all iterations.
state_kind: work
filled_by: engine
depends_on:
  - build-steps
floor: true
COMMENT: "state: ok"
---

## Guidance

Engine-filled. The one place the full battery runs ([[meth-test-first]]). Failure opens the fallback into fix-findings - collect everything, fix in one pass, one confirm run. The command is the project's battery; each project declares its own.

## Evidence form

- battery | the run reference and its verdict | required
