---
minted_in: i12
id: raid-asm-slow-surface-is-not-self-contention
type: "[[raid]]"
kind: assumption
statement: The surfaces read slow because rendering them is slow, rather than because the same engine was serving an active walk at the time.
owner: the driving agent
trigger: a surface measured on an idle engine answers inside the bound
status: open
probed: 2026-08-15
probe: scheduled - it needs a spike. The lane forbids calling its own mirror, because the run would block the server being measured.
impact: Every slow reading in this record was taken while an agent walked. If the render is fast on an idle engine, the defect is single-threaded contention rather than render cost, and the fix aimed at rendering lands nowhere.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-surface-answers-in-one-second
  - raid-asm-battery-timings-measure-work
  - i12
---

## Why it is open

The nineteen mirror_slow records that motivate this record were all
written during one working session. The engine that rendered those
surfaces was the same engine answering the walk's lane calls.

The engine is single-threaded. So a render queued behind a lane call
waits for it, and the recorded duration includes that wait.

THIS IS THE SAME FAULT AS THE BATTERY ONE, ONE LEVEL UP. There the
question was whether a case's duration measures its own work. Here it is
whether a render's duration measures its own work.

Both were found by asking what else was running.

## What makes it plausible rather than conceivable

Two of the /mcp posts in the same window cost 18058 ms and 21219 ms.
Those were route sweeps against a 20000 ms budget, and they are exactly
the kind of work a render would queue behind.

The /widget/details readings cluster tightly between 2720 and 3468 ms,
which argues the other way: contention would be expected to scatter.

So it is genuinely unsettled, and one measurement settles it.

## Probe

Let the engine go quiet. Open the state machine, the root page and an
evidence form, with no walk running and nothing else in flight.

Compare against the recorded figures: 3966 ms, 4026 ms, and 2720 to
3468 ms.

A quiet reading inside the bound moves the whole record's aim from
rendering to scheduling.
