---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: flow-update-program
type: "[[flow]]"
statement: upstream's later work, expressed as a transformation that says what to change and never where
kind: signal
crosses: in
source_refs:
  - req-overlay-survives-update
  - raid-dec-an-update-arrives-as-a-program
  - opt-the-update-arrives-as-a-program
  - uc-vendor-and-overlay
---

## Why it crosses in

THE ENGINE AUTHORS IT AND A VEHICLE FETCHES IT. Nothing inside the vehicle
produces it, and nothing should — a producing function here would be the engine
reaching into the vehicle, which is the direction
[[req-nothing-a-copy-does-reaches-its-source]] forbids.

THE VEHICLE REACHES OUT. That asymmetry is the same one [[flow-vehicle]] carries
in the other direction, and together they are the whole relationship.

## What it is, concretely enough to build against

A PROGRAM RATHER THAN CONTENT. It says WHAT to change and never WHERE, which is
why it is indifferent to how the vehicle has restructured the file it changes.
A diff says where, and a vehicle that reordered a file's sections presents to a
line-based merge as delete-everything plus insert-everything.

AND SOMEBODY UPSTREAM HAND-WRITES ONE PER BREAKING CHANGE, FOREVER. That is the
permanent tax the winning design pays, recorded at
[[raid-dec-an-update-arrives-as-a-program]] and it is why the mechanism is rare
rather than obvious.

## What is not established about it

WHETHER THE INTERESTING ONES CAN BE WRITTEN AT ALL. The iteration's probe tested
a migration expressible as one text substitution and faked the hard case: a
transformation that must understand structure rather than match text.

[[raid-tripwire-i16-a-structural-migration-cannot-be-written]] carries the
trigger and the fallback. If that probe fails, this flow's whole premise fails
with it.
