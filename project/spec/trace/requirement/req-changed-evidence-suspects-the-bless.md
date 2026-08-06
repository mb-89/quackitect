---
id: req-changed-evidence-suspects-the-bless
type: "[[requirement]]"
statement: "When blessed evidence or an artifact it cites changes, the engine shall mark the depending gate suspect."
kind: functional
verify_method: test
breaks_if_removed: "A reworded claim after the bless keeps the verdict while the ground under it moved."
refines:
  - uc-adjudicate-a-gate
source_refs:
  - uc-adjudicate-a-gate ext 5a
  - ".se/req-mine-v1.md: the ledger and truth"
priority: should
---
