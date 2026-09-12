---
kind: [[handover]]
status: todo
urgency: whenever
depends_on: [the-agent-pulls-a-ticket, level-zero-hands-over, the-retro-is-a-ticket]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for. Its chapters A group is a branch and The retro say what this
branch proves. A cloud run is a group, and the route in
`spec/processes/group.yaml` is what the box does, step by step.

Today a cloud run follows six lines `work new` appends to every brief, and the
routine `do_work` runs `work take` on its clock. After this branch the routine
fires a box that pulls. The pull hands it a group, and the route carries the
run from `sync` to the retro's last leaf.

| what stands today | where |
|---|---|
| the six lines of the contract | `work new`, in `src/scripts/work.js` |
| the cloud guidance, whose first verb is `work take` | `spec/guidance/cloud.md` |
| the routine, on a clock of four hours | `do_work`, and `work trigger` |
| the pull, the group verbs, the retro verbs | the branches before this one |
| five brief branches at `todo` | `work list` |

# What waits

| the piece | where | proves it |
|---|---|---|
| the cloud guidance | `spec/guidance/cloud.md` | its first verb is the pull, and it names the route and no contract |
| the routine takes a group | `work.js`, and the routine | a fired box pulls on trunk, takes a group, and works the route |
| the contract retires | `work new` | a brief carries no appended contract, since the route holds it |
| `sync` on a cloud box | the pull | `when: cloud` holds on a cloud box, and the leaf runs first |
| the retro phase on a cloud box | the pull | `retro/notes` empties the private folder, `retro/write` fills, and `retro/cloud` runs there alone |
| `adopt` over the standing briefs | `work adopt` | each of the five brief branches becomes a group ticket and one child, or closes |
| the first cloud run under the route | a real routine firing | one group runs from `sync` to its retro on a cloud box, and lands by a person's merge |
| the handover in the retro | the retro leaves | what the brief's handback carries today stands in `write` and `cloud` |

# The rules to hold

- The cloud box commits on no trunk. A ticket with no group rides the branch to the merge.
- A box leaving a group writes `gave`, and the group stays open where a child stands parked.
- The private notes die with the box unless the retro decides them, so the retro phase runs before the cap.
- What the box lacks, meets and leaves stands in the `cloud` leaf, and the tree's retro reads it.
- Drive one real run before `work done`, and write what you see in the retro.

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
