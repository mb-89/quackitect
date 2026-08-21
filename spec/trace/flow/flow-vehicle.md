---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: flow-vehicle
type: "[[flow]]"
statement: a complete independent vehicle built from the engine, under its own name, produced once and then out of reach
kind: signal
crosses: out
source_refs:
  - req-one-command-produces-a-complete-copy
  - nbr-descendant
  - vp-the-engine
---

## Renamed 2026-08-18, and the old prose hid a hole

THIS WAS `flow-copy`. The owner ruled the word: it is a vehicle, and we are the
engine.

AND THE RENAME IS THE SMALLER HALF. The old node carried this sentence: "WHAT
COMES THE OTHER WAY IS NOT THIS FLOW. A copy taking an update pulls
flow-method-sources from where it came from, by its own act."

THAT SENTENCE NAMED AN ACT AND THEN HANDED IT TO A CROSSING so nothing had to
model it. No function received an update, ran it, or produced anything from it,
and the winning architecture rests entirely on that act. The hole was found at
decompose-structure and is now `take-an-update`.

## It crosses OUT and never comes back

THE ASYMMETRY IS THE POINT. This flow leaves and the engine keeps no record of
it, which is [[req-the-source-keeps-no-record-of-a-copy]]. There is no returning
flow, and drawing one would be drawing a relationship that must not exist.

WHAT COMES THE OTHER WAY IS [[flow-update-program]], and it crosses IN. A
vehicle reaches out and takes it; the engine never reaches in. The direction is
the law, and now both directions have a function.
