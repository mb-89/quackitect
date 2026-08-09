---
id: req-fallen-condition-named
type: "[[requirement]]"
statement: If a filled state's conditions no longer hold, then the panel shall show the state unmet and name the condition that fell.
kind: functional
verify_method: test
breaks_if_removed: A state whose ground fell still shows met; the panel lies green.
breaks_how_badly: crippling
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence ext 4a
  - ".se/req-mine-v1.md: The ledger and truth"
priority: should
---
