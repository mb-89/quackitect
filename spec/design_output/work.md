---
kind: [[design_output]]
describes: [[src/scripts/work.js]]
---

# What a work branch is

One piece of work, held by one branch named `work/<name>`, carrying its own
brief. The branch is the unit, and a session works it whole.

# Two handovers

| file | tracked | who reads it | where it may stand |
|---|---|---|---|
| `.se/HANDOVER.md` | no | the next session on this box | anywhere |
| `HANDOVER.md` | yes | whoever works the branch | a work branch alone |

Level zero reads both at `session.start`, hands each to the agent as a context
block, and deletes both. So each one stays fresh, and nobody keeps a rule about
clearing it.

# The round trip

1. Write the brief to `HANDOVER.md` on `main`.
2. `./RUNME.sh work new <name>` cuts the branch, commits the brief and pushes it.
   `main` loses the file in the same act.
3. A cloud session works the branch and pushes to it. The merge belongs to a
   person, because a cloud box opens no pull request.
4. That session writes its result back to `HANDOVER.md`, commits and pushes.
5. `./RUNME.sh work read <name>` prints the result.

# Why a routine needs this

A routine starts on `main` and takes no branch argument, so a pointed cloud
agent gets its brief and a routine gets none.

Level zero reads its context at `session.start`, before any checkout. A hook
sees nothing of a branch the session switches to afterwards.

So `./RUNME.sh work take` prints the brief to standard output. The agent reads
it from the command, and one routine prompt then serves every branch:

    ./RUNME.sh work take

That verb fetches, picks a branch carrying a brief, checks it out, claims it by
pushing, and prints what to do. A session losing the race meets a rejected
push and takes the next one.
