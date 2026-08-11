---
kind: matrix-row
name: verification
statement: The full battery runs mechanically - once, at the gate side, across all iterations.
state_kind: work
filled_by: engine
command: npm --prefix project/deliverable test
depends_on:
  - trace-design
entry_read:
  - project/deliverable/machines/methods/meth-verification-discipline.md
floor: true
evidence:
  - name: battery
    description: the run reference and its verdict
  - name: claims
    template: node-table
    of: test-spec
    items:
      - $claim-specs
    columns:
      - method
      - green_observed
    page_size: 25
    description: "one row per non-test spec. green_observed names who observed what, on the spec node."
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

The one place the full battery runs ([[meth-test-first]]), engine-filled.
Failure opens the fallback into fix-findings - collect everything, fix in
one pass, one confirm run. The command is the project's battery; each
project declares its own.

THE CLAIMS HALF IS THE SAME TABLE IN GREEN (owner ruling 2026-08-11):
every demonstration, inspection and analysis spec is observed green, and
the observation is written on the spec node's `green_observed` — who
observed what. The law refuses an empty one.

FRESH EYES VERIFY ([[meth-verification-discipline]]). A person adheres
to the card. An agent SPAWNS A TESTER SUBAGENT — fresh context, reads
the card and the specs, then verifies. The tester is a GATEKEEPER for
this state and its fix-findings loop: one tester across the rounds,
shown the deltas after each fix pass, never respawned to reread from
zero.
