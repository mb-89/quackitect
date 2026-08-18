---
minted_in: i27
id: dsp-satellite-lifecycle
type: "[[design-spec]]"
statement: four all-or-nothing acts over a satellite's life, with a deadline on the call and a beat on the process, so a half-ready satellite never serves and a wedged one is found
realizes:
  - el-satellite-supervisor
  - if-satellite-supervisor-to-satellite
  - if-satellite-supervisor-to-record-store
  - if-satellite-supervisor-to-walk-engine
  - if-satellite-supervisor-to-test-runner
  - if-satellite-supervisor-to-mirror
  - if-front-desk-to-satellite-supervisor
files:
  - project/deliverable/engine/supervisor.ts
  - project/deliverable/engine/worktree.ts
---

## Responsibility

Start, watch, replace and reap. Each is all-or-nothing, and a partial one
never serves.

## Interface

Four acts across `if-satellite-supervisor-to-satellite`, which is process
control rather than a call.

- START. Level the tree, reconcile the delta on trunk, commit what was brought,
  compose the machine, then serve.
- WATCH. Detect a death, time a call, beat a process.
- REPLACE. The delta changed, so a replacement comes up and the old one
  retires.
- REAP. The record closed, so the satellite goes and the worktree is released.

## Behavior and constraints

START COSTS 306.9 MILLISECONDS with the engine module load included, measured
in [[exp-satellite-start]] against a board figure of 36 to 67 that excluded
it. That is a third of the one-second budget, so a start happens when a RECORD
OPENS and never inside a call. The lever is loading less eagerly: the walk
kernel alone is 223 ms.

DETECTION IS FREE AND NEEDS NO PROTOCOL. [[exp-inflight-death]] measured three
break kinds — exit, crash and outside kill — all reaching the caller as one
observable end state inside 100 ms.

THE DEADLINE IS THE MECHANISM AND THE BEAT IS AN ADDITION.
[[exp-watchdog]] measured a satellite whose event loop stays free answering 8
of 8 beats while its call never returned. A beat alone reports the likelier
hang as healthy.

- THE DEADLINE, above 94 ms, because that is how long a crash took to reach
  the caller and anything tighter would call a crash a hang.
- THE BEAT INTERVAL, around 200 ms.
- THE ALLOWANCE, about three missed beats, declaring a wedge in 600 ms.

THE BEAT EARNS ITS PLACE ON TWO NARROW THINGS: it finds a blocked loop in 600
ms where a generous deadline takes seconds, and it sees a wedge while the
satellite is idle, which no deadline can.

A BROKEN DELTA HAS NO WAY BACK TODAY, and that is
[[raid-risk-a-broken-engine-delta-has-no-way-back]]. The owner ruled on
2026-08-14 to take nginx's shape. Either half closes it.

- Validate the composed machine before retiring the old satellite.
- Keep the previous composition until the replacement has served one call.

REAP BEFORE RELEASE, never the other way. A live process holding a working
directory inside the tree being removed is the failure
[[if-satellite-supervisor-to-record-store]] orders against, and it runs after
the strays commit.

## Rationale

THE SUPERVISOR IS THE PART OF CORE-AND-SATELLITE THAT IS MACHINERY rather than
routing, which is why it is its own element and its own spec.

WHY nginx AND NOT OUR OWN INVENTION. nginx.org/en/docs/control.html records a
master that validates a configuration before starting new workers and rolls
back to the old ones on failure, and a binary upgrade that keeps the old
master alive to fall back to. Both properties are exactly what this element
lacked when the gate reviewed it.
