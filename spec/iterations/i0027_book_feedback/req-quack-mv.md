---
id: req-quack-mv
type: requirement
depends_on: []
statement: When an id is renamed, the engine shall follow every reference class the workspace owns in one journaled, undoable command. The classes are the file name, markdown links, bare ids, edge lanes, and the engine source.
class: review
killer: false
kind: functional
provenance:
  statement: owner ruling 2026-07-19 (the Obsidian discussion) - link maintenance is purely mechanical and never an agent hand-sweep
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Rationale (not load-bearing)
The c14 and context-model renames cost hand-swept sessions; half of every rename lives outside markdown where no vault tool reaches. The determinizer law applies verbatim.
