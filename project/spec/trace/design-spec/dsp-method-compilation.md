---
minted_in: i1
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
  - "project/deliverable/engine/machines/supply.ts"
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
- NO STATE DEMANDS WHAT IT CANNOT SUPPLY (i6). Both compile paths refuse
  a state whose required evidence resolves against something no verb it
  grants can make, naming the state, the field and the verbs that would
  close it. Refusing here is a fix somebody can make; refusing at the
  state leaves the walk with no legal move and nothing to read.
- THE CHECK WAS MEASURED BEFORE IT WAS ARMED. `bin/supply-gaps.ts`
  reports rather than throws, and it ran first — 29 pairs across four
  columns, all one shape. A check that refuses is armed against the real
  corpus or not at all.
