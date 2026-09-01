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

THE GUARD REFUSES A COMMIT THAT STAGES A PATH NOTHING IN THIS TURN HAS TOUCHED. WHY THIS RATHER THAN A RULE: the rule exists and it is right, stage by path and put a defect back in a worktree of your own, and I broke it three times in one session, twice within the hour of writing it down and the third ten minutes after widening it. MEASURED: three commits, each carrying a change to src/engine/pull.go that the message does not mention and the author did not make. Two of them deleted a refusal and left the tree red until somebody noticed. One was caught by a reviewer, one by a test run, one by me looking for something else. A RULE AN AGENT HAS TO REMEMBER AT THE MOMENT OF COMMITTING IS A RULE AN AGENT FORGETS, which is a sentence already in the method about other things, and it wants the same answer, which is a refusal. WHAT THE GUARD ALREADY KNOWS: it sees every tool call in the turn with its path or its command, so it can hold the set of paths this turn has written and refuse a git commit whose staged set reaches outside it. THE SHAPE THAT MAY WORK, and it wants agreeing before it is built: a commit is refused when it would stage a file this turn has not written, the refusal names the file, and git add -A is therefore refused whenever anything else has changed, which is the point. An escape is needed for the honest case where a person changed something in the editor and wants it committed, and that escape should be a flag the agent has to type rather than the default. WHAT IS UNCERTAIN: whether the guard can see the staged set cheaply, and whether a turn is the right window. The guard is a fresh process per event, so the set has to be a file like every other fact it remembers.

