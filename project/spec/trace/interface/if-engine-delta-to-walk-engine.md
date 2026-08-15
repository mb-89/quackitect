---
minted_in: i27
id: if-engine-delta-to-walk-engine
type: "[[interface]]"
statement: The walk engine runs the composition the delta resolved for its record, and never loads a module by any other route.
source: el-engine-delta
destination: el-walk-engine
carries:
  - flow-compiled-machine
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-an-engine-change-applies-in-its-own-record
---

No other route is the whole contract. One module loaded outside this
composition serves the wrong version and reports success, which is the silent
failure the register grades fatal.

## What crosses

The resolved module set for this record, and which of them came
from the record's own folder.

## The engine does not look up overrides itself

It is handed a composition. That
is what keeps the two-level rule in one place instead of in every module that
happens to import another.

## Fixed for the engine's life

A different composition means a different
satellite, so this interface never carries a change.
