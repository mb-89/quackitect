---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process_hash: 2b5ab398855a1aba
step: do
---

# Ask

A stale hold moves to the box that takes it, so a dead box locks its branch for one span at most.

Without it, a plain push onto a stale hold refreshes the tip and leaves the dead box's hold in place. The hold reads fresh for another span, and every other box stays locked out.

- `./RUNME.sh test test/level0/prepush.test.js` refuses a plain push onto a stale hold, passes a take, and refuses both onto a fresh hold
- `./RUNME.sh test test/level0/work-held.test.js` pushes the claim of a stale take, then takes main in
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/prepush.test.js test/level0/work-held.test.js

## check

    ./RUNME.sh check

## says

The push door in `src/scripts/prepush.js` opens a stale hold to a push that
moves it, and to no other. `heldAtTip` reads the group ticket at the pushed sha.
`movesHold` passes the push where that hold names this box, which a take writes.
It passes one naming nobody too, which a release writes. A plain push keeps the dead box's
hold at the tip, so the door refuses it, and `staleTakes` names
`./RUNME.sh branch take <name>` as the road.

`branch take` already pushes its claim before `sync` takes main in, so the
fixed door rides onto a stale branch behind main. A test in
`test/level0/work-held.test.js` pins that order.

## checked

- the change follows the ask. A release passes too, because it frees the hold, and the ask names the take alone
- the cleanup it reveals: `heldElsewhere` names the take in place of the stale span freeing the branch
- the rule stands in the door alone, and the row in `spec/design_output/work.md` names it once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
