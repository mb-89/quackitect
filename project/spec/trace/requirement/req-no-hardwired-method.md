---
id: req-no-hardwired-method
type: "[[requirement]]"
statement: "The engine shall serve zero method artifacts that an overlay file cannot replace."
kind: functional
verify_method: analysis
breaks_if_removed: "Method content hard-wired into engine code forces a fork for exactly the replacements the vendor path promises."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 3
  - uc-vendor-and-overlay step 4
  - ".se/req-mine-v1.md: lifecycle and distribution (data-shaped rules load from configuration files, never code constants)"
priority: could
---

## Detail

## Detail

Classes in scope, from the overlay contract:

| class | replaceable by overlay |
| --- | --- |
| guidance chapters | required |
| method cards | required |
| rigor rows | required |
