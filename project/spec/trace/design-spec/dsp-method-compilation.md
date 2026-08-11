---
id: dsp-method-compilation
type: "[[design-spec]]"
statement: authored method compiled into runnable machines, carried by the rigor matrix, drawn canvases and seeded drawings sharing one state shape
realizes:
  - "el-method-compiler"
files:
  - "project/deliverable/engine/rigor-matrix.ts"
  - "project/deliverable/engine/canvas.ts"
  - "project/deliverable/engine/catalogs.ts"
  - "project/deliverable/engine/machines/compile.ts"
  - "project/deliverable/engine/expmachine.ts"
---

## Responsibility

Three sources compile to one machine shape: the rigor matrix's rows per
change size, a person's Obsidian canvas, and the record's seeded
drawings. Catalogs read live off method cards, so editing the card
edits the offer. The machine is never stored — it recompiles on every
look, so a row edited a moment ago serves on the next pull.

## Behavior and constraints

- A row that breaks a law refuses at parse, naming the row.
- The matrix floor states are never struck.
- A canvas failing to compile leaves the walk standing.
