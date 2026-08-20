---
minted_in: i1
id: nbr-git
type: "[[neighbour]]"
statement: Git, which holds the history, the branches and the worktree every record is walked in.
direction: out
---

## Interface

An allowlisted set of commands the lane runs: status, log, diff, show, add,
commit, fetch, branch, rev-parse, restore, checkout, merge — plus the
worktree operations that seed and bind a record.

PUSH IS NOT IN THE LIST. Pushing is the person's act, and no lane call
performs it. Rebase is absent too: a diverged branch reconciles by merge,
which only ever adds a revertable commit.
