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
priority: must
---

## Scenario

- source: a person at a surface, or an agent on the lane
- stimulus: any request the system serves
- artifact: the serving engine and every surface it draws
- environment: the reference machine described below, under normal operation
- response: the answer arrives inside the budget named for that kind of work,
  or the system says it is working before the budget passes
- response measure: requests exceeding their budget with no feedback = 0,
  counted per budget row in the table below

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
