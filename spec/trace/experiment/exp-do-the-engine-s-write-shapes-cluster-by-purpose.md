---
unreachable_citations:
  - decisions.ts
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: exp-do-the-engine-s-write-shapes-cluster-by-purpose
type: "[[experiment]]"
statement: Do the engine's direct disk writes cluster into a few purposes a door could serve, measured by classifying every write site by its shape?
probes:
  - raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself
timebox: one script counting the write shapes
form: script
chunk: none — every write site in the engine was classified, and every borderline site in the seven heaviest modules was read by hand
faked: none. The real tree was scanned. The classifier is deterministic and three runs gave byte-identical counts, so there is no variance to report.
fallback: pre-agreed at seeding. A majority of sites in the pile a door would only lengthen kills the widened scope, and the record falls back to the narrow guard alone.
verdict: holds
measured: "2026-08-26. 151 write sites in 41 files across the whole engine, and 123 in 29 files in engine core. Eight shapes, led by mkdir-then-write at 38 and read-modify-write at 37. Two figures the assumption carried were corrected: 30 of 64 became 25 of 64, and 117 across 50 files measures 123 across 29."
folds_to: Two figures on the assumption are corrected - 30 of 64 becomes 25 of 64, and 117 across 50 files becomes 123 across 29. The door's scope is set from the read-modify-write pile at 37 of 151, never from the raw site count. The unexplained 50-file figure is recorded as open.
promote: none - the finding is the product
source_refs:
  - rank-unknowns, the seeded pick
  - raid-asm-the-seven-heaviest-modules-speak-for-the-other-fifty-three — the sibling spike over the rest of the tree
---

## Setup

A classifier read every write site under `deliverable/engine`, recursively, counting `bin/`, `editors/` and `machines/`.

Each site was put in one of eight shapes by what the surrounding code does: mkdir-then-write, read-modify-write, one-shot-write, mkdir-only, append-log, delete-or-move, copy, chmod.

Every borderline site in the seven heaviest modules was then READ, because the assumption's own figure rests on those seven.

## Result

HOLDS. THE SHAPES DO CLUSTER, AND TWO FIGURES IN THE ASSUMPTION WERE WRONG.

### The shapes, whole engine

151 write sites in 41 files.

- mkdir-then-write: 38
- read-modify-write: 37
- one-shot-write: 25
- mkdir-only: 16
- append-log: 16
- delete-or-move: 14
- copy: 4
- chmod: 1

The single `chmod` is `deliverable/engine/bin/preflight.ts:164`.

Engine core alone, meaning top-level `deliverable/engine/*.ts`, is 123 sites in 29 files: read-modify-write 32, mkdir-then-write 29, one-shot-write 20, mkdir-only 14, append-log 14, delete-or-move 12, copy 2.

### Correction one: the one-shape count was 30 of 64, and it is 25

The assumption said 23 read-modify-writes plus 7 preceding `mkdirSync` calls in the seven heaviest modules.

Hand-reading gives 20 read-modify-writes plus 4 `mkdirSync` calls that immediately precede one.

The machine classifier says 21, one higher. That extra one is a false positive, verified by reading: `deliverable/engine/produce.ts:314` writes `README.md` from a template read out of a DIFFERENT file, so it is a one-shot write of a generated file rather than a round trip.

Two corrections went the other way, and both were misses in the earlier passes. `deliverable/engine/iterations.ts:257` and `:287` each read `recAbs`, rewrite one frontmatter line, and write it straight back.

### Correction two: engine core was 117 across 50 files, and it measures 123 across 29

The verb list is not in dispute. The seven modules agree exactly at 64 sites on both counts.

What could not be reconstructed is a scope yielding 50 files. THE 50-FILE FIGURE IS UNEXPLAINED, and it is recorded rather than dropped.

### What the clustering means for the door

Three examples per shape, so a reader can check the classification.

- read-modify-write: `session.ts:3593`, `sessionclaims.ts:1083`, `iterations.ts:257`
- append-log: `calllog.ts:195`, `run.ts:474`, `decisions.ts:421`
- mkdir-then-write: `calllog.ts:194`, `sessionclaims.ts:1360`, `discipline.ts:147`
- one-shot-write: `benchmark.ts:359`, `session.ts:2196`, `bound.ts:111`
- delete-or-move: `benchmark.ts:393`, `move.ts:118`, `sessionforms.ts:155`
- mkdir-only: `files.ts:457`, `pool.ts:247`, `vault.ts:397`
- copy: `benchmark.ts:123`, `produce.ts:188`, `bin/package.ts:47`

The read-modify-write pile is the one a door serves best, because the round trip is where a check belongs. At 37 of 151 it is a quarter of the whole engine rather than the half the assumption's wording implies.

SO THE OBJECT THAT PAYS IS A CLAIM WRITER RATHER THAN A FACADE OVER DISK, and that reading survives the corrections.

### The clean counter-example still stands

`deliverable/engine/run.ts` is 0 of 10. Every write is an append to a log it owns, through three module-local helpers at lines 438, 442 and 1403 that already jail them under `.se/jobs`.

A door in front of that module would lengthen ten call sites and improve none.
