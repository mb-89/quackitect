---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-fallback-fires-when-its-condition-fails
type: "[[requirement]]"
statement: When a state's exit condition fails and the drawing gives it a fallback edge, the engine shall complete that state on the FAILED outcome so the fallback fires, and shall not count the state as green.
kind: functional
verify_method: test
breaks_if_removed: The failure path a drawing declares can never be taken. A state whose exit condition fails has its forward door shut by the condition and its repair door shut by the outcome, so the walk stands with no legal move and the only ways out are an escape or a reopen.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - project/deliverable/engine/machine.ts
  - project/deliverable/engine/session.ts
  - req-no-state-demands-what-it-cannot-supply
priority: must
---

## Detail

A FALLBACK EDGE IS THE DRAWN PATH FOR THE THING GOING WRONG. Taking one
is not a state finishing its work. It is a state failing, and the machine
having somewhere to put it.

## The two halves never met

`completeState` picks which edges fire from the OUTCOME: filled gives
normal, alternative, approval and recovery; anything else gives fallback
and error.

EVERY HOP COMPLETED "filled". So no fallback edge in any machine had ever
fired, in any walk, since the token model was written.

AND THE FAILURE LIVES ON A DIFFERENT CHANNEL. An exit condition that will
not pass blocks the TICK. It does not produce an unfilled outcome. So the
mechanism that opens the door never hears about the thing the door is for.

## Lived, 2026-08-16

verification's exit script runs the battery. Its fallback is
fix-findings — "Fix the battery's findings: all of them, in one pass" —
which exists for precisely the case where that script comes back red.

THE BATTERY CAME BACK RED. The forward door stayed shut on the condition,
the repair door never opened, and verification grants read verbs only.
The walk had no legal move.

Getting to the fixes meant reopening a passed state for its write verbs,
which is the engine's own remedy for going back and is not what the
drawing meant to happen.

## Completing is not passing

OWNER RULING 2026-08-16: "if we complete on failed outcome, then it must
be marked red."

`settledStates` counts a state green only where its LATEST history
outcome is `filled`, so a failed completion takes it back out of the
green set by construction. Nothing extra is needed and nothing may be
added: walking on is not the same as passing, and the record says so.

WITHOUT THAT HALF the walk would launder a red into a signed claim by
taking its own repair door.

## What this does not change

THE FORWARD EDGES STAY GUARDED. A red battery may not walk on to the
gate. It may only walk to the state whose job is fixing it.

THE CONDITION STILL BLOCKS EVERYTHING ELSE. Only an edge the drawing
marks `fallback` or `error` is exempt, and only from the condition it
exists to answer.

## Behaviour

NO MODEL WANTED. One question asked of the drawing at the moment a hop is
taken: is this edge a fallback?
