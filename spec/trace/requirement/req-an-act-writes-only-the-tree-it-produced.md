---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-an-act-writes-only-the-tree-it-produced
type: "[[requirement]]"
statement: When an act produces a new tree at a path somebody named, it shall write inside that tree and nowhere else, and shall leave the place it was launched from as it found it.
kind: constraint
verify_method: test
breaks_if_removed: An act reachable by one press writes somewhere nobody expected, on a machine the person did not think they were changing. It is the same failure as the 2026-07-25 incident arriving through the friendliest door in the product.
breaks_how_badly: crippling
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 1y
  - uc-drive-a-foreign-product ext 1z
  - sty-press-create-vehicle-and-land-in-it
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
  - stk-newcomer
priority: must
---

## Detail

TWO ACTS FALL UNDER THIS ROW and both are new at i16: producing a copy, and
starting a project. Each takes a path from a person and creates a whole tree
there.

| facet | what binds |
| --- | --- |
| inside only | Every write the act performs shall resolve inside the tree it is producing. |
| the launcher is untouched | The tree the act was launched from shall be unchanged, except for whatever a normal run of the system would record. |
| the machine is untouched | Nothing outside those two trees shall change. No configuration, no shared state, no other repository. |
| the count | The number of paths written outside the produced tree shall be zero, measured over a run rather than asserted. |
| refuse rather than half-do | Where the named path cannot be written, the act shall refuse before creating anything, rather than leaving a partial tree. |

## Why this row exists now and did not before

THE ACT WAS ALWAYS DANGEROUS AND WAS ALWAYS HARD TO REACH. `RUNME.ps1 --export`
writes a whole folder too, and somebody running it has already found a script,
read it, and chosen to run it.

AN ACT AT THE SURFACE HAS NONE OF THOSE GUARDS. It is one press, by somebody
who may have read nothing. [[stk-newcomer]] is exactly who the affordance is
for, which is what makes the bound load-bearing rather than tidy.

SO THE AFFORDANCE DID NOT CREATE THE HAZARD. It removed every accidental
barrier in front of it, and this row is what replaces them.

## Its relationship to the isolation law

[[req-nothing-a-copy-does-reaches-its-source]] governs what a RUNNING copy may
do. This governs what the act that CREATES one may do, at the one moment the
system legitimately writes somewhere it has never written before.

THE TWO TOGETHER CLOSE THE CIRCLE: nothing reaches outward at run time, and the
one act that writes outward writes exactly one new tree and stops.

AND THE PARTIAL-TREE FACET IS THE ONE MOST LIKELY TO BE SKIPPED. A failed spawn
that leaves half a tree behind is worse than one that leaves nothing, because
the half looks like a product. `req-setup-stops-before-partial` already carries
that instinct for installing, and this is the same rule for producing.

## What is not specified here

WHICH SURFACE, and what the act looks like. This row says what must be true of
the result whatever the screen is.

AND NOT WHETHER THE WINDOW OPENS. That the act ends with the builder inside the
result is a behaviour the use case carries; this row only forbids it disturbing
the window it came from.
