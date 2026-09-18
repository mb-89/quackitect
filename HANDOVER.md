---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

A step returning twice mints a question for a human. Two agent hands disagreeing
is what the count reads, and a human is what it writes.

`withPersonStep` in `src/scripts/pull-hand.js` stamps `by: person` on a count
alone. Two callers reach it:

| caller | what it counts |
|---|---|
| `src/scripts/pull-writes.js` | a step failing back, at `work.failsBeforePerson` |
| `src/scripts/pull.js` | a hand-back meeting refused, at `work.refusalsBeforePerson` |

Neither count says who settles the question. So a group loses a child to a
person over a call the box owns.

The cloud guidance carries the second half of the fault. Its rules state what to
do and leave out what goes wrong, so a box under pressure reads past them.

# What waits

| what | who does it |
|---|---|
| a count inserts a step an agent takes, and a person step comes from a hand alone | the next hand |
| the cloud rules carry their own reason, in the shape the older versions use | the next hand |
| the design note and the rationale follow the change | the next hand |

# The settle step

A count inserts a `settle-N` step reading `by: anyone`. It asks the hand to
decide between the step and the findings, and to write why.

The person step stays for two cases:

- a hand hands a question out, with `--became`
- a ticket passing `work.stepsBeforeSplit` asks for a split

# The shape a rule takes

An older version writes a rule with its own failure beside it:

- Refactor or change behavior, one to a commit, because a green suite says nothing about which breaks.
- Leave the shape better than the speed, because a fast function nobody reads is a defect.

The instruction and the failure ride together. A reader holding half the rule
still holds what it guards, so they apply it where it bites.

Several v5 chapters keep that shape. The cloud chapter mostly drops it, and a
cloud box reads that chapter every session.

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
6. Stop for no person. Where a step wants one, mint a ticket outside the
   group, write what stands open into its ask, and run `./RUNME.sh branch
   unblock <ticket> <successor>`. Then finish the rest and run `branch done`.
7. Run `./RUNME.sh branch merge <name>` from main to take it in, then
   `branch close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
