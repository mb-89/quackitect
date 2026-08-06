---
id: req-scaffold-refuses-existing-folder
type: "[[requirement]]"
statement: "If the requested product folder already exists, then the engine shall refuse the scaffold, name the existing folder, and write zero files into it."
kind: functional
verify_method: test
breaks_if_removed: "A name collision writes the scaffold into a standing product and destroys it."
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product ext 3a
priority: must
---
