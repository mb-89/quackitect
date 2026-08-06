---
id: req-diverged-trees-reported-never-merged
type: "[[requirement]]"
statement: If the trunk and the record's tree have diverged on a compiled source at reload, then the engine shall report every conflicting file and shall merge none of them.
kind: functional
verify_method: test
breaks_if_removed: A silent merge invents content neither tree holds, and the walk restarts on sources nobody wrote.
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk ext 3a
  - ".se/req-mine-v2.md: v2-043 conflict stops"
priority: must
---
