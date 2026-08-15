---
form: record-adrs
amended: "2026-08-15T18:34:12.965Z by agent — the owner reversed the expiring claim on 2026-08-15 and ruled the list has exactly one reader; the decision set changes with both"
by: agent
signed_off: 2026-08-15T18:07:30.452Z
authors: agent
files:
---

# Evidence form / record-adrs

## current_situation

M5 records what the design decided. Four decisions are minted, each traced to the requirements it shapes.

THEY ARE NODES, not table rows, so a later iteration can point at one and argue with it.

TWO OF THE FOUR CAME FROM THE OWNER DIRECTLY, on 2026-08-15, and one of them reversed a decision this state had already recorded.

## adrs

- [[raid-dec-a-claim-ends-only-when-a-person-releases-it]]
- [[raid-dec-the-worktree-hangs-off-the-claim]]
- [[raid-dec-git-is-the-list-of-iterations]]
- [[raid-dec-one-verb-answers-what-exists]]

## follow_up

- evaluate-architecture is next, and it judges these four against the requirements they claim to shape
- ONE DECISION IS OWED AND NOT MADE HERE: how a machine starts. `req-one-command-starts-an-unattended-machine` is graded fatal and no ADR answers it.
- ONE QUESTION STAYS OPEN ON PURPOSE: whether a bound walk needs a worktree at all
- ONE HOLE IS REOPENED BY THE REVERSAL. A machine that dies still holds its iteration, and [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]] goes back to being unanswered.
- ONE NUMBER IS NO LONGER OWED. There is no expiry window to set, because there is no expiry.
- nothing is parked from this state

## anything_else

### What changed here after the owner read it

THIS STATE FIRST RECORDED THREE DECISIONS, and one of them said a claim is renewed while a walk runs and ends by itself when renewal stops.

THE OWNER REVERSED IT: "this machine is working on an iteration. You don't need an automatic lapse of that. Normally, even if a machine doesn't work on something for five hours, it's still this machine's item. Unless we manually override it, it stays with that machine."

SO THE DECISION IS REPLACED, not softened. A claim has no timer at all, and only a person's recorded force ends one.

WHAT THAT COSTS IS WRITTEN INTO THE NODE. An abandoned claim stays abandoned until somebody clears it, and a machine that dies still holds its iteration. That is accepted rather than overlooked.

### The fourth decision, and why it is not prose

THE OWNER ALSO RULED WHERE ENFORCEMENT BELONGS. The list of iterations has exactly ONE reader, and that reader batches.

THIS STATE HAD FILED THE BATCHING AS A CONDITION IN PROSE and the ATAM walk had filed the unenforceability as a risk to live with. Both were the wrong answer.

A CALLER CANNOT WRITE THE SLOW VERSION NOW, because a caller cannot reach git for the list at all. The condition stops being an instruction and becomes a property of the only path there is.

### Why three and not more, restated

AN ADR RECORDS A DECISION THAT WAS MADE. The startup question still has none, because the winner scores 1 on the requirement that governs it and nobody has decided how the runtime arrives.

WRITING ONE WOULD DRESS AN UNANSWERED QUESTION AS A SETTLED ONE.
