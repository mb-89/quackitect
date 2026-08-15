---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-archive-releases-worktrees
type: "[[requirement]]"
statement: When a record archives, the engine shall leave zero working copies of it occupying disk, and shall keep the record retrievable from the repository alone.
kind: functional
verify_method: test
breaks_if_removed: Stale worktrees survive the archive, and nobody can prove nothing unfinished survived the close.
breaks_how_badly: corrosive
refines:
  - uc-close-a-record
source_refs:
  - uc-close-a-record ext 6a
  - ".se/req-mine-v2.md: v2-042 ship merge removes worktree"
priority: should
weighs_against:
  - req-small-fix-joins-open-record >
---

## Detail

## Detail

- The branch stays for history. Only the worktree goes.
- Removal follows the strays commit, so nothing unlanded is destroyed.
