---
minted_in: i1
id: raid-debt-two-drawing-mechanisms
type: "[[raid]]"
kind: debt
statement: A seeded machine's steps are frontmatter rows in one drawing file, while an authored machine's states are notes — two mechanisms carry one concept.
owner: the maintainer
trigger: the picture-in-picture to-do machine design discussion, or the next change to the seeded-machine compiler
status: open
looked: 2026-08-15
impact: Every feature the drawn machines gain must be built twice or the seeded ones fall behind; the owner has ruled the split wrong.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-142563382cf5
  - note-ed999c4b64b1
---

The owner's ruling stands on record: seeding is essentially just drawing
a state machine, and after seeding it must use the same mechanisms as a
drawn one. Steps stay rows-with-fills for now, deliberately. The payback
is the unification, and the picture-in-picture to-do design is the
natural moment for it.

Sweep 2026-08-13, at i3's onboarding retro: RE-ACCEPTED consciously.
Neither trigger has fired. The picture-in-picture design discussion is
still parked as note-ed999c4b64b1, and the seeded-machine compiler has
not been touched. The trigger stands unchanged.

Sweep 2026-08-13, second retro of the same day, on another machine:
re-accepted consciously. No picture-in-picture design discussion and no
change to the seeded-machine compiler happened that period either — i8
built se.help, which is unrelated. Trigger stands unchanged.

BOTH SWEEPS ARE KEPT ON PURPOSE. Two machines swept this row the same
day and reached the same verdict independently, which is worth more than
either entry alone. They were merged rather than deduplicated.

## Swept 2026-08-15, at i12's retro: RESCHEDULED to i13

i13 is the machine format — "state machines become PlantUML files with our
own Cytoscape renderer, coordinates go, the hash moves from bytes to the
extracted graph". A rewrite of how a machine is stored is the one place where
collapsing two mechanisms into one costs nothing extra.

ONE FINDING FROM i12 BELONGS WITH IT, because it argues the same way from the
other side: moving the machine render to Cytoscape would NOT help performance.
The render consumes a canvas that already exists and reads no disk; the four
seconds sit in the greenness derivation behind it. So i13's case rests on
maintainability alone, and should not borrow a speed argument it does not have.

The trigger stands unchanged.
