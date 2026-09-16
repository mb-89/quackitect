---
kind: [[ticket]]
state: draft
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

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
