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

# The status says where the work stands

The handover carries frontmatter, and its `status` is the one field that moves:

| status | means | who sets it |
|---|---|---|
| `todo` | waiting for somebody | `work new` |
| `held` | a session has it | `work take`, by pushing |
| `done` | the result is on the branch | `work done` |

A claim is a push. Two sessions reaching for one branch means one of them meets
a rejected push and takes the next.

# The round trip

1. Write the brief to `HANDOVER.md` on `main`.
2. `./RUNME.sh work new <name>` cuts the branch, stamps `status: todo`, commits
   and pushes. `main` loses the file in the same act.
3. A cloud session works the branch and pushes to it. The merge belongs to a
   person, because a cloud box opens no pull request.
4. That session writes its result and its retro into `HANDOVER.md`, then runs
   `./RUNME.sh work done`, which stamps `status: done` and pushes.
5. `./RUNME.sh work collect` names every branch standing at `done`.

# Every brief carries the contract

`work new` appends `## How this branch ends` to a brief that carries none, so
every branch says how it closes. The append is idempotent, and a brief already
carrying the section stays as it stands.

The contract names six things:

- run `work sync` first, which takes `main` in
- push each time a thing lands
- write the result and the retro back into `HANDOVER.md`
- run `work done`
- run `work release` on stopping early
- leave the merge to a person

A brief depends on nothing outside itself, so a cloud session aiming at one
branch reads it and knows how to finish.

# Trunk comes in before the work starts

`work sync` merges `origin/main` into the branch. `work take` runs it, so a
routine pays nothing to remember it. A conflict then stops the take, while the
work it would cost still sits ahead.

# A cloud box landing on trunk

A cloud session starting on `main` gets no brief, because trunk carries none.
Level zero notices that and hands over a block naming `./RUNME.sh work take`.

So a box needs no prompt about work at all. Starting it on trunk is enough, and
saying "take work" only agrees with what it already reads.

Three things hold together for that block to appear:

- a cloud variable carries a value
- the branch is `main`
- no handover reaches the session

A desk session sees none of it.

# A cloud box writes to its own branch

A box starts on trunk and leaves it in its first command. The window for a
commit landing wrongly is the minute before that.

Level zero refuses, on a cloud box:

- a `git commit` made while standing on `main`
- a `git push` naming `main`, from any branch

The refusal names `./RUNME.sh work take` as the way out. A desk box meets none
of it, because a person on a desk merges by choice.

`work take` and `work done` reach git inside the command line, so the door sees
the verb and leaves the plumbing alone.

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
