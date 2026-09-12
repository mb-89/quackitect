---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The tooth fires on every turn that reaches an answer, and it votes nothing.
This session logs four decisions, all reading `stop=none@0 continue=none@0`.
The stop side sits at a floor of zero, so a turn nobody votes on ends. Stopping
is what happens where nothing speaks.

The claim carries the blame. `claim_stop` is a tool call, so it stays inside
the machinery where the owner sits outside it, and an agent skipping it stops
all the same.

The owner rules that a stop rides the answer instead, in one exact line the
owner reads in the chat.

# What waits

| the piece | where | proves it |
|---|---|---|
| `stopLineIn` reads the last line of an answer | `lib/stop.js` | a fixture answer yields its reason and context |
| a turn ending with no line holds open | `hooks/level0.js` | the fake prompt road carries one submit |
| the first line of a turn draws the challenge | `hooks/level0.js` | the turn holds open, and the text names the question |
| the same line after the challenge grants the stop | `hooks/level0.js` | the vote runs with the claim, and the turn ends |
| the challenge costs no round trip | `hooks/level0.js` | the owner sends no prompt between the two |
| an unknown reason id draws the list | `lib/stop.js` | a fixture id nobody holds names every id |
| a subagent spends none of the allowance | `hooks/level0.js` | a spawn leaves the flag standing |
| the canary ends turn one on its own | `hooks/level0.js` | an answer holding the canary needs no stop line |
| the vote decides acceptability | `lib/stop.js` | a claim under a firing continue rule holds the turn open |

# The line

    Stop requested. Reason [<id>]. <what the owner does next>

It stands as the last line of the answer. The ids are the stop side claimed
rules in `spec/config/stop/level0.yml`, and that file stays as it stands.

# What the challenge says

The agent reads it and answers it to itself. Going on needs the owner, or the
stop hands over an update the work carries past. An update is a line in the
next answer, and the work goes on under it.

The challenge fires once for each prompt the owner sends. A second line after
it reaches the vote.

# What stays

`spec/config/stop/level0.yml` keeps every rule, side and priority. The vote
keeps deciding. `stop.mostInARow` keeps capping a runaway. Change none of the
three.

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
   this brief. Head the retro `What surprises me`, and name every dead end
   you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Run `./RUNME.sh work merge <name>` from main to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
