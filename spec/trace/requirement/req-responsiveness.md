---
id: req-responsiveness
type: "[[requirement]]"
statement: The system shall answer a person or an agent within the budget named for that kind of work, and where it cannot, it shall say that it is working.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: every budget in the table below is met on the reference machine
breaks_if_removed: Each timing demand is then argued case by case and the numbers drift apart, so nothing can be called too slow.
breaks_how_badly: corrosive
refines:
  - uc-quality-performance-efficiency
source_refs:
  - req-call-answers-in-one-second
  - req-surface-answers-in-one-second
  - req-work-past-its-bound-says-it-is-working
  - vp-rigor-without-toil
  - owner ruling on the reference machine — every budget here is measured on a mid-level laptop of mid-2025, and a faster machine does not earn a slower budget
priority: must
weighs_with:
  - req-call-answers-in-one-second ! — this row STATES the number, that row measures it at the lane boundary; the two are container and instrument rather than one axis, which is the same ground on which that row and its surface sibling already stand apart
  - req-surface-answers-in-one-second ! — same ground, at the mirror's HTTP boundary instead
  - req-a-clear-jump-is-one-call ! — that row counts CALLS rather than seconds, and a call count is not one of the durations this table names
  - req-a-hop-of-the-walk-carries-its-own-time-budget ! — that row bounds a hop inside a call, and this table bounds whole answers; one call holds many hops
  - req-oversized-results-remain-recoverable-through-the-lane ! — that row bounds a payload's SIZE and this table bounds a duration; a small answer can be slow and a large one fast
  - req-work-past-its-bound-says-it-is-working ! — that row says what happens WHEN a budget here is passed, which is a complement to the budget rather than the same measure
---

## Scenario

- Source: a person at a surface, or an agent at the lane.
- Stimulus: any act that asks the product for an answer.
- Artifact: whichever part of the product serves that act.
- Environment: the reference machine below, under normal load.
- Response: the answer arrives inside the budget named for that kind of work. Where it cannot, the product says it is working.
- Response measure: every budget in the table below is met, and the working signal appears at the moment the budget passes rather than when the work ends.

## The reference machine

EVERY BUDGET HERE IS MEASURED ON ONE MACHINE. It is a MID-LEVEL LAPTOP OF
MID-2025.

A faster machine does not earn a slower budget. A slower one is a finding about
the machine.

## The budgets

| what | budget |
| --- | --- |
| anything a person or an agent touches | 1 second |
| starting a session, first call to ready | 20 seconds |

WHERE A BUDGET CANNOT BE MET, THE SYSTEM SAYS IT IS WORKING. Silence and a slow
answer look the same, and a person who cannot tell them apart leaves.

THE FEEDBACK IS OWED AT THE MOMENT THE BUDGET PASSES, not when the work ends.

## Which nodes carry these budgets

- [[req-call-answers-in-one-second]] — a driver's call into the lane.
- [[req-surface-answers-in-one-second]] — a person's look at a surface.

BOTH ARE THE ONE-SECOND BUDGET AT A DIFFERENT BOUNDARY. They are separate nodes
because they are measured in different places.

THEY REFINE THE SAME USE CASE AS THIS ONE, not this one. A requirement refines
a USE CASE and never another requirement, and the graph check enforces it. They
name this page in their sources instead, because this is where their number
comes from.

THE TWENTY-SECOND BUDGET HAS NO NODE UNDER IT YET.
