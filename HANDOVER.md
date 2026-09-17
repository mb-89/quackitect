---
status: held
kind: [[handover]]
urgency: now
---

# Ask

A cloud box stops when a step wants a person, and the branch stops with it. The
owner wants the opposite: the box hands the person's work out of the branch,
finishes every step an agent can take, and marks the branch done. The ticket it
mints carries what stands open, so the chain behind the person keeps moving.

# Where it stands

The branch carries the brief alone, and the work starts here.

# What waits

| the piece | where | proves it |
|---|---|---|
| the successor, minted outside the group | the engine | a group whose last step wants a person still closes |
| `depends_on` read by `takeable` | the engine | the pull and `branch done` name one takeable step |
| the rule that replaces stopping | the cloud guidance | a box reads hand it out |
| the same rule on every brief | the brief contract | a branch cut today carries it |

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh branch sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Head the retro `What surprises me`, and name every dead end
   you walk into.
4. Run `./RUNME.sh branch sync` again, so main comes in last too.
   Run `./RUNME.sh check` after it, and answer whatever the merge turns red.
5. Run `./RUNME.sh branch done`, which sets the status and pushes.
6. Run `./RUNME.sh branch release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
7. Run `./RUNME.sh branch merge <name>` from main to take it in, then
   `branch close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
