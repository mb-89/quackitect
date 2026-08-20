---
form: supervisor-watch
by: agent
signed_off: 2026-08-14T16:36:42.461Z
authors: agent
files: null
---

# Evidence form / supervisor-watch

## current_situation

`supervisor-level` is signed. A satellite now comes up level or does not come up at all.

That covers START. It says nothing about the rest of a satellite's life.

Three holes stood open when this chunk began.

- A CALL THAT NEVER RETURNS looked exactly like a healthy satellite.
- AN IDLE SATELLITE THAT HAD WEDGED was invisible, because there was no call to time.
- A BROKEN DELTA HAD NO WAY BACK. `raid-risk-a-broken-engine-delta-has-no-way-back` records it: a delta that rebases cleanly and then fails to RUN takes the lane with it, and the lane is the only door to the file that broke it.

The numbers were already decided and measured. What was missing was the machinery that uses them.

## built

Four mechanisms in `project/deliverable/engine/supervisor.ts`, plus the numbers they read.

THE DEADLINE ON THE CALL. `callVerdict(end, deadlineMs)` takes what the caller observed and answers `alive`, `dead` or `wedged`.

- A DEATH IS REPORTED, NOT TIMED. `exp-inflight-death` measured three break kinds — exit, crash and outside kill — all reaching the caller as one observable end state inside 100 ms. Detection is free and needs no protocol.
- A HANG ANNOUNCES NOTHING, so the deadline is what catches it. A call still pending at or past `deadlineMs` is `wedged`.
- EVERY NOT-ALIVE VERDICT NAMES ITS REASON. A verdict without one is a diagnosis nobody can act on.

THE BEAT ON THE PROCESS. `missedBeats(lastBeatAt, now, beatMs)` counts unanswered beats off the CLOCK, and `beatVerdict(missed, allowance)` turns that count into the same verdict shape.

- `now` IS PASSED IN. The logic is testable without waiting, and the caller owns the schedule.
- THE BEAT IS AN ADDITION, NEVER A REPLACEMENT. `exp-watchdog` measured a satellite whose event loop stayed free answering 8 of 8 beats while its call never returned. A beat alone reports the likelier hang as healthy.
- IT EARNS ITS PLACE ON TWO NARROW THINGS. It finds a blocked loop in 600 ms where a generous deadline takes seconds. It sees a wedge while the satellite is IDLE, which no deadline can, because an idle satellite has no call to time.

THE PREVIOUS COMPOSITION, KEPT. `replaceComposition(current, next, validate)` composes the candidate, validates it, and only then retires what was serving. A candidate that throws or fails validation leaves the working composition in place and answers why.

WHY nginx AND NOT OUR OWN INVENTION. `nginx.org/en/docs/control.html` records a master that "first checks the syntax validity, then tries to apply new configuration... If this fails, it rolls back changes and continues to work with old configuration." `dsp-satellite-lifecycle` says either half closes the risk. This takes validate-before-retire.

THE NUMBERS, measured rather than chosen, in the `WATCH` block:

- `deadlineMs` 30000, above 94 because that is how long a crash took to reach the caller. Anything tighter would call a crash a hang.
- `beatMs` 200.
- `allowance` 3, which declares a wedge in 600 ms.

`deadlineIsSafe(ms)` pins the floor at 94 so a future edit cannot quietly drop under the measurement.

Proof: `project/deliverable/tests/bound-engine.test.ts`, 22 of 22 green, test job `test-mst61xw2-2`. `npx tsc --noEmit` exits 0.

Seven of those cases are this chunk's:

- a call that answers is alive, and one that dies is dead with the reason named
- a call still pending past its deadline is WEDGED
- a call pending inside its deadline is not yet wedged
- the deadline never calls a crash a hang
- a beat arriving on time keeps the satellite alive
- three missed beats at 200 ms declare a wedge in 600 ms
- the beat sees a wedge while the satellite is IDLE, which no deadline can

Two more already stood for the rollback half, and still pass:

- a replacement that will not load leaves the working composition serving
- a replacement that loads takes over

## follow_up

The next chunk is `core-process`, which depends on this one. It owns trunk, the ledgers, the routing table and the heavy-slot count.

CORE-PROCESS AND SATELLITE-PROCESS ARE WHERE THESE MECHANISMS GET THEIR CALLER. The deadline needs a call boundary. The beat needs a process to ask. Neither exists until the two process chunks stand, and the build plan says so in its own words: the processes turn no red green until the seam, the delta and the supervisor all stand.

SO THE WIRING IS OWED AND IT IS NAMED. `callVerdict` and `beatVerdict` are pure functions today. Their caller is `core-process`.

REAP IS STILL NOT BUILT. `dsp-satellite-lifecycle` names four acts and this file now carries START, WATCH and REPLACE. REAP — the record closes, the satellite goes, the worktree is released — has no chunk on the build plan. It is not needed until a record can close on a satellite, which needs the process chunks first.

No notes parked from this chunk.

## anything_else

What this chunk changed against the handover's account of it.

THE WATCH NUMBERS WERE WRITTEN BUT UNWIRED. That was true at the start of this session. `WATCH` was a constants block and `deadlineIsSafe` was a check on one of its numbers.

A NUMBER IS NOT A DEADLINE ON A CALL. The chunk statement promises three things, and two of them were only figures. `callVerdict`, `missedBeats` and `beatVerdict` are what make the first two real.

They follow the shape `levelRecordTree` already set in this file: the environment is injected, so the decision logic is testable without the thing it will eventually drive. `GitLane` does it with a repository. These do it with a clock.
