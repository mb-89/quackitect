---
minted_in: i9
id: if-record-store-to-state-declaration
type: "[[interface]]"
statement: A record opening or closing a worktree asks the declaration where that tree's machine state resolves, so the folder is found the same way in a worktree as in the checkout it hangs off.
source: el-record-store
destination: el-state-declaration
carries:
  - flow-worktree
form: call
source_refs:
  - decompose-structure at i9, the element matrix's owed cell
  - probe P1 at i9 M4, 2026-08-19 — one machine-state folder per checkout, before and after the collapse
---

The crossing where the branch question actually lives.

## What crosses

THE WORKTREE, AND BACK THE FOLDER THAT BELONGS TO IT. Not a rule about branches:
the declaration answers for the tree it is handed, and the record store hands it
whichever tree the record is bound to.

## What the probe settled and what it did not

SETTLED: the count comes from the checkout rather than from the depth. One folder
per checkout before the collapse and one after, measured on a controlled tree
with the engine's own resolver.

NOT SETTLED: what a worktree nested INSIDE a checkout does. This project already
uses that shape for iteration work, and the same probe found the lane's read
exclusion does not hide it. That is filed as a note rather than answered here,
and this crossing is where the answer would land.

## Why the standing ruling is not in the way

SESSION STATE BELONGS TO THE MACHINE RATHER THAN TO A BRANCH, and that ruling is
about branches rather than depth. This interface honours it by resolving per tree
rather than per branch, which is the same thing said in the direction the code
can act on.
