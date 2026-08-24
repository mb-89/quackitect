---
spec: tsp-the-leaving-check-hands-the-call-back
story: sty-the-step-that-hands-the-walk-back
performed: 2026-08-24
performed_by: the walking agent
verdict: pass, with one failure observed and fixed during the round
---

# Report — the leaving check hands the call back

## What was set up

THE STATE WAS VERIFICATION, whose leaving check runs the whole battery. The
battery takes about ninety-five seconds of wall time and covers 179 files.

## What was observed

THE FIRST PULL CAME BACK AT ONCE, while the battery was starting. It did not
wait for the battery and it did not pretend the battery had finished.

IT SAID THE CHECK WAS STILL RUNNING, in those words: "the check is STILL RUNNING
— this call was answered without waiting for it, and its outcome is not in yet".
It did not report a failure that had not happened.

IT CARRIED WHAT THE PREVIOUS RUN HAD SAID, so the last verdict was not hidden by
the new one.

THE JUDGMENT RODE THE ACCOUNT as its own entry, growing from three seconds to
ninety-eight across successive answers, so the wait was legible rather than
silent.

A SECOND ATTEMPT JOINED THE RUN rather than starting another. The answer said
so: "the judgment is in flight, and this attempt joined it rather than starting
a second one".

OTHER LANE CALLS KEPT WORKING throughout. Files were read, a specification was
searched and a note was captured while the battery ran. The only verb was never
held.

A LATER PULL CARRIED THE VERDICT, and the walk advanced out of verification to
the implementation gate.

## The failure this round found, on the same seam

BEFORE THE FIX, THE FOURTH FAIL LINE HAPPENED. A check never settled at all, and
the step read as still deciding for the life of the engine.

WHAT IT LOOKED LIKE. The walk sat at its repair step reporting a battery still
running, nineteen minutes after that battery's last case had finished, with no
battery process alive anywhere on the machine.

WHY IT HAPPENED. Killing the child can leave its output pipes held open, so the
promise behind the step never settles. There was nothing left to read: no
process, and no record standing behind the step.

WHAT CLOSES IT. The run now ends itself on a second clock after the kill, and a
run older than its ceiling plus a grace is dropped so the next attempt starts a
real run.

THE PASS ABOVE WAS OBSERVED AFTER THAT FIX WAS LIVE, on the reloaded engine.

## Verdict

PASS on every line of the procedure, observed after the fix.

THE FAILURE IS RECORDED RATHER THAN SMOOTHED. It is the fourth fail line of this
specification, it really happened in this round, and writing the pass without it
would make this report a worse record than no report.
