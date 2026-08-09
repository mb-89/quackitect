---
id: fn-run-a-governed-walk.hold-the-method
type: "[[function]]"
cluster: the-walk
statement: compile the authored method into the machine the walk runs on, and keep the two in agreement
satisfies:
  - req-reachable-capability-is-traced
  - req-blessed-column-compiles-pinned
  - req-size-choice-is-the-bless
  - req-size-proposal-names-strikes
  - req-size-escalation-readjudicated
  - req-reload-restarts-clean
  - req-guidance-edit-lands-where-it-compiles
  - req-diverged-trees-reported-never-merged
  - req-overlay-resolution
  - req-overlay-survives-update
  - req-overlay-drift-reported
  - req-engine-folder-is-sealed
  - req-trees-never-mix
  - req-setup-serves-shipped-method
  - req-method-reuse-is-vendoring
inputs:
  - flow-method-sources
  - flow-overlay
outputs:
  - flow-compiled-machine
  - flow-divergence-report
controls:
  - the pinned column
  - the overlay's precedence over the shipped card
source_refs:
  - uc-change-the-method-mid-walk
  - uc-vendor-and-overlay
  - uc-open-an-iteration
---

## Rationale

The method is authored as text and walked as a machine. Something has to turn
one into the other, and that is this function.

It holds the vendoring rules too, because an overlay is not a separate
concern: it is the same compilation with one more source, resolved by
precedence. Splitting them would give two places that decide which card wins.

Divergence is REPORTED here and merged nowhere. A compiler that quietly
reconciled two sources would hide the one fact the reader needs.
