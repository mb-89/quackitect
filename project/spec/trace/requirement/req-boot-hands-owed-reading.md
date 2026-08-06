---
id: req-boot-hands-owed-reading
type: "[[requirement]]"
statement: "When the agent boots, the engine shall hand it every document the walk owes and shall place it at the standing position (the front desk on a fresh product) before any work state."
kind: functional
verify_method: test
breaks_if_removed: "An unread agent walks on guidance it never saw and the reading proof means nothing."
refines:
  - uc-install-quackitect
  - uc-resume-after-an-absence
source_refs:
  - uc-install-quackitect step 5
  - uc-resume-after-an-absence ext 3a
  - ".se/req-mine-sebots.md: Context discipline"
priority: must
---
