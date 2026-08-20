---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back
type: "[[raid]]"
kind: issue
statement: Reopening a state inside a sub-machine leaves no drawn way back to it, because the parent stays grey until the child re-signs and the child cannot be reached until the parent's successors complete.
owner: the driving agent
trigger: any reopen of a state inside a sub-machine, and any change to how the router draws a path backwards
status: open
looked: 2026-08-16
breaks_how_badly: abrasive
how_likely: expected
impact: The walk is stranded with no legal move. Getting back costs reopening a second, unrelated state whose claim never moved, which drops everything downstream of that one too.
source_refs:
  - raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions
  - req-a-ripple-names-its-root
  - deliverable/engine/session.ts
---

## What happened

A BUILD CHUNK INSIDE `build-steps` WAS REOPENED, to reach a write verb
the standing state did not grant.

THAT GREYED `build-steps`, because a parent running a sub-machine is
finished only when every state that drawing declares is green.

AND `build-steps` IS REACHED FROM ONE PLACE ONLY: `observe-red`. The
router's forward path from where the walk stood ran through the
implementation gate, validation, package, release, ship and idle before
it came back around — twenty-three hops to reach a state two behind it.

SO THE WAY BACK WAS TO REOPEN `observe-red` TOO, whose observation had
not moved and whose claim was not in question.

## Why the obvious fixes are not obviously right

AN AMEND CANNOT DO IT. `se_amend` keeps the signature and patches the
form, and it was tried: the amend landed and the state stayed grey,
because the reopen mark outranks the signature. That is correct — an
amend fixes what a claim SAYS, and a reopen says the claim must be
re-earned.

A BACKWARD EDGE WOULD BE A LIE. The drawing says the build happens once,
after the red is observed. Drawing a way back into it would say something
about the method that is not true.

## The shape of a real answer

THE ROUTER ALREADY KNOWS HOW TO GO BACK. `back_to` hops exist for fans —
they un-pick a leg and put the walk on the branching point again. A
reopen inside a sub-machine is the same question asked of a parent.

WHAT IS OWED IS THE MEASUREMENT FIRST: how often this happens, and
whether the reopens that caused it were the right tool at all. The owner
has asked the retro to re-analyse the back-and-forth as a whole
(note-4be3cfe2a2fe), and this row is one instance of it rather than the
whole.

## What it cost here

THREE STATES RE-SIGNED, none of whose claims had moved: the chunk,
`observe-red`, and `trace-design`. Two of the three reopens existed only
to reach a verb.
