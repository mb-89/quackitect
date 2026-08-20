---
minted_in: i27
id: if-resolution-seam-to-method-compiler
type: "[[interface]]"
statement: The seam hands the compiler the resolved store each method file came from.
source: el-resolution-seam
destination: el-method-compiler
carries:
  - flow-resolved-target
form: in process
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-trace-source-never-mixes
---

The compiler never opens a path itself. It asks for resolved targets and
compiles what comes back, so a machine cannot be assembled half from a
record's overrides and half from trunk by accident.

## What crosses

For each method file, the store it resolved to. Trunk for most,
the record's own folder where that record overrides it.

## Why it matters here more than anywhere

A compiled machine built from a
mixture is a machine nobody authored, and the walk runs on it. This is the
crossing where such a mixture would be assembled if the compiler resolved for
itself.
