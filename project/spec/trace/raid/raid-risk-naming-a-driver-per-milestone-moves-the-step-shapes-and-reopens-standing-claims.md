---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-risk-naming-a-driver-per-milestone-moves-the-step-shapes-and-reopens-standing-claims
type: "[[raid]]"
kind: risk
statement: "A milestone that names its driver needs a seam the flat walk does not have, and every way of adding one edits some row's depends_on, which moves that step's shape and reopens the claim in every standing iteration whose pin carries it."
owner: the walking agent
trigger: "the first design state that decides HOW a milestone names its driver, and immediately on any edit to a matrix row's depends_on, busbar, seeds or runs"
status: open
impact: "Four iterations stand open with pinned columns and signed evidence behind them. A shape move reopens the affected step in each, and everything downstream of it falls with the claim. i9 pins 53 demands and i36 has evidence forms in the dozens, so the cascade is measured in signed forms rather than in files."
breaks_how_badly: crippling
how_likely: plausible
probe: "READ THE LEDGER AT THE i38 KICKOFF GATE, 2026-08-20, after a reviewer with no shared context found the door. engine/iterations.ts:329 defines shapeOf as JSON over [depends_on sorted, busbar, seeds, runs]; :294 stores it on every demand; :350-364 movedDemands returns a step as MOVED when the two shapes differ, and the absent-shape escape at :357-359 only helps pins taken before the field existed. The walk is FLAT by declaration — iterations.ts:5, milestones are groups on the states and never sub-machines — and a milestone is a string cut off a filename, rigor-matrix.ts:363. So there is no milestone open or close to hang a driver announcement on."
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
