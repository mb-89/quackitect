---
minted_in: i27
id: if-resolution-seam-to-engine-delta
type: "[[interface]]"
statement: The seam asks the delta which store holds a shared target.
source: el-resolution-seam
destination: el-engine-delta
carries:
  - flow-resolved-target
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - opt-thin-tree-reads-shared-from-trunk
---

## Where the two-level lookup lives

It is one step inside
the resolver every read already goes through rather than a second door beside
it.

## The sequence

Short on purpose.

- The seam resolves a path to a target and decides which record it belongs to.
- If the target names shared content — method or engine — it asks the delta.
- The delta looks in that record's own folder. Present, it answers with that.
  Absent, it answers with trunk.
- The seam returns the store it was given, and the answer names it.

## The order is the whole rule

Record first, trunk second, never both.

## Why it is under the seam rather than beside it

A caller never asks the delta
anything. Every read reaches it through the one resolver no verb may bypass,
so a lookup cannot be skipped by a verb that forgot about overrides.

## What it must not do

Merge. A file is served from one store or the other. A
composed file assembled from both is a mixture nobody
assembled, and a walk beginning in it starts from a
tree that does not compile. The requirement that named
that harm, req-entry-levels-the-record-tree, was retired
by i34 with the record trees. The harm is restated here
because the rule outlived its citation.
