---
id: if-record-store-to-test-runner
type: "[[interface]]"
statement: The runner works the record's bound worktree — the tree on disk is the contract.
source: el-record-store
destination: el-test-runner
carries:
  - flow-worktree
form: file
source_refs:
  - decompose-structure, the element matrix's owed cell
---

The runner reads the tree as it stands; an unchanged tree keeps its last
verdict.
