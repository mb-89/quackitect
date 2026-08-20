---
minted_in: i9
id: if-state-declaration-to-method-compiler
type: "[[interface]]"
statement: The method compiler asks the declaration what the machine-state folder is, so a sweep over the tree knows what to walk past and the catch-up pass does not treat session state as drift.
source: el-state-declaration
destination: el-method-compiler
carries:
  - flow-resolved-target
form: call
source_refs:
  - decompose-structure at i9, the element matrix's owed cell
  - req-overhaul-takes-only-unowned-drift
---

The crossing that keeps a whole-tree pass from reading the machine's own state as
content that has drifted.

## What crosses

THE FOLDER AND ITS DOORED FILES. The sweep needs both: it walks past the folder,
and where the split-by-file rule makes most of it readable, it needs to know
which three are not.

## Why the compiler and not just the lane

THE SWEEP IS A DIFFERENT READER FROM THE LANE, with a different reason to walk
the tree. Before the declaration those two carried separate ideas of what to
skip, which is the drift this whole decision exists to remove.
