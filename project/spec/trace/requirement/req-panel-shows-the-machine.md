---
id: req-panel-shows-the-machine
type: "[[requirement]]"
statement: "When the workspace opens after setup, the editor shall show the panel beside the editing area with the machine drawn on it."
kind: functional
verify_method: demonstration
breaks_if_removed: "The machine runs but nothing shows where the walk stands, and the person steers blind."
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect step 4
  - uc-install-quackitect guarantee
priority: should
---
