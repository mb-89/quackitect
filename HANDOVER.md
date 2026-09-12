---
kind: [[handover]]
status: todo
urgency: soon
depends_on: [the-ticket-has-a-schema]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

This branch turns the brief on a branch into a group of tickets on a branch.
A group is a ticket under the `group` process, and its children are the
tickets naming it under `group`. The schema branch lands a group schema of its
own, because its brief predates that ruling. This branch removes it, and the
design is the newer of the two. Its chapters are A group is a branch, and
What a person sees.

| what stands today | where |
|---|---|
| the work verbs over a brief | `src/scripts/work.js`: `new`, `take`, `sync`, `done`, `release`, `merge`, `close`, `list`, `collect` |
| the claim, which is a push of `status: held` | `work take` |
| the merge, which merges and prints "run check" | `work merge`, and it runs no check |
| the rules the verbs follow | `spec/design_output/work.md` |
| five brief branches at `todo` | `work list` |

# What waits

| the piece | where | proves it |
|---|---|---|
| the group ticket | `spec/tickets/<name>.md` | it passes the ticket schema, and carries the `group` route from `spec/processes/group.yaml` |
| the group schema goes | `spec/schemas/group.schema.yaml`, and what reads it in `lib/` and `.vale.ini` | no file names a group kind, and `check` stays green |
| `work take` over a group | `work.js` | it writes the hand and `took` into the group's record and pushes, and a second take fails on the push |
| held derives | `work list` | a group holds where its newest record entry carries `took` and no `gave` |
| `work list` | `work.js` | one row per group and per loose ticket, the age of each held tip, and a brief told apart by `HANDOVER.md` at its tip |
| the stale rule | `work list` | a held group older than `work.staleAfter` stands under yours with release, take and close |
| `work merge` | `work.js` | it runs the check on the merge commit and undoes it on red |
| the moved trunk copy | `work merge` | it refuses where trunk's copy of a ticket or the group note differs from the branch point, and names the lines |
| the merge frees the tickets | `work merge` | an open child of a merged group loses its `group` |
| a box leaves | `work.js` | the last leaf writes `gave`, closes the group as `done` where every child stands closed, and leaves it open otherwise |
| `work close` | `work.js` | it drops the branch after the merge |
| `work adopt <brief>` | `work.js` | a brief branch becomes a group ticket and one child |
| the config | `spec/config/level0.json` | `work.staleAfter` reads, default `12h` |

# The rules to hold

- The branch is the claim, and the branch is the filter.
- Trunk hands out no group's ticket. A person on trunk sees the loose ones.
- A group of one ticket is the ordinary case.
- There is no lease. A stale group is implicitly a person's, and the rule derives from the tip.
- `tickets` is a standing condition: the pull hands out a child whenever one stands at an agent step.
- `take` keeps serving a brief until `work list` names none.

# The tests

`work.js` runs under the fake doors, so every verb takes a test beside the
ones standing in `test/`. Add one per row above, and one for the rejected
push. Run `./RUNME.sh check` before every push.

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
