---
form: the-work-closes-its-own-entry
by: agent
signed_off: 2026-08-24T16:29:57.997Z
authors: agent
files:
---

# Evidence form / the-work-closes-its-own-entry

## current_situation

The registry can now ask a handle whether its process is there. Nothing yet writes an entry closed when the process simply ends.

Only a test run closed itself before, and it did so through a record on disk rather than through the exit. A judgment or a shell job that ended left its entry open until the next instance started.

This chunk is the cheap half of the two-closer design.

## built

deliverable/engine/run.ts, inside openOperation.

A registration that carries a handle attaches a one-shot exit listener. When the process ends, the entry settles with the code and signal the process actually ended with.

IT CHECKS THE ENTRY IS STILL RUNNING FIRST, so the listener and the sweep cannot both write. Whichever arrives first wins and the other does nothing.

THE OUTCOME IS THE REAL ONE. A clean exit reads passed; any signal or non-zero code reads not passed. Nothing is inferred from absence here, because the handle was holding the answer.

THE PERSISTED RECORD NOW CARRIES THE OUTCOME as well as the exit code, so an entry rebuilt from disk keeps how it went and not only that it went.

## follow_up

The sweep is next, and it is the backstop for work that never reaches this listener.

THE TWO ARE NOT ALTERNATIVES. A run that crashes or is killed never fires its own exit path, and those are the runs that left entries standing for fifteen hours.

## anything_else

THIS CHUNK IS WHY THE SWEEP HAD TO CHANGE AFTER IT WAS WRITTEN.

The listener fires on the event loop and the sweep runs synchronously inside the read that composes the account. A child that ends between two reads can be seen by the sweep before its own listener runs.

AS FIRST WRITTEN THE SWEEP WOULD HAVE WON AND RECORDED `gone`, throwing away an exit code the handle was holding. It now reads the outcome off the handle where there is one, so the race has no wrong outcome rather than an unlikely one.

THAT WAS FOUND BY RE-READING THE DIFF, before anything ran.
