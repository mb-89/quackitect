---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: el-core
type: "[[element]]"
statement: Owns what must be one thing on a machine, and routes every call to whatever owns its path.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk
satisfies:
  - req-version-control-resolves-like-every-call
  - req-a-method-change-reaches-every-tree
  - req-a-surface-resolves-to-what-it-shows
source_refs:
  - cand-core-satellite
  - opt-a-core-and-a-satellite-per-agent
  - raid-dec-a-must-outranks-a-score
---

One process, always up, holding what genuinely cannot be split.

## What it owns

- trunk
- the mirror
- the claim ledger
- the note inbox
- the call log
- the routing table that maps a record to the satellite serving it
- the count of heavy slots the machine will run at once

## What it does with them

A call arrives naming a path. The core decides who owns that path — itself for
trunk, a satellite for a record — and either answers or routes.

Routing is the element's whole job. Every other property follows from it.

## Why a method change needs no step-out

Shared method lives in trunk and the core serves trunk. So a call naming trunk
from inside a record is routed rather than refused.

That door is also what version control uses.

## What it does not implement

This is the grouping judgment rather than an omission. The core OWNS the
mirror, the claim ledger, the note inbox and the call log. It does not
re-realize their functions.

Those elements keep them, and the core is where they now live.

## Why the heavy-slot count is here

Twenty-seven satellites each spawning a test run would leave a machine nobody
else can work on, and [[raid-asm-the-target-machine-is-many-throttled-cores]]
records that this machine is shared and thermally throttled.

A SATELLITE TAKES A TOKEN BEFORE IT SPAWNS A HEAVY CHILD, and returns it after.
The bound is machine-wide because the count is here.

WHY THE CORE HOLDS THE PERMISSION AND NOT THE WORK. A shared worker cannot be
a child of any satellite, so it inherits no working directory and runs no
record's engine composition. Every job a satellite hands off is
record-specific, so the child stays the satellite's.

WHAT THIS SHAPE GIVES UP. A pool of workers could stay warm and skip the
start. [[exp-satellite-start]] measured 306.9 ms per start with the engine
loaded, so the saving is real and a lease does not take it.

## Boundary and realization

Boundary: [[if-core-satellite]] to every satellite, and the lane's own surface
to a caller.

Realization: grown from the standing mirror, which is already a long-lived
server and is the natural place for machine-wide state to end up.
