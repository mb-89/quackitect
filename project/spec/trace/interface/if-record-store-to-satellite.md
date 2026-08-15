---
minted_in: i27
id: if-record-store-to-satellite
type: "[[interface]]"
statement: The record store gives a satellite its worktree and its position, and takes back nothing.
source: el-record-store
destination: el-satellite
carries:
  - flow-position
  - flow-worktree
form: files
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-resume-needs-no-person
---

## Files, deliberately

The position is recomputed from what is on disk rather
than handed over as state, which is what makes a satellite replaceable under
a live walk without the agent noticing.

## What crosses

The worktree the satellite is rooted at, and the record's
signed evidence from which the position is derived.

## Why the position is derived rather than passed

A passed position lives in a
process and dies with it. A derived one survives a satellite being replaced,
a crash, and a machine going away. This is the property every candidate on
the chart relied on and only this shape has to lean on it hard.

## What it costs

It is measured. exp-kill-and-resume and exp-latency-ledger
put a record re-entry that recomputes position from files at worst 15.2
seconds for 28 signed states. Whether a satellite start pays that or
something far cheaper is the number M6 must measure before this is built.
