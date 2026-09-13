---
kind: [[handover]]
status: held
urgency: soon
---

# Where it stands

A hand that parks work for later has nowhere to put it. The design note
carries the answer in the chapter The to-do flag, in
`spec/design_input/the-agent-pulls-tickets.md`. Read that chapter first,
because it rules every line below.

| what stands today | where |
|---|---|
| private tickets, off git | `src/scripts/ticket.js`, the note verb, writing under `.se/tickets` |
| the ticket schema, which refuses a stray key | `spec/schemas/ticket.schema.yaml` |
| the push door for a red battery | the Bash door in `.claude/skills/level0/hooks/level0.js`, and `src/scripts/prepush.js` |
| the uncommitted check | `src/scripts/work.js`, the dirty function and the verbs calling it |
| the hard reset a take runs | the same file, inside the take |

# What waits

A note carries a boolean, and a push refuses to carry it away.

| the piece | where | proves it |
|---|---|---|
| the field | `spec/schemas/ticket.schema.yaml` | a ticket carries `todo: true`, and a ticket lacking it reads false |
| the mint flag | `src/scripts/ticket.js` | the note verb takes a flag and writes the field |
| the tag verb | the same file | a verb sets the field on a ticket standing already, and takes it off |
| the push door | `src/scripts/prepush.js`, and the Bash door | a push whose delta carries a tagged note comes back refused, naming the file |
| the commit | nothing | a commit carrying a tagged note passes, because the push is the one gate |
| the pull order | wherever the pull lands | a tagged note stands ahead of every free ticket |
| the uncommitted check | `src/scripts/work.js` | it looks past a tagged ticket, and answers on every other change |
| the take | the same file | it saves every tagged file before its reset, and writes each one back |
| the tests | `test/level0/` | the field, the door, the order, the check and the take each answer |

Two rules ride along. A ticket on a branch takes no tag, because the branch
speaks for that one already. A close takes the tag off.

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
