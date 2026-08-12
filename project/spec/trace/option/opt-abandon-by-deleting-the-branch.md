---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: opt-abandon-by-deleting-the-branch
type: "[[option]]"
statement: make abandoning work a deletion rather than a ruling, so a failed attempt costs nothing to throw away
cluster: cluster-the-record-life
found_by: prior-art
source: "The agent inside a real repo: isolating tasks with git worktree, https://www.ramonchancay.me/blog/agent-in-a-real-repo"
---

## Mechanism

Each task is a branch in its own worktree. A failed attempt is a branch you
delete, and nothing else has to happen: no close, no report, no ruling on
what it produced. The source pairs this with reproducing a bug as a test
before fixing it, and shipping as a pull request rather than a merge.

WHAT IT WOULD COST HERE. It contradicts the close function directly. This
system refuses a close over an unruled finding, on the argument that a
report nobody reads turns findings into history. Cheap abandonment says the
opposite: most attempts produce nothing worth ruling on, and forcing a
ruling makes people avoid abandoning.

Both cannot hold. That is what makes this a real cell rather than a variant.
