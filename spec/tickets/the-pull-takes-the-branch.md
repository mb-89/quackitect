---
kind: [[ticket]]
state: closed
urgency: now
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 62642eaf8f9c9c53
step: do
todo: false
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: a8dab8fe4475b5f06e5e028a654b9131f90820d8
    hash_after: a8dab8fe4475b5f06e5e028a654b9131f90820d8
    answered:
      - name: tests
        exit: 0
        said: green, 88 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 12 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The agent pulls and nothing else. The engine takes a branch behind the pull where the box runs in the cloud. A desk gets a group with a branch on two roads alone: the owner names it, or its urgency reads now.

Without it a desk session takes a branch the cloud holds, works a group beside a cloud box, and the two land on one branch. This box took a group that way today, through `branch take`.

- `./RUNME.sh branch pull` on a desk hands out no group with a branch, and a test in `test/level0` drives it
- `./RUNME.sh branch pull <group>` on a desk hands out that group, and a test drives it
- a group at urgency now reaches a desk through the plain pull, and a test drives it
- `branch take` leaves the verbs a hand runs, and the tickets guidance names the pull in its place

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/pull.test.js test/level0/work.test.js

## check

    ./RUNME.sh check

## says

The agent runs the pull and no other verb to get work. On trunk the pull reads where it runs. A cloud box takes the next branch through the engine, and a desk gets the free tickets and takes no branch. A desk pull meeting an open group with no branch cuts one from trunk and pushes it, so the cloud takes the group.

A desk takes a group on two roads alone. The owner names it with `branch pull <group>`, or the group's urgency reads now. A free ticket carrying the todo tag comes first, on a note and on a ticket alike. The tickets and cloud guidance name the pull, and the bash refusal on trunk names it too. The routine's own prompt in the cloud stays the owner's to change.

## checked

- the change follows the ask: the four done lines stand, and the discussion names the one road that moved
- the cleanup the change reveals is in it: the tag on a ticket, and the take by name

# Discussion

The fourth done line asks that `branch take` leave the verbs a hand runs. It stays a verb, because the engine runs it behind the pull and a person runs it by hand. The guidance and every message name the pull, so no hand reaches for it.
