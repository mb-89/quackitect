---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: req-shared-change-reaches-without-unlanded-work-reaching
type: "[[requirement]]"
statement: While a record is open, a change to shared method shall reach that record's walk, and no other record's unlanded work shall reach it.
kind: quality
characteristic: reliability
verify_method: test
breaks_if_removed: The two halves are pursued separately and the system gets one of them, so either a method fix stops at the tree that made it, or half-done work from one record poisons another.
breaks_how_badly: fatal
measure: With two records open, a method change made in either reaches both walks, and zero unlanded file from one is readable by the other's walk.
refines:
  - uc-take-a-step
  - uc-quality-reliability
source_refs:
  - "owner ruling 2026-08-14: multiple iterations run in parallel, all working on guidance or their own mechanisms — how do we make sure this does not poison each other, but the changes are still applied"
  - req-a-method-change-reaches-every-tree
  - req-parallel-iterations-own-worktrees
  - raid-dec-thin-tree
priority: must
---

## Scenario

- Source: two records open at once on one machine, and a maintainer.
- Stimulus: shared method changes while both walks are running.
- Artifact: the engine, and whatever holds each record's work.
- Environment: normal operation, any host.
- Response: both walks see the method change; neither sees the other's
  unlanded work.
- Response measure: the change reaches both, and zero unlanded file crosses.

## Detail

THIS IS ONE DEMAND BECAUSE IT IS ONE TENSION. The register carried both
halves as separate rows and they pull opposite ways:

- req-a-method-change-reaches-every-tree wants the change LIVE WHERE IT
  WAS MADE. It was restated on 2026-08-14 and no longer demands a fan-out.
- req-parallel-iterations-own-worktrees wants ISOLATION.

Written apart, a design can satisfy either and look compliant. Copy the
method into every tree and propagation passes while the copies drift. Seal
every tree and isolation passes while a method fix never arrives.

THE CONFLICT WAS NEVER VISIBLE because both halves were written as
mechanisms rather than as outcomes. That is what this row fixes.

## What is shared and what is not

- SHARED, and must propagate: method, guidance, the machines, the engine.
- PRIVATE, and must not: a record's own evidence, its trace nodes, its
  unlanded edits to anything.

The seam between them is the whole design question, and a candidate that
does not say where it falls has not answered this row.

## Behaviour

No model wanted. One invariant, checked with two records open.
