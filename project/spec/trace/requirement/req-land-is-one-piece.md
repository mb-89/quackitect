---
id: req-land-is-one-piece
type: "[[requirement]]"
statement: "When the land gate is blessed, the engine shall merge the record's branch onto trunk as one merge, remove the worktree, and keep the branch for history."
kind: functional
verify_method: test
breaks_if_removed: "Work lands in fragments or leaves a stale worktree; trunk and record disagree about what shipped."
refines:
  - uc-land-work-on-trunk
source_refs:
  - uc-land-work-on-trunk step 6
  - ".se/req-mine-v2.md: worktrees and parallel streams"
priority: must
---
