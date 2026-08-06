---
id: req-land-conflict-refuses
type: "[[requirement]]"
statement: "If the merge onto trunk conflicts, then the engine shall stop the land, name every conflicting file, and merge nothing."
kind: functional
verify_method: test
breaks_if_removed: "A conflicted merge resolves silently; trunk carries code nobody wrote or reviewed."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk ext 6a
  - ".se/req-mine-v2.md: worktrees and parallel streams"
priority: must
---
