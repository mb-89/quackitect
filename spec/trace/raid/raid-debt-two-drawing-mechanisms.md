---
minted_in: i1
id: raid-debt-two-drawing-mechanisms
type: "[[raid]]"
kind: debt
statement: A seeded machine's steps are frontmatter rows in one drawing file, while an authored machine's states are notes — two mechanisms carry one concept.
owner: the maintainer
trigger: the picture-in-picture to-do machine design discussion, or the next change to the seeded-machine compiler
status: open
looked: 2026-08-26
impact: Every feature the drawn machines gain must be built twice or the seeded ones fall behind; the owner has ruled the split wrong.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-142563382cf5
  - note-ed999c4b64b1
last_looked: 2026-08-23
look_verdict: rescheduled
place: i13-the-machine-format-state-machines-become
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

## Swept 2026-08-18, at i16's onboard-retro: RE-ACCEPTED

i13 IS STILL SEEDED AND UNWALKED. Neither original trigger fired either: the
picture-in-picture design discussion is still parked, and the seeded-machine
compiler was not touched by i33, i34 or i35.

The trigger stands unchanged.

## Sweep 2026-08-19, at i5's retro

RE-ACCEPTED. Neither trigger fired. i5 compiled a seeded machine from the rigor matrix and read its steps as frontmatter rows throughout. The split is still doing exactly what this entry says it does.

## Swept 2026-08-19, at i9's onboard-retro: RE-ACCEPTED

UNMOVED. i13 is still the recorded destination and still reads `status:
seeded`.

TRIGGER RE-AFFIRMED. Neither the design discussion nor a change to the seeded
compiler has happened.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.

## Swept 2026-08-26, at i54's closing retro: RE-ACCEPTED

NOT TOUCHED THIS WINDOW. Neither drawing mechanism was opened.

RE-ACCEPTED consciously, trigger unchanged.


SWEPT 2026-08-28, at i63's closing retro: RE-ACCEPTED, and the trigger holds.

It fires at the picture-in-picture to-do machine design discussion, or at the
next change to the seeded-machine compiler. Neither happened in this window.
