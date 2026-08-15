---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: el-engine-delta
type: "[[element]]"
statement: Resolves every engine and method file by asking the record's folder first and trunk second.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk.hold-the-method
satisfies:
  - req-an-engine-change-applies-in-its-own-record
  - req-a-method-change-reaches-every-tree
  - req-overlay-resolution
  - req-shared-change-reaches-without-unlanded-work-reaching
source_refs:
  - cand-core-satellite
  - cand-live-engine
  - opt-thin-tree-reads-shared-from-trunk
  - raid-dec-thin-tree
---

Two-level resolution and nothing else: record first, trunk second.

## Why it exists

A record's tree is thin, so it holds no copy of shared method or of the
engine. A record must still be able to change the machine it runs.

A whole copy per record contradicts the thin tree and prices twenty-seven
engines on disk. A DELTA keeps both true.

## What a record holds

The files it changed and nothing more. Most records hold none.

## What that makes legible

The list of files in a record's folder IS what that record has done to the
machine, readable without diffing anything.

It lands on trunk with the rest of the record's work, by the path every other
output takes.

## What goes stale and where it is caught

Trunk moves, an override does not, and the composed result is a mixture nobody
assembled.

That is caught at entry by [[el-satellite-supervisor]], which reconciles the
delta and stops the record when it will not apply.

## The same mechanism serves method

Under this shape method and engine are the same kind of thing: files in the
record's folder that override trunk's.

## Boundary

The store the satellite reads through, sitting under [[el-resolution-seam]]
rather than beside it.
