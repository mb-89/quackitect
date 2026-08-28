---
minted_in: i62-background-work-reports-its-own-end-the-
id: req-settling-an-entry-is-idempotent-and-the-first-outcome-stands
type: "[[requirement]]"
statement: When an entry that is already settled is settled again, the product shall keep the first outcome, shall not return the entry to running, and shall not count the work twice.
kind: functional
verify_method: test
measure: "entries returned to running by a second settle: zero. Entries counted more than once in the account after a double settle: zero."
breaks_if_removed: A second closer reopens an entry the first one settled, which is the original fault wearing the fix's clothes, or counts the work twice and corrupts the figures a walk acts on.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-close-the-record-of-work-that-has-ended
source_refs:
  - raid-risk-two-closers-reach-one-entry-and-disagree
  - vp-autonomy-range
---

## Detail

THIS ROW EXISTS BECAUSE THE DESIGN CHOSE TWO CLOSERS. A run that settles its
own entry and an interval that settles a dead one can reach the same entry in
the same moment.

| second settle arrives | what happens |
| --- | --- |
| entry already settled | nothing changes, and the call succeeds |
| entry still running | it settles, as the first closer would |
| outcomes disagree | the first stands, and the disagreement is recorded |

THE DISAGREEMENT IS RECORDED RATHER THAN DISCARDED. A run that exited cleanly
and an interval that ended it report different things, and keeping only the
first silently would hide the case where the two closers are fighting.

WHY IDEMPOTENCE AND NOT A LOCK. A lock would serialise the two closers and
still leave the second one deciding what to do. Idempotence answers that
question once, in the write, for every caller.

THE ONE-DIRECTIONAL RULE ALREADY IN THE PRODUCT IS THE PRECEDENT. A record with
no verdict does not un-finish a job that memory knows has ended, and this row
generalises that to every settle.

NO BEHAVIOUR MODEL HERE. The concurrency is two callers and one write, which
the table above states completely.
