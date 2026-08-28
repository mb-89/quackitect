---
form: does-a-standing-hold-still
by: agent
signed_off: 2026-08-21T10:43:40.643Z
authors: agent
files: null
---

# Evidence form / does-a-standing-hold-still

## current_situation

The third standing is not built, so this used the one deferred verdict the product already has. `se_test` hands off and reports later, which is the same shape the handback will take.

A REAL VERDICT WAS HANDED OFF at 10:40:51.348Z over the real corpus and settled about 100 seconds later, red.

THE DURABLE RECORD NEVER MOVED DURING THE WINDOW. `.se/test-state.json` was byte-identical at 10:41:00.328Z and 10:42:07.436Z, saying `ok: true` with a timestamp of 09:13:16.489Z — a green 88 minutes old, while a red was being computed.

NOTHING MARKED THE WINDOW OPEN. `scoped_since_battery` was empty at both reads, and the job's own file stayed one line naming no state.

AT 86,079 ms THE PROGRESS READ 175 OF 175 FILES AND 1716 OF 1716 CASES while the same call still reported `running: true`. Every unit of work was done and the verdict was not in.

## built

- [[exp-does-a-standing-hold-still]]

## follow_up

[[raid-ar-a-machine-decision-repeats]] IS CONFIRMED and the window is about a minute and a half wide for a battery.

THE FIX IS NAMED BY THE MEASUREMENT. The job record already carries `started`. What is missing is that the reader of a step's STANDING never sees it, so a live window looks exactly like a stale answer.

[[raid-risk-a-hop-that-finishes-later-makes-green-ambiguous]] IS NO LONGER A DESIGN WORRY. It is an observable state of the product today, and this node measures it.

ONE RED CAME OUT OF THE RUN AND IT IS MINE. Five nodes this record minted have no design spec that realizes them: [[el-work-registry]], [[if-sizing-to-walk-engine]], [[if-test-runner-to-work-registry]], [[if-walk-engine-to-work-registry]] and [[if-work-registry-to-walk-engine]]. The check says to fix it where it was minted, so it is fixed before this milestone closes rather than carried to M7.

## anything_else

THE PACE SENTENCE WAS CLOSE AND THE LINEAR ESTIMATE WAS NOT RELIABLE, and both matter to the design.

The pace promised the verdict on the scale of 92 seconds and the run settled near 100.

The linear projection at 58,709 ms with 116 of 175 files gave 88.6 seconds. It UNDER-predicted, where the earlier replay on this same session over-predicted throughout.

SO THE DIRECTION IS NOT DEPENDABLE. That is the strongest argument yet for [[raid-dec-the-duration-and-its-basis-are-one-return-value]]: a reader who can see the basis can discount it, and a reader who only sees the number cannot.
