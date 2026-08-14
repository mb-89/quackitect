---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: req-a-clear-jump-is-one-call
type: "[[requirement]]"
statement: When a caller names a state as the target and asks in the SAME call to be taken there, and nothing between the walk and that state is owed, the engine shall land the walk on it within that one call and answer that it arrived.
kind: quality
characteristic: performance
verify_method: test
breaks_if_removed: Returning to work already done costs as much as doing it, so every step out of a record is paid for twice and the walk gets slower the further it has come.
breaks_how_badly: corrosive
measure: With every state between the walk and the target already standing, ONE call both sets the target and lands on it, answering arrived, in under three seconds.
refines:
  - uc-take-a-step
  - uc-resume-after-an-absence
  - uc-quality-performance
source_refs:
  - "owner ruling 2026-08-14: a jump to a state that everything is good for and that needs no checks shall be one tool call - you declare the target, you say you want to go there, and the machine answers everything is ready, you are there now"
  - "owner ruling 2026-08-14: you don't need to reevaluate anything"
  - "owner ruling 2026-08-14: if you declare a target you could tell the engine you want to pull there immediately - you don't need two pulls for that; you tell it this is my new target and start pulling me there, and then it's one operation"
  - "measured 2026-08-14 in .se/calls.jsonl: 31 pulls over 20 seconds, the worst five at 150,092 ms, 122,748 ms, 104,578 ms, 96,647 ms and 80,422 ms, each walking every already-green state to reach the target"
  - note-afb66f5e0dee
  - req-call-answers-in-one-second
priority: must
---

## Scenario

- Source: an agent or a person naming a state they want to be at.
- Stimulus: one call that names the target AND asks to be taken to it, with
  nothing owed in between.
- Artifact: the engine's walk.
- Environment: a record already walked, re-entered after a step out.
- Response: the walk lands on the target and says it arrived.
- Response measure: one call, under three seconds.

## Detail

AIMING AND MOVING ARE TWO ACTS AND THEY FIT IN ONE CALL. Naming a target
without moving stays possible and stays useful - a person may set where the
work is headed and leave the walking for later.

WHAT THIS ROW FORBIDS IS NEEDING A SECOND CALL TO MOVE. A caller who already
knows both things - this is the target, and take me there - says both at
once, and the engine does both.

TODAY IT IS TWO CALLS AT BEST AND MANY AT WORST. Aim, then pull, then pull
again because the first pull ran past the harness's patience, then probe to
find out where it got to. On 2026-08-14 one return to a known state cost
five calls and about four minutes.

WHAT "NOTHING OWED" MEANS: every state between the walk and the target
already stands. No form is unfilled, no gate unblessed, no claim fallen.
Where something IS owed, the walk stops at it and this row is silent - that
stop is the machine working.

## Why it is a `must` and graded corrosive

IT IS NOT ABOUT IMPATIENCE. A step out of a record is forced by the engine
itself: SE-C-134 refuses a method write from inside a bound record, so any
engine or guidance change costs a step out and a return. On 2026-08-14 that
happened three times in one session, and each return replayed the whole
record.

SO THE COST FALLS ON THE ONE ACTIVITY THIS PRODUCT EXISTS FOR - changing the
machine while walking it - and it grows with how far the record has come.

## What the row does NOT say

IT NAMES NO MECHANISM. Resuming a recorded position, caching a verdict,
evaluating once per call rather than once per hop, or something else - that
is the design's to choose.

IT DOES NOT SAY CHECKS ARE SKIPPED. A state that stands has already been
checked, and the engine knows it stands. This row asks that the knowledge be
USED, not that it be assumed.

## Behaviour

No model wanted. One invariant, timed on a re-entry.
