---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-a-milestone-takes-the-maximum-complexity-over-its-rows
type: "[[requirement]]"
statement: The engine shall name, for every unit of work it sizes, a difficulty no weaker than that of the hardest step the unit contains, making visible in the record how far each step in that unit sits below it.
kind: functional
verify_method: test
breaks_if_removed: A milestone driven below its hardest row produces a plausible wrong answer at exactly the step where a checker cannot see it. Reporting only the maximum hides how much of the milestone was overpaid for.
breaks_how_badly: crippling
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - uc-let-the-machine-name-the-driver step 3
  - uc-let-the-machine-name-the-driver ext 3a
  - raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker
priority: must
---


## Restated twice at gate-architecture, 2026-08-20

THE FIRST RESTATEMENT WAS WRONG AND AN INDEPENDENT MUST-CHECK CAUGHT IT. It read
"The engine shall walk no step by a driver weaker than that step's own
difficulty requires."

THAT MAKES THE ENGINE THE DRIVER, AND ANOTHER MUST FORBIDS EXACTLY THAT.
`req-the-machine-names-a-driver-and-starts-nothing`: "The lane shall publish the
named driver on the pull and shall start no process on account of it, on any
host and in any mode." The engine never selects who walks a step, so it can
never guarantee that no step is walked weakly.

TWO MUSTS THAT CANNOT BOTH BIND IS A DEFECT WHATEVER THE DESIGN. Under the first
wording every one of the four candidates fails, because none of them spawns
anything — which is the other must working.

THE SECOND RESTATEMENT NAMES THE ENGINE'S OWN ACT. The engine SIZES units of
work and publishes a difficulty. The demand is that the published difficulty is
never weaker than the hardest step inside the unit it covers, and that the
distance between the unit's figure and each step's own is readable.

WHAT SATISFIES IT. A milestone maximum with the spread reported satisfies it.
Naming per state satisfies it with a unit of one and a spread of zero. Both
were excluded by the original wording and neither is preferred by this one.

WHO WROTE THE DEFECT: the walking agent, at this gate, one hour before the
must-check found it. Recorded because a restatement that trades one frozen
mechanism for a fresh contradiction is the failure mode this repair invites.

## What the first restatement replaced

THIS ROW NAMED A MECHANISM AND meth-requirement-authoring:148 FORBIDS IT: "a named
mechanism is design frozen as obligation. Name the outcome; the mechanism is M4's
to choose."

WHAT IT SAID: the driver a milestone names shall be derived from the maximum
complexity over the rows that milestone holds. That is one design's reduction
step. It excluded every candidate that names per state, which was three of the
four M4 composed, before any of them was scored.

WHAT IT MEANS, taken from its own breaks_if_removed: no step under-driven, and the
overpayment visible. Both halves survive the restatement and neither names how.
A milestone maximum satisfies it. So does naming per state. So does splitting a
submachine where the spread is wide.

## Detail

NO REDUCTION BELOW THE HARDEST ROW IS SAFE. Anything lower bets that the hardest
row will not be reached, and a weak answer to a hard question looks like an
answer.

THIS SENTENCE USED TO READ "THE MAXIMUM IS THE ONLY SAFE REDUCTION", corrected
2026-08-20. That is false and it contradicted this node's own restated
statement, which licenses naming per state with a unit of one. A cold
must-check found it and said what it would cost: a reader taking the Detail
rather than the statement mis-scores three of the four candidates, exactly as
the id does.

THE MAXIMUM IS ONE SAFE REDUCTION AND NOT THE ONLY ONE. Naming per state never
reduces at all. Driving everything at the top rung is safe and wasteful.
Splitting a milestone where the spread is wide is safe and cheaper. What the
demand forbids is a published figure weaker than the hardest step inside the
unit it covers.

THE SECOND HALF OF THIS REQUIREMENT IS WHAT MAKES THE COST VISIBLE. One hard
row pulls every easy row beside it onto the same walker, and without the spread
reported nothing in the record says nine of ten rows could have been walked by
something cheaper.

SO THE REPORT IS NOT DECORATION. It is the only signal that would ever justify
splitting a milestone, and it is the input to any later reconciliation.
