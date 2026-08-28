---
minted_in: i51-work-running-out-of-sight-reports-itself
id: fn-run-a-governed-walk.account-for-work-out-of-sight
type: "[[function]]"
cluster: the-record-life
statement: state what work the session has under way that the caller cannot see, how far each piece has left to go, and what that estimate rests on
satisfies:
  - req-the-progress-account-is-derived-from-the-work-itself
  - req-one-call-reports-every-piece-of-work-out-of-sight
  - req-a-time-remaining-names-its-basis
  - req-responsiveness
inputs:
  - flow-settled-work
  - flow-settled-entry
  - flow-work-under-way
  - flow-wait-bound
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

## Addition — work tokens

THE ACCOUNT IS DERIVED FROM THE WORK, NOT NARRATED INTO A SECOND STRUCTURE.
The work tokens already record when they opened and when they closed, so the
progress they describe is computable rather than typed.

THAT REMOVES A WHOLE MACHINERY. Measured over one window, 199 of 1233 calls
were narration and none of it was work. On the worst measured walk the stall
guard refused 59 times consecutively, every time on items that could not
close from where the walk stood.

A GUARD READING REAL WORK REFUSES FOR REAL REASONS OR NOT AT ALL. That is the
difference between this account and the one it replaces.
