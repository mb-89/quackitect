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

This branch is the beat and the sidebar's `work` group. The editor itself
waits for a note of its own and for desk work with the owner. So this branch
lands a button and no board. Its chapters are What a person sees, and The
pull, under the two levels.

| what stands today | where |
|---|---|
| the sidebar and its declared widgets | `spec/config/level0.schema.json`, and `src/extension/sidebar.js` |
| the widgets: toggle, status, count, table, action | `.claude/skills/level0/lib/controls.js` |
| the routine, which runs `work take` on its clock | `spec/design_output/work.md`, and the `do_work` routine |
| the cloud guidance | `spec/guidance/cloud.md` |

# What waits

| the piece | where | proves it |
|---|---|---|
| the `work` group | `level0.schema.json` | four controls in order: the engine's switch, the editor button, `note`, `mint` |
| the count on the editor button | the `count` widget | it shows the tickets and the stale groups waiting on the person |
| `work beat` | `work.js` | on trunk it takes a free group, works it, and takes the next until none stands |
| the notification | `work beat` | it names each question with its age, and each stale group |
| the routine's line | `spec/guidance/cloud.md` | the first verb is the pull |
| the board's reading | `work list` and the count | a ticket in a held group shows its group's state and the tip's age, and no state of its own |
| the switch on a desk | `engine.state` | it runs the beat, and `engine.beat` reads the newest group note off the branches |

# The rules to hold

- The Kanban board goes in no sidebar. The sidebar holds a button, and the button carries a count.
- The routine fires one box. A second routine is a second box, and a person creates it.
- The board draws what the machine holds, and fetches on the schedule the tree already has.
- The controls take the editor's theme, and this branch spends nothing on graphical design.

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
