---
id: req-finding-keeps-its-sources
type: "[[requirement]]"
statement: The reference corpus shall hold every kept finding with links to the sources that support it.
kind: functional
verify_method: inspection
breaks_if_removed: A finding floats free of its sources; nobody can re-check it.
breaks_how_badly: crippling
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer step 3
priority: must
---
