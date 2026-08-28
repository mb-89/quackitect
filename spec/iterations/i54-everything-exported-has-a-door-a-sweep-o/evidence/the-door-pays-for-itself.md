---
form: the-door-pays-for-itself
by: agent
signed_off: 2026-08-26T13:34:38.362Z
authors: agent
files: null
---

# Evidence form / the-door-pays-for-itself

## current_situation

HOLDS. The shapes cluster, and two figures the assumption carried were wrong.

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

Engine core alone is 123 sites in 29 files: read-modify-write 32, mkdir-then-write 29, one-shot-write 20, mkdir-only 14, append-log 14, delete-or-move 12, copy 2.

### Correction one: the one-shape count was 30 of 64, and it is 25

The assumption said 23 read-modify-writes plus 7 preceding `mkdirSync` calls in the seven heaviest modules.

Hand-reading gives 20 read-modify-writes plus 4 `mkdirSync` calls that immediately precede one.

The machine classifier says 21, one higher. That extra one is a false positive, verified by reading. `deliverable/engine/produce.ts:314` writes `README.md` from a template read out of a different file, so it is a one-shot write of a generated file rather than a round trip.

Two corrections went the other way. `deliverable/engine/iterations.ts:257` and `:287` each read `recAbs`, rewrite one frontmatter line, and write it straight back.

### Correction two: engine core was 117 across 50 files, and it measures 123 across 29

The verb list is not in dispute. The seven modules agree exactly at 64 sites on both counts.

No scope yielding 50 files could be reconstructed. That figure is unexplained, and it is recorded rather than dropped.

### What the clustering means for the door

The read-modify-write pile is the one a door serves best, because the round trip is where a check belongs.

At 37 of 151 it is a quarter of the whole engine rather than the half the assumption's wording implies. So the object that pays is a claim writer rather than a facade over disk, and that reading survives both corrections.

### The clean counter-example still stands

`deliverable/engine/run.ts` is 0 of 10. Every write is an append to a log it owns, through three module-local helpers at lines 438, 442 and 1403 that already jail them under `.se/jobs`.

A door in front of that module would lengthen ten call sites and improve none.

## built

- spec/trace/experiment/exp-do-the-engine-s-write-shapes-cluster-by-purpose.md

## follow_up

- The door's scope should be set from the read-modify-write pile, not from the site count. 37 of 151 is what pays, and the other 114 sites are where the cost lands.
- The unexplained 50-file figure stays open. Ready when somebody can name the scope it measured.
- `run.ts` is the shape to design against. A module that already jails its own writes behind local helpers is the case a door must not make worse.

## anything_else

The falsifier was written before the run. It was a majority of sites in the pile a door would only lengthen, and it did not happen.

Both corrections were found by re-reading rather than by a new script. The classifier agreed with the old figure until every borderline site was opened.
