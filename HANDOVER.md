---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The review verb says two things the tree stopped meaning.

It closes every report with `the merge is a person's`. The owner rules that an
agent merges, and `work/an-agent-merges` carried that through the tree already.
The review verb sits outside that sweep.

It also reads a retro by looking for the word `retro` in a heading. The brief
contract asks for something else: say what surprises you and every dead end you
walk into. So a handback obeying the contract reports its retro absent. The
voice verbs branch hit this: it carries a full retro under `What surprises me`
and a dead end chapter, and the verb called it missing.

# What waits

| the piece | where | proves it |
|---|---|---|
| the report names the merge verb | `lib/review.js` | the two closing lines say it |
| `retroIn` reads the chapter the contract asks for | `lib/review.js` | a handback under `What surprises me` reads as carrying one |
| the contract names the heading | `src/scripts/work.js` | a new brief says where the retro goes |
| the two agree | both | a fixture handback passes the verb |

# Why the two disagree

The contract and the detector each name a retro their own way, and nothing
holds them to one wording. Name the heading in the contract, and read that
heading in `retroIn`. One wording then reaches both.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Run `./RUNME.sh work merge <name>` from main to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
