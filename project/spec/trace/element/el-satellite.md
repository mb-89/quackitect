---
minted_in: i27
id: el-satellite
type: "[[element]]"
statement: Serves one agent's work on one record — its walk, its tree, and the engine that agent is running — and knows nothing of any other record.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk.serve-a-step
satisfies:
  - req-an-engine-change-applies-in-its-own-record
  - req-a-read-comes-from-where-it-is-meant
  - req-a-write-lands-where-it-is-meant
  - req-parallel-iterations-own-worktrees
  - req-entry-levels-the-record-tree
source_refs:
  - cand-core-satellite
  - opt-a-core-and-a-satellite-per-agent
  - opt-one-process-per-record-rooted-by-the-os
  - raid-asm-the-target-machine-is-many-throttled-cores
---

One per agent at work. Started in its record's tree, so the platform resolves
the common path and the element writes no rule for it.

## What it holds

- the walk position
- the bound record
- that record's thin tree
- the engine it is running — trunk's, overridden by whatever delta the record
  carries in its own folder

## Why an engine change costs no step-out

The agent edits the delta and their satellite comes up on it. The core and
every other satellite keep what they were running.

The restart is the satellite's and the agent never performs it, because the
walk recomputes its position from the repository.

## Why it levels before it serves

A satellite brings its record's tree level and commits what it brought before
its first call.

Nothing is in flight at a process start, so a partial levelling cannot be
observed. It either comes up level or does not come up.

## Why it is the shape the target machine wants

[[raid-asm-the-target-machine-is-many-throttled-cores]] records many weak
cores. One process uses one; N satellites can use N.

That assumption names its own falsifier and the profile has not been run.

## What it does not implement

A satellite CONTAINS a walk engine, a test runner and a resolution seam. It
does not re-realize what they do.

- Judging a claim is still the walk engine's.
- Answering with tests is still the test runner's.
- Resolving a path is still the seam's.

The satellite is where they run.

## Boundary and realization

Boundary: [[if-core-satellite]] upward, and the record's own tree beneath it.

Realization: the standing walk engine, started per record rather than once.
