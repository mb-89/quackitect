---
minted_in: i3
id: tsp-placeholder-refuses-entry
type: "[[test-spec]]"
statement: A seeded sub-machine still carrying its placeholder may be drawn and routed through, and may not be walked into.
method: "test"
verifies:
  - "req-a-placeholder-drawing-refuses-entry"
files:
  - "tests/scaffold-entry.test.ts"
---

## Scope

One requirement, and the hardest thing about it is that the obvious fix breaks
something else.

The placeholder must RESOLVE. The machine view has to draw a route through work
nobody has authored yet, so refusing at compile time breaks the drawing instead
of the skip. Two standing tests already refused that refusal, and they were
right to.

So the subject here is a seam: drawable and routable, not enterable.

## Approach

Unit level against the seeded-drawing compiler, with an iteration-shaped stub.
The compiler reads only an id and a path, so a full record would add cost and
prove nothing extra.

The entry refusal itself is asserted by INSPECTION rather than by a walk, and
that limit is named in the file rather than hidden. Reaching it needs a walk
down to a run state, which is a different fixture at a different cost.

THE TWO HALVES ARE TESTED SEPARATELY ON PURPOSE. A single case asserting "it
draws but does not enter" would go red for either reason and answer neither.

## Steps

Every case in the referenced file is one step, and the case name states its
claim.

- the pin's placeholder compiles, and comes back MARKED as a scaffold. Both
  halves: it resolves, AND the walk can tell it apart.
- an authored none is NOT a scaffold and stays walkable. Zero steps is a legal
  outcome when the drawing says why, and that case must be untouched.
- the pin writes the same literal the compiler recognises. One constant, two
  ends — two copies would drift and the guard would stop firing with nothing
  going red.
- the entry refusal ships, and says what to do about it. Inspection, and it
  says so.

## What red looked like

Observed live on 2026-08-13, not reasoned about. i3 walked past `specify-build`
without seeding anything, `build-steps` found the placeholder, compiled it to a
bare start-to-end pill, walked through it and reported itself done.

A whole build was skipped in silence, and the record said the build happened.

## The step this spec does not have

A walking case: enter a run state whose drawing is a placeholder, and observe
the refusal.

It is owed rather than claimed. Listing it here is the honest position — a case
that fails for the wrong reason reads as coverage and proves nothing, which is
the fabricated-coverage failure this milestone's guidance names.
