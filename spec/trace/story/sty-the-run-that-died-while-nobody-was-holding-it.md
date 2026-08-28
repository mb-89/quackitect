---
minted_in: i62-background-work-reports-its-own-end-the-
id: sty-the-run-that-died-while-nobody-was-holding-it
type: "[[story]]"
statement: When work I started dies without saying so, I want the engine to notice within one interval and close its entry, so the walk is never held by a record of something that no longer exists.
actor: stk-agent
refines:
  - vp-autonomy-range
priority: must
---

## Deck

THE PROBLEM. A process the engine launched exits without writing a closing
record, and nothing notices until the engine is restarted. The entry stays
marked running, and a leaving judgment reads as still deciding while it stands.
|||
TWO PARTIAL FIXES ALREADY STAND, AND NEITHER COVERS THIS. `jobList` lets a
settled record on disk beat a running one in memory, but only for test
operations.
`reapAbandonedJobs` closes what a previous engine left behind at startup,
and it runs at startup only.

---

THE STARTING STATE. One engine is running. It launched a test battery and a
step's leaving judgment. Both entries say running, and one of the processes is
already gone.
|||
NOTHING IN THE LIVE PATH ASKS. The engine holds the entry, and the entry is
written when the run STARTS. The comment above that override says so in as many
words: only the closing record knows how it turned out.

---

STEP ONE. The agent pulls, and the walk stops at the step that owns the entry.
Today: it stops and stays stopped, because nothing the agent can call changes
the entry. After: the entry was already closed, and the pull moves on.
|||
RUN ON THIS MACHINE, 2026-08-24. Reading the account is what runs the sweep, so
by the time a pull composes its answer the dead entry is already closed.

THE CASE THAT PINS IT is "an entry whose process is gone stops reporting itself
as running". It kills a real process, reads the account, and finds the entry
settled.

IT WAS RED BEFORE THE BUILD. Nothing held the live end of a registered
operation, so there was nothing to ask.

---

STEP TWO. The interval falls due while the agent is doing other work. Today:
there is no interval. After: the engine asks each handle whether its process
still exists, and closes the ones that are gone.
|||
RUN ON THIS MACHINE, 2026-08-24. The sweep rides the read rather than a timer,
because composing the account is the one moment the engine reliably has both
the handles and a reason to look.

IT ASKS EXISTENCE, NEVER RESPONSIVENESS. The case "an entry whose process is
alive and silent is left alone" holds a real live process through a sweep and
finds it still running. Silence is not evidence of death.

THE COST WAS MEASURED, not assumed: twenty handles asked in 78 microseconds, a
hundred in 147. That is what licenses running it on the loop that serves
callers.

---

STEP THREE. The agent reads the work account on its next ordinary call. Today:
the dead entry rides every answer and eats the byte bound. After: it is gone,
and the account lists only what is genuinely running.
|||
RUN ON THIS MACHINE, 2026-08-24. A settled entry rides one answer carrying its
outcome and is then dropped for good.

SO THE BYTES ARE SPENT ONCE. The measured ghosts took roughly 1.8 KB of a 6 KB
bound away from every call in a session; a closed entry takes it from one.

---

STEP FOUR. A run exits normally. Today: the closing record is written for a
test run and nothing else. After: every kind of run closes its own entry, and
the interval is the backstop rather than the only guard.
|||
RUN ON THIS MACHINE, 2026-08-24. A process was launched, exited zero, and its
entry closed itself with the exit code before any sweep ran.

THE DISCRIMINATOR IS WHAT MAKES THIS PROVABLE. Reading the account runs the
sweep, so finding the entry settled proves nothing on its own. The case forces
a sweep FIRST and asserts the entry is not among what it closed.

DELETE THE EXIT LISTENER AND THAT ASSERTION FAILS, which is how it is known to
be testing the listener rather than the sweep.

---

THE RESULT. No walk is held by a record of work that has already finished, and
the engine learns that within one interval rather than at its next restart.
|||
RUN ON THIS MACHINE, 2026-08-24. Two closers stand, and neither is optional.
The work closes its own entry on exit, and the sweep closes what never reached
that — a process that crashed or was killed.

WHAT THIS DELIBERATELY DOES NOT DO. It never asks whether a process ANSWERED,
and it never ends one. Only existence can be asked of an arbitrary child, and
this engine launches shells, test runners and exit scripts that were never
written to reply.

SO A HUNG PROCESS IS THE BOUND'S JOB, not this one's. The two answer different
questions on purpose —
raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet.
