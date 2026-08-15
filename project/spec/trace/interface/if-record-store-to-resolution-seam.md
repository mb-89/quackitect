---
minted_in: i27
id: if-record-store-to-resolution-seam
type: "[[interface]]"
statement: The record store tells the seam where a record's working copy actually is, so the seam judges paths against the tree that exists rather than one it assumed.
source: el-record-store
destination: el-resolution-seam
carries:
  - flow-worktree
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
  - opt-the-claim-file-registers-the-tree
---

ONE QUESTION AND ONE ANSWER: given a record, which tree holds it.

THE STORE IS THE ONLY AUTHORITY on that, and the claim file is where it is
written, so the answer survives a machine that has no local copy.

WHY THE SEAM ASKS RATHER THAN COMPUTING. A tree's location derived from a
naming convention is a guess that breaks the first time a record lives
somewhere unusual. Asked, it is a fact.
