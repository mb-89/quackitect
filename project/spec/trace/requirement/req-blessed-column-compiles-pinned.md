---
id: req-blessed-column-compiles-pinned
type: "[[requirement]]"
statement: When the change size is blessed, the engine shall compile the chosen column into a state machine owned by the iteration and pin it to the record.
kind: functional
verify_method: test
breaks_if_removed: The iteration runs a machine it does not own; a mid-walk method edit changes its rules silently.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 6
priority: must
---
