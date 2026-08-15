---
minted_in: i27
id: if-method-compiler-to-satellite
type: "[[interface]]"
statement: The satellite walks the machine the compiler pinned for its record — handed in at start, never re-read mid-walk.
source: el-method-compiler
destination: el-satellite
carries:
  - flow-compiled-machine
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - if-method-compiler-to-walk-engine
---

The same contract if-method-compiler-to-walk-engine already carries, at the
satellite's boundary rather than the engine's, because the compilation is now
per record.

## Pinned at start

A recompile reaches a satellite by replacement, so a walk
finishes under the machine it began under.

## Why per record

A record may override method files in its own folder, so two
satellites can legitimately run different machines at the same moment. That
is divergence by design and it resolves when the records land.
