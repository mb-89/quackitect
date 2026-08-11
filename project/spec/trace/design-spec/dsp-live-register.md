---
id: dsp-live-register
type: "[[design-spec]]"
statement: notes as one live table, carried by base view files evaluated over the vault on every look
realizes:
  - "el-mirror"
files:
  - "project/deliverable/engine/bases.ts"
  - "project/deliverable/engine/basesclient.ts"
  - "project/deliverable/engine/baseui.ts"
  - "project/deliverable/engine/tables.ts"
  - "project/deliverable/engine/vault.ts"
  - "project/deliverable/engine/expr.ts"
  - "project/deliverable/engine/bin/bench-vault.ts"
  - "project/deliverable/engine/bin/format-vault.ts"
---

## Responsibility

The register as a table: rows derive from the vault's notes, the view
declaration is itself a file, grouping and sorting hold, expressions
evaluate per reference, a cell edit lands on the note it names, and
what cannot be drawn is refused by name. The pivot and dependency
matrices ride the same machinery.

## Rationale

This is the work-the-register function made concrete — the design the
iteration set out to prove: a bases-equivalent live table over plain
markdown.
