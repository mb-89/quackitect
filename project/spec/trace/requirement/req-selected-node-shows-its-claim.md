---
id: req-selected-node-shows-its-claim
type: "[[requirement]]"
statement: When a node is selected in the trace, the engine shall show the node's statement and type with zero further navigation.
kind: functional
verify_method: demonstration
breaks_if_removed: Reading a node means opening files one by one, and the survey pace dies.
breaks_how_badly: corrosive
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin step 3
priority: could
---
