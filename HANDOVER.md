---
kind: [[handover]]
status: todo
urgency: whenever
depends_on: [the-agent-pulls-a-ticket]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

Level zero holds every door it holds today, and this branch wires the pull
into them. Its chapter is What level zero changes.

| what stands today | where |
|---|---|
| the brief door, which hands over `HANDOVER.md` and deletes it | `.claude/skills/level0/hooks/level0.js` |
| the answer door, which reads the session's messages and admits one tool | `.claude/skills/level0/lib/answer.js` |
| `work-waiting`, which counts tasks | `spec/config/stop/level0.yml` |
| the viewer's colours | `src/extension/webview/` |
| `engine.binding` and `engine.autonomy` | `spec/config/level0.schema.json` |

# What waits

| the piece | where | proves it |
|---|---|---|
| the brief door goes | the hooks | the block on a cloud box says to run the pull, once `work list` names no brief |
| `work-waiting` | the stop rule | it reads the session's hold file and counts private tickets |
| the answer door | `lib/answer.js` | it reads the `note` row off the log, where the prompt names a note |
| the viewer | the webview | `note` draws pink, under the prompt it answers |
| `unbound` | the binding | it hands out nothing, and `pull <ticket>` takes a named one |
| `engine.autonomy` | the pull | `finish` mints notes alone, `start` mints into its own group, `ideation` mints loose tickets |
| the old verbs | `work.js` | `take`, `done` and `collect` over a brief go once the last brief merges |

# The rules to hold

- A note answers no other prompt, so the readback stays owed everywhere else.
- The trunk guard stays as it is.
- A loose ticket from a cloud box rides the group's branch and lands at the merge.

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
