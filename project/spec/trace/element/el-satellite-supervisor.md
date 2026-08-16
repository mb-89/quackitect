---
minted_in: i27
id: el-satellite-supervisor
type: "[[element]]"
statement: Owns a satellite's whole life, and never lets a half-ready one serve.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk.hold-the-work
satisfies:
  - req-entry-levels-the-record-tree
  - req-an-engine-change-applies-in-its-own-record
  - req-crash-lands-safe
source_refs:
  - cand-core-satellite
  - opt-a-core-and-a-satellite-per-agent
  - opt-restart-only-this-records-engine
---

Lives in the core. The part of core-and-satellite that is machinery rather
than routing.

## Four acts, each all-or-nothing

- START. Level the record's tree, reconcile its delta on trunk, commit what was
  brought, then serve.
  - A conflict stops the record at entry with the conflict named.
  - A partial levelling never serves, because nothing is in flight at a start.
- WATCH. A satellite that dies takes one agent's in-flight call with it and
  nothing else.
  - The channel reports a death in under 100 ms, whether the process exited,
    crashed or was killed.
  - A per-call DEADLINE answers the caller when a satellite hangs instead of
    dying.
  - A BEAT catches a satellite wedged while nobody is calling it.
- REPLACE. An engine delta changes and the satellite comes up on it.
  - The agent does not perform the restart and does not wait through it.
  - The walk recomputes its position from the repository.
- REAP. A record closes, its satellite goes, and its worktree is released.
  - Nothing holds the tree open afterwards.

## The three numbers the watch act needs

Answered by [[exp-inflight-death]] and [[exp-watchdog]], 2026-08-14.

- THE DEADLINE, above 94 ms. That is how long a crashing process took to reach
  the caller, and anything tighter would call a crash a hang.
- THE BEAT INTERVAL, around 200 ms.
- THE ALLOWANCE, about three missed beats, which declares a wedge in 600 ms.

THE DEADLINE IS THE MECHANISM AND THE BEAT IS AN ADDITION. A heartbeat was
answered 8 of 8 times by a satellite whose call never returned, so a beat alone
reports the likelier hang as healthy.

WHAT THE BEAT BUYS ANYWAY. It declares a blocked event loop in 600 ms where a
deadline generous enough for real work takes seconds, and it sees a wedge while
the satellite is idle, which no deadline can.

## What is unmeasured and decides its cost

A satellite start with the engine module load INCLUDED. Every figure on the
board excludes it.

exp-kill-and-resume and exp-latency-ledger measure a record re-entry at worst
15.2 seconds for 28 signed states.

## Boundary

[[if-core-satellite]] to what it supervises, and the platform's process
facilities beneath it.
