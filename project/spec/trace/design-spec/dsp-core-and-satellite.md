---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: dsp-core-and-satellite
type: "[[design-spec]]"
statement: one core owning the shared state and many satellites walking their own records, carried by a typed crossing that runs in-thread, in a worker or across processes
realizes:
  - "el-record-store"
files:
  - "project/deliverable/engine/core.ts"
  - "project/deliverable/engine/satellite.ts"
  - "project/deliverable/engine/channel.ts"
  - "project/deliverable/engine/transports.ts"
  - "project/deliverable/engine/supervisor.ts"
  - "project/deliverable/engine/delta.ts"
  - "project/deliverable/engine/mode.ts"
  - "project/deliverable/engine/bin/se-satellite.ts"
---

## Responsibility

One process owns what must be one thing on a machine. That is trunk,
the ledgers and the claim file.

Everything else is a satellite. A satellite walks its own iteration
against its own worktree.

The core never walks. The satellites never touch the shared state
directly.

## Interface

Satellites reach the core over one typed crossing. It carries three
kinds of traffic, and every answer names the store it came from.

Three transports carry that same crossing:

- inline, on this thread
- a worker thread
- a child process

The run mode picks which one. The separation is present in all three,
which is what makes three modes a setting rather than three products.

Two helpers ride alongside. The supervisor watches heartbeats and
levels a record tree against trunk. The delta composes what one record
overrides on top of what trunk serves.

## Behavior and constraints

- The crossing carries the store on every answer. A wrong routing shows
  at the call, not at a merge.
- A satellite that misses its beats is judged by the supervisor. It is
  never judged by itself.
- The child-process transport starts all-or-nothing. The whole spec
  arrives as one argument, or the satellite does not start.

## Standing

BUILT AND TESTED, NOT YET ON THE LIVE PATH. The running server does not
import this cluster. Six test files exercise it directly.

The finding is recorded in
raid-debt-core-and-satellite-is-off-the-live-path.
