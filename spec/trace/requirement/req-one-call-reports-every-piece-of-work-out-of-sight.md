---
minted_in: i51-work-running-out-of-sight-reports-itself
id: req-one-call-reports-every-piece-of-work-out-of-sight
type: "[[requirement]]"
statement: When asked what work is running, the product shall answer with every piece of work the session started, whatever kind it is, in one answer.
kind: functional
verify_method: test
measure: "one call returns every piece of work the session started; the count of kinds the answer omits is zero"
breaks_if_removed: "The caller asks each kind of work through a different door and can never know it has asked about all of them, so the only reliable strategy left is to keep asking."
breaks_how_badly: corrosive
priority: must
refines:
  - uc-report-every-piece-of-work-out-of-sight
source_refs:
  - sty-ask-once-what-is-still-running
  - wt-one-lane-call-should-report-the-state-of-every-piece-of-work
  - stk-agent
  - vp-rigor-without-toil
---

## Detail

THE KINDS THAT EXIST TODAY are spawned shell work and test runs. They live in
separate tables and no reader reads both.

A KIND ADDED LATER IS COVERED BY THIS ROW without the row changing. The demand
is that the answer omits no kind, not that it names today's two.

WHAT EACH ENTRY CARRIES, and each line binds.

| field | what it says |
| --- | --- |
| kind | what sort of work this is |
| running | whether it is still going |
| how much longer | a duration, or a statement that none can be computed |
| basis | what the duration was computed from, when there is one |
| verdict | the outcome, once it has one |

A FINISHED PIECE STAYS IN THE ANSWER with its verdict rather than vanishing. A
caller that missed the moment still learns the outcome, which is what makes one
call enough.

WHAT IS OUTSIDE IT. Work started by another session, and any process this
product did not start itself. Both are in the binding excluded list at
draw-context with their reasons.

WHY THE MEASURE COUNTS OMITTED KINDS rather than sampling calls. The failure
this row ends is structural: a whole class of work invisible to the reader. One
omitted kind is the whole defect, so no share of correct answers offsets it.

## Addition — work tokens

THE ANSWER SAYS WHICH OBLIGATION AND WHERE. Reporting that a hand is running
is not enough once work has identity: the answer names the work tokens that
hand has in progress and the state each one sits on.

THE PARTS A HAND CREATES ARE INCLUDED. Work larger than it looked gets parts
beneath it, and those parts are the hand's own reasoning made visible.

NO HAND WORKING IS A DIFFERENT READING from a hand that is working and
silent. Today silence is the only signal the table has, and a working hand
that looks idle is worse than no column at all.
