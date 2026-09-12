---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The tree tells every agent that a person merges. The owner rules otherwise: an
agent merges, and a cloud box alone stops short, because the harness opens no
pull request there.

The design says this correctly already.
`spec/design_output/work#a-box-writes-its-branch` scopes the trunk guard to a
cloud box and says a desk box meets none of it. The code missed the scope, so
the guard refused every box. The guidance around it then spread the wrong rule
into every brief the tree writes.

# What waits

| the piece | where | proves it |
|---|---|---|
| the trunk guard reads the cloud flag | `hooks/level0.js` | a desk box commits on trunk, and a cloud box meets the refusal |
| the refusal names the harness, and no person | `hooks/level0.js` | the deny text says what holds trunk shut |
| the brief contract names `work merge` | `src/scripts/work.js` | a new brief carries the verb |
| `work done` names the next verb | `src/scripts/work.js` | the verb prints it |
| the round trip drops the person | `spec/design_output/work.md` | `./RUNME.sh check` answers 0 |
| the review rule ends at a merge | `spec/guidance/review/reviewing.md` | the same |

# What stays

The copilot road keeps its rule. `lib/copilot-dispatch.js` and
`lib/copilot-runtime.js` speak to a box that truly may never merge, and
`spec/rationales/cloud.md` records why. Change none of the three.

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
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
