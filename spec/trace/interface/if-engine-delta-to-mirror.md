---
minted_in: i27
id: if-engine-delta-to-mirror
type: "[[interface]]"
statement: The delta tells the mirror which files each record overrides, so a person can see what a record has done to the machine without diffing anything.
source: el-engine-delta
destination: el-mirror
carries:
  - flow-compiled-machine
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-panel-shows-the-machine
---

The override list is the point. It is short by construction — usually
empty, and never larger than what one agent has changed.

## Superseded by i4

THE OVERRIDE LIST NOW REACHES THE SURFACE THROUGH THE RESOLVER, at
if-engine-delta-to-view-resolver. This crossing bore on
req-panel-shows-the-machine by its own source refs, so leaving it live would
have left the requirement the decision serves being answered on the surface.

## What crosses

Per record, the files served from that record's own folder
rather than from trunk.

## Why it is worth a surface

It answers "what has this record changed about the
machine" in one glance, which under a whole-copy shape would need a diff of
two engines.

## How a reader spots drift

A record whose override list has grown
long is one that has quietly become a fork, and nothing else on the panel
would say so.
