---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-name-the-resolved-tree-in-every-answer
type: "[[option]]"
statement: resolve as today and return the tree that was resolved with every answer, so a wrong resolution is visible at the call rather than at a merge
cluster: cluster-the-walk
question: how a resolution is made visible
found_by: prior-art
source: "workspace root detection in monorepo tooling — findProjectRoot walks up for a workspace manager root and falls back to the git root; https://microsoft.github.io/workspace-tools/functions/findProjectRoot.html"
---

## Mechanism

The resolution rule does not change. What changes is that the answer says
which tree it came from, on every read and every write.

THE FIELD'S OWN FAILURE IS THE ARGUMENT. Monorepo tooling resolves to the
git repository root rather than the workspace root the caller is actually
in, and the reported pitfall is that a worktree gets created at the repo
root holding the whole monorepo when the caller meant one project. The
resolution is not wrong so much as unstated.

WHAT IT COSTS HERE. One field on every lane answer, and nothing else moves.
It is by far the cheapest of the three shapes.

WHAT IT DOES NOT DO. It stops nothing. A misroute still happens; it is
merely visible afterwards. Against raid-risk-a-write-lands-in-the-wrong-tree-
silently that is exactly the mitigation named - the proof is a read-back and
never the write's own verdict - so this may be a component of a winner
rather than a winner.
