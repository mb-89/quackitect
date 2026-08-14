---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-fan-the-method-out-to-every-tree
type: "[[option]]"
statement: land a method change in trunk and every open tree in one act, so no walk ever has to leave its own tree to reach shared content
cluster: cluster-the-walk
question: how shared method reaches a tree
found_by: prior-art
source: "the retro ruling of 2026-08-06 — a method change lands in trunk and every open worktree at once, with the reconcile pass as the reload-time backstop; carried in note-76b47e277859"
---

## Mechanism

Nobody is confined and nobody is judged. The reason to leave a tree is
removed instead: every tree already holds what a walk might need.

It answers the problem from the opposite end from the other two. Confinement
and judgment both stop a wrong reach. This one removes the reach.

WHAT IT COSTS HERE. A write becomes N writes plus a reconcile pass, and the
cost grows with the number of open records - twenty-seven worktrees stood on
this machine on 2026-08-13.

THE ORDER IT IMPOSES. note-76b47e277859 rules that the guard must not be
retired alone: build the fan-out first and retire SE-C-134 in the same act,
because removing the guard without the mechanism removes the cost and the
protection together.

WHAT IT DOES NOT SOLVE. It says nothing about which tree a READ came from.
A tree holding a correct copy of everything still answers from whichever
copy the path happened to name.
