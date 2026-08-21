---
minted_in: i51
id: fn-run-a-governed-walk.account-for-work-out-of-sight
type: "[[function]]"
cluster: the-record-life
statement: state what work the session has under way that the caller cannot see, how far each piece has left to go, and what that estimate rests on
satisfies:
  - req-one-call-reports-every-piece-of-work-out-of-sight
  - req-a-time-remaining-names-its-basis
inputs:
  - flow-work-under-way
  - flow-test-timings
outputs:
  - flow-work-account
controls:
  - whether any measurement of comparable work exists to compute against
  - the session's own boundary, which decides what counts as ours
source_refs:
  - uc-report-every-piece-of-work-out-of-sight
  - vp-rigor-without-toil
  - raid-asm-battery-timings-measure-work
---

## Rationale

ONE FUNCTION AND NOT TWO, because the account and the honesty about it fail
together. A design that lists the work and invents the durations has not done
half of this; it has done something worse than none of it.

WHY IT IS SEPARATE FROM HANDING BACK A DECIDING STEP. That function keeps one
judgment attached to one step. This one accounts for every kind of work at
once, including kinds that have nothing to do with the walk.

WHAT KEEPS IT SOLUTION-NEUTRAL. It does not say the account is a list, that it
arrives when asked, or that it rides one exchange. A design that pushes the
account onto every answer satisfies it, and so does one that answers only when
asked.

THE ESTIMATE IS NOT NAMED AS ARITHMETIC. "What that estimate rests on" holds
for a count of finished steps, for a previous run's duration, and for a design
nobody has thought of. Saying "computed from the previous run's case count"
would have chosen the winner here.

THE CONTROL IS THE HONEST PART. Whether any measurement exists is outside this
function's gift, and it is the condition that decides whether a duration can be
given at all.
