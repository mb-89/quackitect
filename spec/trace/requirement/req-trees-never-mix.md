---
minted_in: i1
id: req-trees-never-mix
type: "[[requirement]]"
statement: While a vehicle runs the engine, the engine shall land zero writes inside the vehicle's overlay tree and zero overlay content inside its own tree.
kind: quality
verify_method: test
fitness_candidate: true
breaks_if_removed: The private overlay leaks into the open engine, and the customer's reason to use the product dies.
breaks_how_badly: fatal
refines:
  - uc-quality-flexibility
source_refs:
  - uc-quality-flexibility step 4
  - uc-quality-flexibility ext 4a
  - stk-vehicle-owner
  - i34 2026-08-16, deleted in error and restored the same day
priority: must
---

## Scenario

- source: the engine and the overlay, writing during normal operation
- stimulus: any write lands during a walk
- artifact: the two trees: engine-owned and vehicle-owned
- environment: a vehicle project with a private overlay layered on the open engine
- response: every write lands in its owner's tree, and a cross-tree write is refused
- response measure: engine writes inside the overlay tree = 0; overlay content inside the engine tree = 0

## Deleted in error by i34, restored the same day

i34 retired this row with the reason "one tree, so nothing can mix". That reason
is about RECORD WORKTREES, which i34 did delete. This row is about the VEHICLE
OVERLAY and the ENGINE tree, which i34 never touched.

TWO DIFFERENT THINGS WERE BOTH CALLED "TREE", and the deletion swept the wrong
one. The overlay is still live and still layered: req-overlay-resolution,
req-overlay-survives-update and req-overlay-drift-reported all stand, and they all
refine uc-vendor-and-overlay.

SO A DEMAND WAS DROPPED, NOT MADE VACUOUS. That is the difference between a row
that would pass forever while checking nothing and a row nobody is checking any
more. The first is worth deleting. The second is a hole.

HOW IT WAS CAUGHT, because the shape is worth keeping. The i34 agent re-pointed
raid-ar-trees-never-mix at req-a-write-lands-where-it-is-meant and asked a
verifier to challenge the choice. The verifier read i27's own acceptance line —
"count engine writes inside the overlay tree and overlay content inside the
engine tree" (i27 evaluate-architecture, the mechanical-check list) — and the
scope mismatch was plain in one sentence.

THE NEAREST-LOOKING NODE WAS THE WRONG ANSWER, and it was wrong twice over.
req-a-write-lands-where-it-is-meant disclaims this clause in its own body, and
its load-bearing clause is conditioned on a path admitting more than one store —
which req-every-record-path-resolves-in-one-tree now makes never.
