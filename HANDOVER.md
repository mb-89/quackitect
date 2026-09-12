---
kind: [[handover]]
status: done
urgency: now
---

# Where it stands

The rule that a red battery pushes nothing to trunk stands in one door: the
Bash door of the level zero plugin, in
`.claude/skills/level0/hooks/level0.js`. A session that runs the plugin meets
it. A session without the plugin, and a person in a terminal, meet nothing,
and one such push reddens trunk on origin today.

The privacy check already stands at two doors, the Bash door and
`.githooks/pre-commit`, which `install.sh` points git at. The battery's door
wants the same second half.

| what stands today | where |
|---|---|
| the Bash door's push rule | `hooks/level0.js`, under the red battery comment |
| the stamp the check writes | `.se/check.json`, read by `stampOf` and `saysGreen` in `lib/runs.js` |
| the commit hook and its script | `.githooks/pre-commit`, `src/scripts/precommit.js` |
| the install step that points git at the hooks | `install.sh`, `git-hooks`, a want and no need |

# What waits

| the piece | where | proves it |
|---|---|---|
| the push hook | `.githooks/pre-push` | git runs it, and a push naming trunk on a red or stale stamp exits 1 with the door's words |
| its script | `src/scripts/prepush.js` | it reads git's lines off stdin, and only a ref to trunk reads the stamp |
| a push to a work branch | the script | it meets no door, because mid-work carries red |
| the tests | `test/level0/prepush.test.js` | green, red, stale, unclean and absent stamps each answer as `saysGreen` says |
| the install | `install.sh` | it makes the push hook runnable beside the commit hook, and `doctor` names both |
| the note | `spec/design_output/work.md` | the battery chapter says a terminal meets the same door |

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
