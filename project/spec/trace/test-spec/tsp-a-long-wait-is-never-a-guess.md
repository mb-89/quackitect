---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-a-long-wait-is-never-a-guess
type: "[[test-spec]]"
statement: A person waiting on work that has passed its bound can tell from the surface alone that it is still working.
method: "demonstration"
demonstrates:
  - "sty-the-slow-call-that-says-it-is-working"
verifies: "none — demonstrates: carries the edge; req-work-past-its-bound-says-it-is-working is verify_method: test and is carried by tsp-work-past-its-bound-signals"
files:
  - "none — the procedure below is the definition, because the pass is what a person perceives while waiting"
---

## Scope

One person, one operation that reliably passes its bound, one watcher. Step two
of the demo drawing at `machines/demos.md`.

WHY DEMONSTRATION AND NOT TEST, and this one cannot be closed by any instrument
even in principle. A program can assert that a signal was emitted, when, and
how large it is. That is `tsp-work-past-its-bound-signals` and it is the right
place for it.

The pass line here is what the person BELIEVES about the machine while they
wait. Nothing reads that except a watcher asking them.

## Its sibling, so the two are not confused

`tsp-a-slow-signal-keeps-the-wait` asks a DIFFERENT question about the same
signal: whether showing it makes people leave sooner than showing nothing. That
is the harm direction, it needs two groups and a control, and it belongs to
req-a-slowness-signal-never-shortens-the-wait.

This procedure asks the help direction, with one person and no control group:
can they tell working from stuck. A signal can pass this and fail that.

## Approach

OBSERVED, WITHOUT INSTRUMENTED CAPTURE. The watcher records what the person
says and does, not a timing.

THE PERSON IS NOT TOLD THE OPERATION IS SLOW. Telling them removes the doubt
this procedure exists to measure.

## Procedure

1. PICK AN OPERATION THAT RELIABLY PASSES ITS BOUND. Today's log offers
   several: on 2026-08-17, 184 of 730 pulls passed five seconds and 15 passed
   thirty.
2. HAVE THE PERSON TRIGGER IT and say nothing.
   - PASS: within the first second the surface says what is running.
   - FAIL: the surface holds still, or the signal takes the surface over and
     hides what was already there.
3. AT ROUGHLY FIVE SECONDS, ASK THEM whether the machine is alive.
   - PASS: they answer from the screen, without reaching for the log.
   - FAIL: any answer that needs the log, or any "I do not know".
4. LET IT RUN LONG ENOUGH TO BE A DECISION, past thirty seconds.
   - PASS: they can say whether waiting is sensible, from the surface alone.
   - FAIL: they abandon a wait that was about to finish, or they wait on
     something that had already died.

## What makes this pass or fail

PASS when the person is never guessing whether the machine is working, at any
point in the wait.

FAIL on a still screen, on a signal that hides the surface it rides on, and on
any moment where the log is the only way to answer the question.

## Its state, said rather than left blank

NOT RUN. It needs a person at this machine and it has not been scheduled. The
debt sits in raid-debt-ten-checks-wait-on-a-person-or-a-second-machine.

WHAT IT LEANS ON, and this is the honest blocker rather than scheduling: the
signal itself. `tsp-work-past-its-bound-signals` authored both its cases RED,
because nothing carries a running operation onto the panel. Until that build
stands, step 2 of this procedure has nothing to observe.

THE IRONY IS ON FILE RATHER THAN LEFT TO A READER. This iteration's own walk
had six pulls time out with no sign of life, which is the exact failure this
procedure looks for, happening to the record that wrote it.
