---
status: held
kind: [[brief]]
urgency: now
---

# Ask

A cloud box stops when a step wants a person, and the whole branch stops with
it. The owner wants the opposite: the box hands the person's work out of the
branch, finishes everything an agent can take, and marks the branch done.

The ticket the box mints is the reminder that work stands open. So nothing is
dropped, and the chain behind the person keeps moving.

Done is four things:

- a verb takes every open child standing at a person step, mints its successor
  outside the group, and closes the child as `became`
- `takeable` reads `depends_on`, so `branch done` and the pull agree on what a
  hand can take
- the cloud guidance says hand the person's work out, in place of stopping
- the contract every brief carries says the same

| the piece | where | proves it |
|---|---|---|
| the successor, minted outside the group | the engine | a group whose last step wants a person still closes |
| `depends_on` in `takeable` | the engine | the pull and `branch done` name the same takeable step |
| the rule | the cloud guidance and the brief contract | a box reads hand it out, not stop |

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
