---
id: req-archive-releases-worktrees
type: "[[requirement]]"
statement: "When a record archives, the engine shall remove every worktree bound to it, leaving zero worktrees referencing the record."
kind: functional
verify_method: test
breaks_if_removed: "Stale worktrees survive the archive, and nobody can prove nothing unfinished survived the close."
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record ext 6a
  - ".se/req-mine-v2.md: v2-042 ship merge removes worktree"
priority: should
---

## Detail

## Detail

- The branch stays for history. Only the worktree goes.
- Removal follows the strays commit, so nothing unlanded is destroyed.
