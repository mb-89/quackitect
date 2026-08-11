---
id: if-record-store-to-mirror
type: "[[interface]]"
statement: The mirror shows the walk's position and the archive listing, served on request.
source: el-record-store
destination: el-mirror
carries:
  - flow-archive-listing
  - flow-position
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
---

Read-only; the archive opens to a person only.
