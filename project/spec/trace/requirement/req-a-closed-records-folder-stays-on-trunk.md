---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: req-a-closed-records-folder-stays-on-trunk
type: "[[requirement]]"
statement: When a record closes, the engine shall leave that record's folder on trunk and shall not remove it from the working tree.
kind: functional
verify_method: test
breaks_if_removed: The archive can only show a closed record by reading it out of git, which reintroduces the retrieval path this iteration exists to delete.
breaks_how_badly: crippling
refines:
  - uc-close-a-record
  - uc-browse-the-archive
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-a6d2f0781686
priority: must
---

## Detail

WHAT CHANGES. `mergeAndRetire` at engine/worktree.ts:466 runs
`git rm -r -q --ignore-unmatch <dirRel>` on the record directory, commented
"CLOSED RECORDS LIVE IN GIT... the tree carries only live work." That line
goes.

WHAT STOPS BEING NEEDED once it does:

- `git show <branch>:<rel>` at engine/worktree.ts:105.
- The batched `git cat-file --batch` at engine/expmachine.ts:195.
- Any manifest of closed id to commit hash. It was designed in full earlier
  the same day and is not needed at all under this rule.

THE RENDERER IS UNAFFECTED, which is what makes this cheap. `buildArchive`,
`buildDecades` and `buildRecordColumn` take `{sid, full, goal}` and never
touch a tree, a branch or a path. Only their FEED changes.

THE COST, stated on the node rather than discovered later: closed records stay
in the working tree forever, so the tree grows with every iteration. Measured
against it: the whole spec tree is 2,138,305 bytes across 796 files today, and
a finished record is well under a megabyte.
