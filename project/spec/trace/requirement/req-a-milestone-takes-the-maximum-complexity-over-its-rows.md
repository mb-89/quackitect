---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-a-milestone-takes-the-maximum-complexity-over-its-rows
type: "[[requirement]]"
statement: "The driver a milestone names shall be derived from the maximum complexity over the rows that milestone holds, and the per-row values shall be reported alongside it."
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
