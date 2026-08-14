---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: exp-trunk-read-cost
type: "[[experiment]]"
statement: Can a per-access read of a method file at a committed trunk ref stay inside the walk's patience, measured against plain disk?
probes:
  - raid-dec-thin-tree
timebox: half a day
form: script
faked: none — the runs hit the real repository over twenty real method files
fallback: worktree copies of the method tree, the fan-out class returning
verdict: holds
measured: 2026-08-10 — spawn-per-read 47 to 54 ms per file; one long-lived batch reader 2.0 ms per file (20 files, 41 ms total); plain disk 0.5 ms
folds_to: "raid-dec-thin-tree carries the dated measurement — the bet holds in the batch-reader shape only, and no requirement moves"
promote: "the long-lived batch reader as the M7 build's trunk-read shape — a spawn per read is ruled out by measurement"
chunk: "trunk-batch-reader"
source_refs:
  - rank-unknowns, the seeded pick
---

## Setup

Twenty method files under machines/methods, read three ways on the
reference machine:

- git show spawned per file, cold pass then warm pass.
- one long-lived git cat-file batch process fed all twenty paths.
- plain readFileSync as the floor.

## Result

2026-08-10. Spawn-per-read p50 53.8 ms cold and 46.9 ms warm. The batch
reader 2.04 ms per file. Disk 0.46 ms.

The per-access bet HOLDS through a long-lived batch reader — 2 ms sits
well inside the walk's patience, beside the 4.3 ms corpus stamp check.
It FALLS in the spawn shape: 25 times the batch cost, and a hundred-file
sweep would take five seconds on the serving loop.
