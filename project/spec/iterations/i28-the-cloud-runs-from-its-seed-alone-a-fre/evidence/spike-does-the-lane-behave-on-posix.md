---
form: spike-does-the-lane-behave-on-posix
by: agent
signed_off: 2026-08-15T19:08:36.166Z
authors: agent
files:
---

# Evidence form / spike-does-the-lane-behave-on-posix

## current_situation

The Linux run was not possible, so the question narrowed to one a search can settle: does the source assume Windows, or does it branch?

69 PLATFORM-SPECIFIC SITES across the engine. Every one inspected is guarded by `process.platform`, with a POSIX alternative beside it.

ONE OF THEM EXPLAINS THE FIRST SPIKE. `selftest.ts:158` asks for detaching only when the platform is not win32.

## built

- [[exp-the-posix-branches-have-never-run]]

## follow_up

- THE FIRST CLOUD RUN IS A TEST, not a deployment. Failures in it are expected findings.
- THE FIRST PLACE TO LOOK IS THE DETACH PATH. It is the one branch this iteration already knows diverges, and the entrypoint's start step depends on it.
- THE WINDOWS MEASUREMENT IS NOT A LINUX PREDICTION. 45,600 ms was the Windows path behaving as the source expects, and the POSIX path asks for something different.
- THE VERDICT IS UNSETTLED because the host ran out, not the timebox. Branches existing is not branches working.
- nothing is parked from this state

## anything_else

### Why this is worth more than a failed Linux run would have been

A LINUX RUN WOULD HAVE PRODUCED A LIST OF FAILURES. This produced the reason the first spike measured what it did.

THE TWO SPIKES ONLY MAKE SENSE TOGETHER. One measured that the caller is not released on Windows. This one found the line saying that is deliberate, and that the other platform is asked to behave differently.

WITHOUT THIS, THE FIRST FINDING READS AS A DESIGN FAULT. With it, the finding is narrower and more useful: the start step's behaviour is platform-split, and only one half has ever run.

### What was faked, said plainly

THE LINUX RUN. This counts what the source declares rather than observing what it does, and code that has never executed is not evidence.

COUNTING IT AS A PASS WOULD BE COUNTING INTENTIONS.
