---
minted_in: i2-parallel-iterations-across-machines-seed
id: tsp-walk-branch-return
type: "[[test-spec]]"
statement: A completed leg under a waiting busbar returns the walk to its fork and offers the next owed leg without an escape, and the drawn route follows that same path — verified by test over the walker.
method: "test"
verifies:
  - "req-walk-branches-at-waypoint"
files:
  - "tests/branch-return.test.ts"
---

## Scope

The walker's branch return at a fan whose busbar still waits: the walk's
next offer, the drawn route, and the trail. The join's fuel accounting
is covered by the existing walker suites; this spec covers the RETURN
path the 2026-08-11 and 2026-08-12 wedges cost escapes to work around.

## Approach

Component level over a fixture machine with one fork, two claimful legs
and a busbar join. State-based: the walk is driven to the end of one
leg, and the next pull is the observation. The route projection is
asserted beside the walk, because the panel drew the loop-the-machine
line from the same defect.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- with leg one complete and the busbar waiting, the next pull stands
  the walk on the fork and offers the owed leg — no escape in the trail
- the drawn route to the busbar runs through the fork and down the owed
  leg, never forward around the machine
- with every leg complete, the busbar fires and the walk moves past it
