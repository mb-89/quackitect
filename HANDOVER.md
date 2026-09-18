---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

A cloud box ends its turn on a question an agent answers. The stop rule asks
whether a person can answer, and a person can answer anything. So the test lets
every hard call out of the box.

The owner rules that wrong. The test is what a wrong answer costs, and who
undoes it. A wrong answer a later commit moves belongs to the box.

Three places carry the fault:

| where | what it does today |
|---|---|
| `spec/config/stop/level0.yml` | `a-person-holds-the-answer` asks whether a person can answer |
| `spec/config/stop/level0.yml` | a claimed stop outranks the one mechanical rule saying carry on |
| `src/scripts/pull.js` | the fail count stamps a step `by: person`, whatever the question is |
| `spec/guidance` | the standing says a step a person owns waits, so a stamp reads as an owner |

# What waits

| what | who does it |
|---|---|
| put the blast radius test in the stop rule, in place of the person test | the next hand |
| add a mechanical rule holding a cloud box open while an agent-takeable leaf stands | the next hand |
| stop the fail count stamping `by: person`, and hand the return to another agent hand | the next hand |
| write the blast radius test into the standing, so a box reads it every session | the next hand |

# The test the owner asks

A box answers a question whose wrong answer a commit undoes. It hands out a
question whose wrong answer reaches past the branch.

The wrong answer leaves the box where it does one of these:

- it spends, sends or opens a door: money, a message to somebody outside, a secret
- it loses work nobody rebuilds: a dropped commit, a deleted row, a release
- it stands outside the brief: a product call the brief leaves open

Everything else the box answers. It names the assumption under the ticket's
discussion and carries on. Where two answers both stand, it takes the one a
later hand undoes cheaper.

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
