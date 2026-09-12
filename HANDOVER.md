---
kind: [[handover]]
status: held
urgency: soon
depends_on: [the-ticket-has-a-schema]
---

# Where it stands

This branch stands green on `./RUNME.sh check`, with 809 tests passing and 12
placeholders at warning. It carries trunk as of the merge of
`work/a-red-push-meets-git`.

A group is a ticket now. `spec/schemas/group.schema.yaml` goes, no file names a
group kind, and `src/scripts/group.js` reads a group off
`spec/tickets/<name>.md`. The verbs in `src/scripts/work.js` take it, list it,
close it, merge it, and adopt a brief into it.
`spec/design_output/work.md` says the whole of it.

| the row the brief names | where it lands |
|---|---|
| the group ticket | `spec/tickets/a-group-is-a-branch.md`, with one child beside it |
| the group schema goes | `spec/schemas`, `.vale.ini`, `test/contract/ticket.test.js` |
| `take` over a group | `claimGroup` in `work.js`, and two cases in `work.test.js` |
| held derives | `groupStanding` in `work.js`, off `heldIn` in `group.js` |
| `work list` | `list`, `rowOf` and `looseRows` in `work.js` |
| the stale rule | `rowOf` and `letGo` in `work.js`, under `work.staleAfter` |
| `work merge` runs the check | `checkSays` in `work.js`, which resets trunk on red |
| the moved trunk copy | `movedOnTrunk` in `work.js`, which names the lines |
| the merge frees the tickets | `freeChildren` in `work.js` |
| a box leaves | `leaves` in `work.js`, which writes `gave` and shuts the group |
| `work close` | unchanged, and a case holds it over a group branch |
| `work adopt <brief>` | `adopt` and `minted` in `work.js` |
| the config | `work.staleAfter` in `spec/config/level0.json`, default `12h` |

Two rulings this branch makes, which the design leaves to whoever writes it:

| the ruling | why |
|---|---|
| a brief wins while `HANDOVER.md` stands, in `list` and in `done` alike | `work adopt` dropping that file is the one switch, so the brief queue drains first |
| the hand reads `box <id>` off `.se/copy.json` | a ticket travels, and the private rule refuses a person's name in a tracked file |

The hand id proper belongs to `a-step-changes-hands`, which names the session
and the agent beside the box.

# What waits

| the piece | where | proves it |
|---|---|---|
| the pull hands out a child | `the-agent-pulls-a-ticket` | a ticket at an agent step comes back from the pull |
| `list` names the tickets inside a held group | `spec/tickets/the-verbs-read-a-group.md` | a row per ticket of the group, under the group's row |
| `process_hash` at the mint | `a-process-is-a-route` | `adopt` writes the route and no hash, so a reroute reads nothing |
| the group's `split` leaf runs | `the-agent-pulls-a-ticket` | `adopt` mints one child, and `split` mints the rest |
| the brief's contract retires | `the-box-runs-the-route` | `withContract` still writes the seven steps |

`work adopt` runs on no branch in this tree yet, because every brief branch
standing is somebody's work in flight. Run it on the first branch a person
wants moved, and read `spec/design_output/work#a-brief-becomes-a-group` first.

# What surprises me

**Trunk moves twice under this branch, and the second move costs a conflict.**

| the moment | what it says |
|---|---|
| the first `./RUNME.sh check` | the tree stands red, and the red belongs to trunk |
| `work sync` at the end | `a-process-is-a-route` and `a-red-push-meets-git` both land |
| the conflict | two schema files, and both carry a fix this branch already makes |

The resolution is cheap, because the two fixes agree. An hour of work on top of
them turns it expensive. The contract's step 1 earns its shouting.

**The red trunk costs two boxes the same work.** `spec/processes/chapter.yaml`
and `standard.yaml` break the process schema on arrival: the schema names no
`name`, `for` or `ask`, and the files carry all three. The design branch and the
schema branch each land a half of it.

- this branch fixes it minimally, because `work done` reads the battery first
- `a-process-is-a-route` then lands the proper fix, and the merge takes mine out
- `work take` says nothing about a red trunk, so the next box pays the same toll

**The write door is the best part of this tree and the slowest to learn.** Four
attempts buy one commit message, and three buy one chapter of
`spec/design_output/work.md`. Every refusal is right, and the refusal names the
line and the rule, so a second try lands.

| the rule a draft breaks | how it reads |
|---|---|
| Shape | a run of more than three paragraphs with no list or table between them |
| Markup | a heading past five words |
| Modal | `may` and `would`, where the register holds can, must and will |
| PastTense | the participle the tagger finds in `closed`, `shuts` and `moved` |
| Private | an address in a commit message, which the harness asks for |

**Two dead ends, each one a door holding a rule this branch meets late:**

| the dead end | what stands in the way | the way out |
|---|---|---|
| the attribution trailers | the private rule refuses the address the harness asks for | the tree's rule wins, so these commits carry no trailer |
| re-minting a ticket | `mint_note` refuses a path that stands, and the ticket door refuses a hand's Ask on an open ticket | delete the file and mint it again, because `state: draft` is the one window |

**The fake process door stays quiet where it can speak.** `fakeGit` seeds the
key `git`, so the fake answers an empty success for any git command nobody
teaches it. A new git call in `work.js` then reads as a success in every old
case. `tipAge` and `ticketsOn` both go in that way, unseen. A fake that refuses
an untaught `git ls-tree` says so at once.

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
