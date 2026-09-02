---
id: wk-b13ade88e2
seq: 1000001
type: work
title: a commit stages itself
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: main
---

## detail

The guard refuses a git commit that stages a path nothing in this turn has touched. The rule to stage by path exists and was broken three times in one session, so it wants a refusal. The guard sees every tool call in the turn with its path or command. It keeps the set of paths this turn has written in a file, since it is a fresh process per event. A commit that would stage a file outside that set is refused naming the file. git add -A is therefore refused whenever anything else has changed. An escape for a person's editor changes is a flag the agent has to type, not the default. Agree the shape before building: whether the guard can see the staged set cheaply, and whether a turn is the right window.
