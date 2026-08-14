---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: dsp-core-and-satellite
type: "[[design-spec]]"
statement: one core process owning what must be one thing, one satellite per agent owning one record, and a local channel between them that names the store on every answer
realizes:
  - "el-core"
  - "el-satellite"
  - "if-core-satellite"
  - "if-core-to-mirror"
  - "if-satellite-to-account"
  - "if-record-store-to-satellite"
  - "if-method-compiler-to-satellite"
  - "if-engine-delta-to-satellite"
files:
  - "project/deliverable/engine/core.ts"
  - "project/deliverable/engine/satellite.ts"
  - "project/deliverable/engine/bin/se-mcp.ts"
---

## Responsibility

THE CORE owns trunk, the mirror, the claim ledger, the note inbox, the call
log, the routing table, and the count of heavy slots. It decides who owns a
path and either answers or routes.

A SATELLITE owns one agent's work on one record: the walk position, the bound
record, that record's thin tree, and the engine it is running.

WHAT NEITHER DOES. Neither re-realizes the elements it contains. The walk
engine still walks, the test runner still runs tests, the seam still resolves.

## Interface

`if-core-satellite`, over a local channel, carrying ten flows plus the lease
and the beat.

- DOWN: a call the core received and a satellite owns.
- UP: the answer, carrying the store it resolved against.
- UP: a shared read from a satellite to trunk.
- BOTH: supervision, the heavy-slot lease, the beat.

THE NAMING CLAUSE RIDES THE CROSSING deliberately. An answer that crossed a
process boundary is the one a reader cannot check by eye.

## Behavior and constraints

THE CHANNEL COSTS 144 MICROSECONDS per acknowledged append, measured in
[[exp-channel-cost]] against a one-second budget. Twenty satellites serialised
behind one core would spend 0.3 percent of it, by arithmetic on that number.

ATTACK THE FLOOR BEFORE THE CROSSING. The same probe measured a DIRECT append
at 124.7 microseconds, because the file is opened and closed each time. A
kept-open handle is worth more than any channel design could win back.

THE CALL LOG APPENDS DIRECTLY rather than routing, per
[[if-satellite-to-account]]. A log that depends on the core being reachable
loses exactly the entries written when something is wrong.

THE HEAVY-SLOT LEASE, and it is a lease rather than a pool. A satellite takes
a token from the core before spawning a heavy child and returns it after. The
child stays the satellite's, so it inherits the working directory and runs the
record's own composition.

WHY NOT A POOL OF WORKERS. A shared worker is nobody's child. It inherits no
working directory, runs no record's engine composition, and would outlive the
satellite that asked — which [[if-satellite-supervisor-to-test-runner]]
forbids outright.

## Rationale

THE SHARED STATE GETS AN OWNER BY DESIGN, which is the one thing
[[cand-os-rooted]] pays for and does not price.

IT DEGENERATES CLEANLY. One core and one satellite is a working system, so the
shape costs nothing until a second agent arrives.

WHAT IT LEANS ON is probed rather than assumed:
[[raid-asm-machine-wide-state-serves-over-a-local-channel]] holds for the call
log at the number above.
