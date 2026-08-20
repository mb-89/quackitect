---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: fn-run-a-governed-walk.take-an-update
type: "[[function]]"
cluster: the-bootstrap
statement: apply upstream's later work to a vehicle's own content, and leave what it did readable before it is kept
satisfies:
  - req-overlay-survives-update
  - req-overlay-drift-reported
inputs:
  - flow-update-program
  - flow-vehicle-inventory
outputs:
  - flow-applied-change
controls:
  - the order updates are taken in, one version span at a time
  - which of the vehicle's own changes the arriving update touches
source_refs:
  - uc-vendor-and-overlay
  - raid-dec-an-update-arrives-as-a-program
  - note-5a4745132c01
---

## Rationale

A VEHICLE THAT CANNOT TAKE UPDATES IS A FORK. The value proposition is that a
vehicle keeps taking what the engine learns later, and something has to perform
that act: receive what arrives, apply it to content the vehicle owns, and leave
the result readable before it is kept.

NO OTHER FUNCTION DOES ANY OF THAT. One compiles, one produces, one sweeps the
system against its own standard. This one is a WRITE against foreign input, and
that is a different act from all three.

IT IS SEPARATE FROM report-what-the-vehicle-changed BECAUSE THE INVENTORY IS ITS
INPUT rather than its by-product. A vehicle can ask what it changed without
taking anything, and an update cannot be decided without that answer.

## Why this did not exist until 2026-08-18

THE CORPUS NAMED THE ACT AND THEN HID IT. `flow-copy` carried the sentence "A
copy taking an update pulls flow-method-sources from where it came from, by its
own act", which names an act and hands its mechanism to a crossing so nothing
has to model it.

ALL 33 FUNCTIONS AND ALL 59 FLOWS WERE CHECKED and none carried it. The gap was
found at decompose-structure, when the winning architecture's central mechanism
turned out to have no element because it had no function.

THREE USE-CASE STEPS SAT BEHIND THE HOLE. uc-vendor-and-overlay steps 6, 7 and
8: later they take an update, where the update and one of their own changes meet
they decide it once, and the vehicle reports every identity their content claims
that the update moved.

## Why the nearest existing functions decline it

`hold-the-method` COMPILES AUTHORED METHOD INTO THE MACHINE and keeps the two in
agreement. Its own rationale calls an overlay "the same compilation with one
more source, resolved by precedence" — composition at load. Nothing there
receives an act, runs it, or writes files back, and taking an update is a WRITE.

`catch-the-system-up` BRINGS A TREE BACK INTO LINE with something it has fallen
behind, which is the nearest verb in the corpus. Its subject is internal: the
difference it removes is between this system and its own standard, and its input
is this repository. An inbound transformation from elsewhere is not that.

`bring-forth-a-vehicle` PRODUCES AND STOPS, which it always claimed.

## What the two inputs are for

THE PROGRAM IS WHAT ARRIVES. It says what to change and never where, which is
why it does not care how the vehicle restructured the file it changes.

THE INVENTORY IS WHAT MAKES THE UPDATE DECIDABLE. `req-overlay-drift-reported`
clause three says it in as many words: the report of what the vehicle changed is
the only thing that can say which of those changes an arriving update touches.
Without it the act is blind and step 7 of the use case cannot be performed at
all.

## Solution neutrality

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? At least three, and this
iteration scored them against each other.

- A three-way merge against a common ancestor.
- A declared patch series re-applied to a refreshed base.
- A transformation program run against whatever the vehicle now holds.

THE STATEMENT NAMES NONE OF THEM. It says apply, and leave what it did readable.
The third won by one cell, and that this function reads neutrally is exactly why
it should have existed before the choice was made rather than after.

## The failure this function does not prevent

A MIGRATION THAT RUNS, SUCCEEDS AND PRODUCES SOMETHING WRONG. The output is left
unstaged for a person, and a person who does not read it has no signal. That is
recorded on [[flow-applied-change]] and it is the winner's sharpest weakness
against the criterion this iteration ranked first.
