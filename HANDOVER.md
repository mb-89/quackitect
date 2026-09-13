---
kind: [[handover]]
status: held
urgency: now
---

# Where it stands

A turn ends where the agent asks for it. Today the ask is one line, last in
the answer: `Stop requested. Reason [<id>]. <what the owner does next>`. A
fresh line meets a challenge, the turn holds open, and the agent writes the
same line a second time. So the owner reads two endings for every stop, and
asks for one.

| what stands today | where |
|---|---|
| the line, its reader, the challenge | `.claude/skills/level0/lib/stop.js` |
| the bite, the vote, the hold | `.claude/skills/level0/hooks/level0.js`, under the vote comment |
| the rules and their ids | `spec/config/stop/level0.yml` |
| the note | `spec/design_output/stop.md` |
| an allow list naming a tool long gone | `.claude/settings.json`, `mcp__level0__claim_stop` |

# What waits

The stop becomes one tool call, `stop`, and the line goes.

| the piece | where | proves it |
|---|---|---|
| the tool | `lib/stop.js`, `stopSpec` | it takes `reason`, one id out of the rules, and `next`, what the owner does next |
| a sound reason | `hooks/level0.js` | the result says the turn ends, and the agent writes nothing more |
| a reason a fact contradicts | the same | the result names the fact in one line, and the turn goes on |
| the turn's end | `bite` | a standing claim reaches the vote, with no challenge and no second answer |
| a turn with no call | `askForStop` | one line and the ids, five lines in all |
| the re-prompt | `reprompt` | the winning continue rule and the ids, five lines in all |
| the note | `spec/design_output/stop.md` | one call chapter replaces the line, the challenge and the voice chapters |
| the tests | `test/level0/stop.test.js`, `hooks.test.js` | one call ends a turn, and a second answer stands nowhere |
| the allow list | `.claude/settings.json` | it names `mcp__level0__stop` |

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
4. Run `./RUNME.sh work sync` again, so main comes in last too.
   Run `./RUNME.sh check` after it, and answer whatever the merge turns red.
5. Run `./RUNME.sh work done`, which sets the status and pushes.
6. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
7. Run `./RUNME.sh work merge <name>` from main to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
