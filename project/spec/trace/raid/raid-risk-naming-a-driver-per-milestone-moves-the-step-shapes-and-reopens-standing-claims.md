---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-risk-naming-a-driver-per-milestone-moves-the-step-shapes-and-reopens-standing-claims
type: "[[raid]]"
kind: risk
statement: "A milestone that names its driver needs a seam the flat walk does not have, and every way of adding one edits some row's depends_on, which moves that step's shape and reopens the claim in every standing iteration whose pin carries it."
owner: the walking agent
trigger: "the first design state that decides HOW a milestone names its driver, and immediately on any edit to a matrix row's depends_on, busbar, seeds or runs"
status: open
impact: "Three records are both OPEN and pinned - i9, i36 and i38 itself - so a dependency edit reopens the affected step in two other live iterations plus this one, and everything downstream of it falls with the claim. i9 pins 53 demands and i36 pins 52, so the cost is measured in signed evidence forms rather than in files. Eleven further pinned records are shipped; their claims would also move, which matters for the archive's integrity rather than for work in flight."
breaks_how_badly: crippling
how_likely: plausible
probe: "READ THE LEDGER AT THE i38 KICKOFF GATE, 2026-08-20, after a reviewer with no shared context found the door. engine/iterations.ts:329 defines shapeOf as JSON over [depends_on sorted, busbar, seeds, runs]; :294 stores it on every demand; :350-364 movedDemands returns a step as MOVED when the two shapes differ, and the absent-shape escape at :357-359 only helps pins taken before the field existed. COUNTED DIRECTLY OVER THE PINS, 2026-08-20, AND THEN CORRECTED THE SAME DAY. Fourteen records carry a seeded column and thirteen carry shape on 100% of their demands; only i8's 41-demand pin predates the field. THAT FIGURE WAS FIRST REPORTED AS THE BLAST RADIUS AND IT IS NOT. Eleven of the fourteen belong to SHIPPED records. Cross-checking status against the pins gives three records both open and pinned — i9, i36 and i38 itself — so the live exposure is TWO other iterations, not thirteen. The first count was taken over the wrong population while claiming to sharpen an earlier estimate, and it inflated the radius roughly sixfold. The walk is FLAT by declaration — iterations.ts:5, milestones are groups on the states and never sub-machines — and a milestone is a string cut off a filename, rigor-matrix.ts:363. So there is no milestone open or close to hang a driver announcement on."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
---

## The door the record locked, and the door it left open

THE RECORD HUNTED THIS CASCADE AND FOUND ONE PATH. Adding a `complexity:` key
to every row changes the matrix content hash, which is taken over raw bytes.
Its resolution: read the value live, never pin it into demands. That resolution
is correct and it holds — `demandOf` serialises evidence-field structure and
`shapeOf` reads an explicit four-key list, and a new frontmatter key enters
neither.

THE SECOND PATH IS THE ITERATION'S OWN THIRD GOAL. Naming a driver per
milestone needs a place for the naming to happen. The walk has no such place.
Every way of making one — a setup row per milestone, a boundary state, a
re-parenting of the first row of each group — edits `depends_on` on at least
one row, and `depends_on` is the first element of the shape.

SO THE HAZARD IS NOT WHERE IT WAS LOOKED FOR. The complexity KEY is harmless.
The milestone SEAM is not, and it belongs to the same iteration.

## What would make it not happen

- THE DRIVER IS NAMED INSIDE A ROW THAT ALREADY EXISTS, in its form or its
  guidance, with no new state and no changed dependency. Guidance-only wording
  is already excluded from the demand by `demandOf` and its comment says so.
- OR THE SEAM IS ADDED AND THE CONE IS DECLARED FIRST, with the reopen
  accepted deliberately rather than discovered at the next pull.

## The guard that does not exist

NOTHING ASSERTS THAT `complexity` STAYS OUT of `demandOf` and `shapeOf`. The
record's resolution is a sentence in prose, and the mechanism that would keep
it true is one test assertion nobody has written. Until it exists, a later
hand can pin the value without meaning to and nothing will say so.
