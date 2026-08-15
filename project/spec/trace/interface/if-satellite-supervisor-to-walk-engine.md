---
minted_in: i27
id: if-satellite-supervisor-to-walk-engine
type: "[[interface]]"
statement: The supervisor starts the walk engine with its machine and its position, and never hands either again.
source: el-satellite-supervisor
destination: el-walk-engine
carries:
  - flow-compiled-machine
  - flow-position
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
---

The engine is now something that gets started rather than something that
runs. That is the whole change at this crossing.

## Handed once

A machine change or a position change means a new satellite,
composed and started again, not an update pushed across here.

## Why not update in place

An engine whose machine changes mid-walk is running
rules the walk did not begin under, which is the mixture the entry demand
forbids. Replacement is the only shape that cannot produce it.
