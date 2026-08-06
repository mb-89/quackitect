---
id: req-write-guarded-by-hash
type: "[[requirement]]"
statement: "If a write's base hash does not match the file on disk, then the engine shall refuse the write with zero bytes changed."
kind: functional
verify_method: test
breaks_if_removed: "An agent write clobbers a person's edit made moments before, losing authored work."
refines:
  - uc-take-a-step
source_refs:
  - ".se/req-mine-v2.md: the edit model and the file lane"
  - uc-take-a-step step 3
priority: must
---
