---
status: done
kind: [[handover]]
urgency: now
---

# Ask

A cloud box stops where a step wants a person, and the branch stops with it.
The owner wants the opposite. The box hands the person's work out of its
branch, finishes every step an agent takes, and marks the branch done. The
ticket it leaves behind carries what stands open, so nothing drops.

# Where it stands

The work stands complete on this branch, and the suite passes 1012 of 1014.
`./RUNME.sh lint` over the changed files answers clean.

| the piece | where it lands |
|---|---|
| `branch unblock <ticket> <successor>` | `src/scripts/unblock.js` |
| `takeable` reads `depends_on` | `src/scripts/pull.js` |
| the verb, inside the branch verbs | `src/scripts/work.js` |
| the rule that replaces stopping | `spec/guidance/cloud.md` |
| the argument behind it | `spec/rationales/cloud.md` |
| what the verb reads and writes | `spec/design_output/work.md` |
| the same rule on every brief | `withContract` in `src/scripts/work.js` |

## What the verb does

`branch unblock` takes a ticket standing at a step whose `by` reads `person`.
It closes that ticket `reason: became`, names its successor, and writes the
question the step asks into the successor's `Discussion`. The successor stands
outside the group, so `branch done` meets no open child and the group closes.

It refuses three things: a ticket a hand can still take, a successor inside the
group it frees, and a successor nobody holds yet.

## The two verbs now agree

`takeable` reads no `depends_on`, and the pull's `offer` reads it. So the pull
answers `wait` on a child while `branch done` names that same child takeable.
A group in that state takes no pull and closes on nothing. Both now read the
same field.

# What waits

| what | who |
|---|---|
| a review of this branch, then the merge into main | a person off this box |
| the first group to run the new road | the next cloud box |

# What surprises me

- The `became` road already carries most of this. The schema holds
  `successors`, and the group's child count passes a `became` child over. The
  gap is that a hand-back needs a hold, and no agent holds a person step.
- The local `main` in this box reads 703 commits behind origin, with no merge
  base at all. The clone is shallow, and `git fetch --unshallow` clears it.
  A dead end: `git merge` reports unrelated histories first, which reads like
  a diverged branch.
- A comment sitting past the first line of code carries its `[[link]]` on
  every line, and the last line alone leaves the one above it bare.
- `branch new` writes the contract at the cut, so a branch already standing
  carries the old wording. This brief carries the new one by hand.

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
6. Stop for no person. Where a step wants one, mint a ticket outside the
   group, write what stands open into its ask, and run `./RUNME.sh branch
   unblock <ticket> <successor>`. Then finish the rest and run `branch done`.
7. Run `./RUNME.sh branch merge <name>` from main to take it in, then
   `branch close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
