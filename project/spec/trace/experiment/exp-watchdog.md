---
minted_in: i27
id: exp-watchdog
type: "[[experiment]]"
statement: Would a heartbeat between core and satellite catch a hang that a per-call deadline would not?
probes:
  - raid-ar-crash-lands-safe
timebox: fifteen minutes
form: script
faked: a bare TCP channel and a synthetic hang, with no satellite to wedge
fallback: if a heartbeat catches nothing a deadline misses, the supervisor gets a deadline only and no periodic traffic
verdict: holds
measured: 2026-08-14 — a free-event-loop hang answered 8 of 8 beats and looked healthy, while a blocked loop answered 0 of 8
folds_to: raid-ar-crash-lands-safe narrows further, because a heartbeat covers one hang shape of two
promote: none — the deadline and the beat interval are both numbers for specify-build
source_refs:
  - the owner's question, 2026-08-14
  - el-satellite-supervisor
  - exp-inflight-death
---

## Setup

The owner's Windows machine, 2026-08-14, Node v24.16.0.

A child server took work on one connection and heartbeats on another. Two
hang shapes, eight beats at 200 ms each.

- ASYNC. The server never answers the work request. Its event loop stays
  free.
- SYNC. The server busy-loops for four seconds. Its event loop is blocked.

## Result

| hang shape | beats answered | work answered | a watchdog would say |
| --- | --- | --- | --- |
| async, loop free | 8 of 8 | no | healthy |
| sync, loop blocked | 0 of 8 | no | dead |

## What it settles

A HEARTBEAT CATCHES ONE HANG SHAPE OF TWO, and reports the other as healthy.

The shape it misses is the likelier one in this system. A satellite awaiting a
promise that never resolves — a git command waiting on a credential prompt, a
child process that never exits — keeps its event loop free and answers every
beat while the call never returns.

The shape it catches is also caught by a per-call deadline, because a blocked
loop cannot answer the call either.

## So a deadline is required and a beat is optional

THE DEADLINE IS THE MECHANISM. It covers both shapes, because it watches the
call rather than the process.

THE BEAT BUYS TWO NARROW THINGS and they are real.

- SPEED on the blocked shape. Three missed beats at 200 ms declares a wedge in
  600 ms, where a deadline generous enough for real work takes seconds.
- SIGHT WHILE IDLE. A deadline fires only when a call is in flight. A satellite
  that wedges with nobody calling it is invisible to a deadline and visible to
  a beat, so the supervisor can replace it before an agent meets it.

## The numbers a build would need

- The beat interval, and 200 ms was the probe's.
- The allowance, and three missed beats is 600 ms.
- The floor under both: [[exp-inflight-death]] measured a crash taking 94 ms
  to reach the caller, so nothing here should be tighter than that.

## What it does not settle

No satellite exists to wedge. The hangs were synthetic and the channel was
bare TCP rather than the lane's protocol.
