---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-a-milestone-takes-the-maximum-complexity-over-its-rows
type: "[[requirement]]"
statement: "No step shall be walked by a driver weaker than that step's own difficulty requires, and the record shall make visible where a step was driven above its own difficulty."
kind: functional
verify_method: test
breaks_if_removed: "A milestone driven below its hardest row produces a plausible wrong answer at exactly the step where a checker cannot see it. Reporting only the maximum hides how much of the milestone was overpaid for."
breaks_how_badly: crippling
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - "uc-let-the-machine-name-the-driver step 3"
  - "uc-let-the-machine-name-the-driver ext 3a"
  - "raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker"
priority: must
---


## Restated at gate-architecture, 2026-08-20

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

THE MAXIMUM IS THE ONLY SAFE REDUCTION. Anything lower bets that the hardest
row will not be reached, and a weak answer to a hard question looks like an
answer.

THE SECOND HALF OF THIS REQUIREMENT IS WHAT MAKES THE COST VISIBLE. One hard
row pulls every easy row beside it onto the same walker, and without the spread
reported nothing in the record says nine of ten rows could have been walked by
something cheaper.

SO THE REPORT IS NOT DECORATION. It is the only signal that would ever justify
splitting a milestone, and it is the input to any later reconciliation.
