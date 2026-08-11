---
id: if-front-desk-to-mirror
type: "[[interface]]"
statement: The desk's recommendation rides the survey payload the mirror renders.
source: el-front-desk
destination: el-mirror
carries:
  - flow-recommendation
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
---

Served on request; the mirror never caches a recommendation.
