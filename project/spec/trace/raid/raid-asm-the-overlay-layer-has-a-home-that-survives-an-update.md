---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-asm-the-overlay-layer-has-a-home-that-survives-an-update
type: "[[raid]]"
kind: assumption
statement: A copy's own overriding content can sit somewhere an update will not disturb, without that place being outside the copy's tree.
owner: the owner
trigger: enumerate-space, at the first candidate that names where the overlay lives
status: probed
probe: "holds, and it was answered off the same runs at no extra cost. An update touches ONLY paths appearing in the commits coming from the source, so the intersection is EMPTY for an overlay living in paths the source does not ship. THREE FILES SHOWED IT WITHOUT BEING DESIGNED TO: a copy-only file the update did not touch; a shared file the source had not changed, which kept the copy's version; and the vehicle's own private guidance, which survived an update taken later from the source. So a place exists INSIDE THE TREE that an update will not disturb, and it needs no data home outside the repository — which is what this entry doubted, because v1's answer used one and the path jail refuses it. WHICH paths is still M4's, and raid-risk-the-overlay-location-is-unchosen carries three candidates."
probed: 2026-08-18
breaks_how_badly: crippling
how_likely: plausible
impact: "If no such place exists inside the tree, the overlay either lives outside it - which the path jail refuses and the isolation rule forbids - or it lives where updates land, and every update becomes a negotiation with the builder's own method."
source_refs:
  - raid-risk-the-overlay-location-is-unchosen
  - req-overlay-resolution
  - req-overlay-survives-update
  - "product/engine-go/resolver.go at ref main"
---

## Where the doubt comes from

v1 SOLVED IT WITH A PLACE THIS PRODUCT DOES NOT HAVE. Its most-specific layer
is `dataDirFor("overlay")` - a per-workspace data directory, outside the
repository entirely. Read this session at ref main.

THAT ANSWER IS NOT AVAILABLE HERE for two reasons that arrived after v1.

- THE PATH JAIL. `engine/paths.ts` refuses anything resolving outside the
  project root, and declared roots are read surfaces rather than write targets.
  A data home outside the tree is a write target outside the root.
- A COPY MUST BE CLONEABLE. `stk-vehicle-owner`'s own concern is that a
  colleague clones the copy and runs it. Content in a per-machine data
  directory does not travel with a clone, so the colleague would get the method
  without the overlay.

SO THE PLACE HAS TO BE INSIDE THE TREE, and the assumption is that such a place
exists which an update will not disturb.

## What makes it non-obvious

AN UPDATE LANDS INSIDE THE TREE TOO. Whatever arrives from the source arrives
somewhere, and if the overlay sits in the same region the two meet on every
update - which is exactly what `req-overlay-survives-update` forbids, at zero
forced edits.

v1's OTHER ANSWER IS THE CANDIDATE. `product/engine-go/module.go`, summarised
in this record at line 36: `import` is a mirror nobody hand-edits and `overlay`
is yours and import never touches it. Two regions inside one tree that never
share a file.

THAT IS A CANDIDATE RATHER THAN THE ANSWER, and naming it here would be
choosing at M3 what M4 exists to decide.

## Probe

IT IS CHEAP AND IT IS A READ, which is why this entry can be closed early.

1. List the regions of the tree an update would write to, under each candidate
   mechanism.
2. List the regions the overlay would occupy, under each candidate location.
3. Intersect them.

WHAT ANSWERS IT: an empty intersection, for at least one pairing. That is the
whole probe.

## It ran on 2026-08-18 and it HOLDS, off the same runs as the vendoring probe

THE INTERSECTION IS EMPTY FOR ONE PAIRING, and it is the obvious one: an
overlay living in paths the SOURCE DOES NOT SHIP. An update only touches paths
appearing in the commits coming from the source, so anything else is not in its
blast radius.

THREE FILES DEMONSTRATED IT WITHOUT BEING DESIGNED TO.

- `mine.md` existed only in the copy. The update did not touch it.
- `brand.json` existed in both and the source had not changed it. The copy's
  version survived unchanged.
- `company-guidance.md`, in the second run, was committed by the vehicle and
  survived an update taken later from the source.

SO A PLACE EXISTS INSIDE THE TREE that an update will not disturb, and it needs
no data home outside the repository. That is what this entry doubted, and it is
why v1's answer - a mirror the source owns beside an overlay the copy owns - is
the same property stated as a layout.

WHAT IS STILL OPEN, and it is M4's: WHICH paths. The probe establishes that
such paths exist, never where they should be, and
[[raid-risk-the-overlay-location-is-unchosen]] still carries three candidates.

AND IT HAS A SECOND HALF THAT IS NOT A READ: whether the empty-intersection
pairing still lets an overlay override an artifact of every class. A layout
that keeps them apart by forbidding half the overrides has answered the wrong
question - `req-overlay-resolution`'s second clause is absolute, and the system
must serve zero method artifacts an overlay cannot replace.
