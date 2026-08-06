---
id: req-handover-read-at-boot
type: "[[requirement]]"
statement: "Where a handover was written for the next session, the boot shall serve its content before the first step of new work."
kind: functional
verify_method: test
breaks_if_removed: "What the last session wrote for this one is never read."
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence ext 6a
priority: should
---
