---
minted_in: i62-background-work-reports-its-own-end-the-
id: sty-the-wait-that-says-how-long-it-will-wait
type: "[[story]]"
statement: When the engine waits for something, I want that wait to carry a duration and to do something when it expires, so a walk on a machine nobody watches can never sit for ever on a condition that will not come.
actor: stk-agent
refines:
  - vp-autonomy-range
priority: must
---

## Deck

THE PROBLEM. A wait with no duration is indistinguishable from a hang. On a
machine nobody is watching there is no one to tell them apart, so the run is
spent either way.
|||
THE MEASURED CASE WAS NINETEEN MINUTES on one entry, and fifteen hours on
another. Neither was a decision to wait; both were a wait nobody had bounded.

---

THE STARTING STATE. The walk stands at a step whose leaving judgment has not
answered. The agent has pulled, and the pull says the check is still running.
|||
THE ACCOUNT ALREADY CARRIES A BASIS FIELD for entries that can estimate. An
entry with no history says so rather than naming a number, which is the shape
this story extends to waits.

---

STEP ONE. The agent pulls and is told the judgment is in flight. Today: the
answer says it is running and nothing more. After: it says how long the wait
is bounded to.
|||
RUN ON THIS MACHINE, 2026-08-24. An entry registered with no handle and no
process number came back from the account carrying `bound_ms` and
`bound_basis`, beside the duration it had already run.

BOTH FIELDS RIDE THE ACCOUNT because the entry view carries them, so the answer
says how long the wait is bounded to without anybody asking a second verb.

---

STEP TWO. The bound passes. Today: nothing happens, and the same answer comes
back for ever. After: expiry acts. The wait ends, and the answer says it ended
because the bound passed rather than because the work finished.
|||
RUN ON THIS MACHINE, 2026-08-24. The entry was given a one-millisecond bound
and left for twenty. The sweep closed it and named it in what it had closed.

THE PROCESS WAS NOT TOUCHED, which is the half worth stating. The bound says
how long the ACCOUNT waits, never how long the work may take.

A HANDLE THAT ANSWERS `there` IS NOT EXPIRED AT ALL. A second run held a real
live process past its bound and the sweep left it running.

---

STEP THREE. The agent reads what the expiry did. Today: there is nothing to
read. After: the outcome names the bound it hit, so the reader can tell a
timeout from a verdict.
|||
RUN ON THIS MACHINE, 2026-08-24. The outcome read `bound reached after 1 ms,
measured`.

THE WORD AFTER THE FIGURE IS THE PROVENANCE. This run declared its own bound so
it reads `measured`; everything in the product today carries the blanket
default and reads `default`.

THAT GAP IS REGISTERED rather than implied —
raid-risk-one-blanket-bound-is-given-to-work-nobody-measured.

---

THE RESULT. Every wait an unattended walk enters is bounded, and expiry does
something rather than nothing.
|||
RUN ON THIS MACHINE, 2026-08-24. Every entry the registry opens carries a bound,
and expiry produced an outcome naming it.

WHAT THE RUN ALSO SHOWED, and it is the part the first build got wrong. After
the expiry the entry rode one answer and was dropped, as a finished entry is.
The work then reported for real, and the entry came back carrying `passed`
rather than the bound's string.

SO EXPIRY ENDS THE WAIT WITHOUT ENDING THE TRUTH. A reader told the wait
expired is still told how the work actually went.
