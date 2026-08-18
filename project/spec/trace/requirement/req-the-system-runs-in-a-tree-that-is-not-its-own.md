---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-the-system-runs-in-a-tree-that-is-not-its-own
type: "[[requirement]]"
statement: When the system is started in a tree that carries none of its method, it shall resolve its method from a recorded pointer to the copy that made that tree, and shall come up able to work.
kind: functional
verify_method: demonstration
breaks_if_removed: The second of the two capabilities the owner asked for cannot exist. A project a vehicle created can be opened and the system cannot come up in it, so the method never reaches the work anybody actually cares about.
breaks_how_badly: crippling
refines:
  - uc-drive-a-foreign-product
source_refs:
  - uc-drive-a-foreign-product step 2
  - uc-drive-a-foreign-product ext 2y
  - sty-drive-somebody-elses-product
  - raid-iss-the-path-jail-has-one-write-target
  - "product/engine-go/i18_red3.go at ref main"
priority: must
---

## Detail

THIS IS THE LOAD-BEARING THIRD of what the owner asked for on 2026-08-18. Their
words: "the plugin needs to be runnable from projects, not only from vehicles,
but also from projects that are run by vehicles."

IT IS NOT A BUTTON. The two acts at the surface are the easy part; this is the
part that has no mechanism today.

| facet | what binds |
| --- | --- |
| it comes up | Started in a tree carrying none of its method, the system shall come up rather than refuse. |
| the pointer | It shall resolve its method from a RECORDED POINTER to the copy that created the tree, never from the tree's own content and never from a machine-wide install. |
| the overlay travels | The copy's own overriding content shall apply to work in the driven tree, not only to work in the copy. |
| nothing is assumed | A tree with no such pointer is not a driven project. The system says so rather than guessing. |

## What v1 already did, and where this row goes past it

THIS SECTION SAID v1 DID ALL OF IT AND THAT IS FALSE, corrected 2026-08-18
after a reader went through the Go source at ref main. The row is partly a
DESCRIPTION of v1 and partly an IDEALISATION of it, and the difference is the
work this iteration actually has to do.

`product/engine-go/i18_red3.go` at ref main is the chain as a passing test. Its
own header calls it "the vehicle-drives-stub chain, end to end" and "one
hermetic walk of the owner's field case".

### Facet 4 is NOT implemented, and v1 asserts the opposite

`selftest.go:440` checks that a tree with no pointer resolves TO ITSELF, with
the comment "no pointer at all: the old fallback stands". `resolveEngineRoot`
agrees in its own words: "else the workspace (the old fallback: strict names
the real gap)".

SO A POINTERLESS TREE COMES UP, CALLS ITSELF ITS OWN ENGINE HOME, and then
refuses one file at a time as each method artifact fails to resolve. Nothing
distinguishes "this is not a driven project" from "that method file is
missing".

v1 DOES HAVE A DISCRIMINATOR AND IT ANSWERS A DIFFERENT QUESTION. `isEngineRepo`
demands both a method folder and an engine folder, and it decides whether a
tree may WRITE the machine-global pointer. That is the hijack guard, not the
driven-project test.

### Facet 2 is contradicted, in half

THE FACET FORBIDS RESOLVING FROM THE TREE'S OWN CONTENT AND FROM A MACHINE-WIDE
INSTALL. v1's chain checks both: step 2 is the workspace's own content and step
4 is a machine-global pointer beside the binary. Only step 3 is the recorded
pointer this row demands.

AND THE TEST GETS THE POINTER TO WIN BY ARRANGING FOR THE FORBIDDEN STEPS TO BE
ABSENT. That is a legitimate hermetic setup and it is not evidence that the
forbidden steps are absent in the design.

### What v1 DOES assert, and it is three facets out of four

EACH LINE HERE IS ONE OF THE FACETS ABOVE.

- The stub's data home records the VEHICLE as its engine home, in
  `engine-home.txt`.
- The stub resolves a method file that exists ONLY in the vehicle's overlay.
- The vehicle's override BEATS the vendored engine copy. Precedence rather
  than mere existence.
- The stub drives a full-graph command clean through the vehicle's engine.
- And the machine-global engine pointer is NEVER captured.

THE LAST ONE IS A HAZARD SOMEBODY HIT IN THE FIELD. The test deliberately
plants "the live hijack's shape" - a bare engine method directory inside the
vehicle - and asserts it does not steal the pointer. That is worth porting with
the rest. See note-b966f8fd311e.

### And v1's pointer is fragile in a way this row must not copy

IT IS SIX HEX CHARACTERS OF A HASH OVER THE ABSOLUTE PATH, in a machine-local
data home. Move the workspace and the slug changes. Clone it and the pointer
does not travel.

THE THIRD CASE IS THE BAD ONE. Move the VEHICLE, and the pointer resolves to a
path with no method layer, is silently skipped, and the machine-global pointer
takes over - possibly a different method entirely. That fails with a WRONG
answer rather than an absent one, which is the worst of the three states this
row's fourth facet exists to separate.

[[raid-asm-the-pointer-survives-what-the-builder-does-to-the-tree]] already
records it. What is new is that v1 is the witness.

## What is NOT specified here

WHERE THE POINTER LIVES. v1 puts it in a per-workspace data home, which this
product does not have and whose absence is
[[raid-asm-the-overlay-layer-has-a-home-that-survives-an-update]]. Inside the
driven tree, beside it, or in a data home this product would have to invent are
all open, and M4 chooses.

AND HOW THE ROOT IS SET. v1 passes `--base <dir>` on every call. That is a
mechanism, and naming it here would freeze design as obligation.

## The obstacle, named so no candidate walks into it

[[raid-iss-the-path-jail-has-one-write-target]]. The lane refuses every write
outside the project root at one resolver, and its one way to reach another tree
is READ-ONLY by design. That jail is what makes a copy safe to hand somebody,
so a candidate that weakens it fails
[[req-nothing-a-copy-does-reaches-its-source]], which is graded fatal.

THE QUESTION IS NOT HOW TO GET OUT OF THE JAIL. It is how a second tree becomes
a legal target without making every tree one.

## Why demonstration rather than test

THE PASS IS A WINDOW OPENING SOMEWHERE ELSE AND THE SYSTEM COMING UP IN IT.
That is observed end to end. A test running inside this repository's own root
cannot establish it, which is the same reason
[[req-one-command-produces-a-complete-copy]] is graded the same way.
