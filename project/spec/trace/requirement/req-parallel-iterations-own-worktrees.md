---
id: req-parallel-iterations-own-worktrees
type: "[[requirement]]"
statement: Where two planned iterations have no unmet dependencies, the engine shall allow both to stand open at the same time, each in its own worktree.
kind: functional
verify_method: demonstration
breaks_if_removed: Two ready streams queue behind each other for no reason.
refines:
  - uc-open-an-iteration
source_refs:
  - ".se/req-mine-v2.md: Worktrees and parallel streams"
priority: could
---
