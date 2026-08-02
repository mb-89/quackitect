---
kind: matrix-row
name: verification
statement: The full battery runs mechanically - once, at the gate side, across all iterations.
state_kind: work
filled_by: engine
command: npm --prefix project/deliverable test
depends_on:
  - build-steps
floor: true
evidence:
  - name: battery
    description: "the run reference and its verdict"
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  FLOOR - the full battery, engine-filled. Identical at every size.
minor_note: |
  FLOOR - the full battery, engine-filled, all iterations. Identical at
  every size.
patch_note: |
  FLOOR - never struck, at any size. The FULL battery runs, not only the
  new check: a patch's regressions land elsewhere, and only the whole
  battery sees them. Engine-filled, same as everywhere.
product_note: |
  FLOOR, and the product's heartbeat: the battery green at rest, always.
  A red trunk is the one state the product may never rest in.
specification_note: |
  DOCUMENT FORM: the run reference with full output under it, verdict in
  the gate record. The book's verification chapter derives pass state
  from the live suite, never from a pasted log.
---

## Guidance

Engine-filled. The one place the full battery runs ([[meth-test-first]]). Failure opens the fallback into fix-findings - collect everything, fix in one pass, one confirm run. The command is the project's battery; each project declares its own.
