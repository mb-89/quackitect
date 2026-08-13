---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: opt-worktree-per-record
type: "[[option]]"
statement: give every unit of work its own working directory on its own branch, sharing one object database underneath
cluster: cluster-the-record-life
found_by: prior-art
source: "Git Worktrees for Parallel AI Agent Execution, https://www.augmentcode.com/guides/git-worktrees-parallel-ai-agent-execution"
---

## Mechanism

Each worktree carries its own files, its own staging area and its own HEAD.
The object database and the branch refs stay shared, so nothing is copied
twice and every tree sees the same history.

The reported use is parallel agents that never step on each other. The
source pairs it with a rule this project also holds: tests and automated
gates before a merge.

WHAT IT WOULD COST HERE. It is what the system already does, so the finding
is confirmation rather than a new cell. What the source adds is the FLEET
case — several agents at once — and this project has one worktree per record
rather than one per agent. Those are different axes and the chart should not
merge them.
