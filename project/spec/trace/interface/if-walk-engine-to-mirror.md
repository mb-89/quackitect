---
id: if-walk-engine-to-mirror
type: "[[interface]]"
statement: The mirror fetches the engine's forms and feed over the local port, and never advances the walk.
source: el-walk-engine
destination: el-mirror
carries:
  - flow-call-log
  - flow-evidence-form
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
---

Served on request, on the machine's own port; the mirror stays read-and-ask.
