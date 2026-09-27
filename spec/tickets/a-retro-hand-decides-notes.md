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
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
step: do
---

# Ask

A hand holding a group at `retro/notes` decides each private note on the box, and the step passes. [[spec/design_output/pull#the-private-queue]] sends a note to that hand.

Today the hold refuses the note. A pull naming it answers that one hand holds one ticket. A pull under `--as` answers that the todo in hand blocks it, whatever the plan names. So `retro notes` exits 1, and the group stands at `retro/notes` with no road to `branch done`.

- a hand holding a group at `retro/notes` pulls a private note and hands it back `became`. A case under `test/level0` decides it
- `./RUNME.sh retro notes` then exits 0, and the group passes `retro/notes`. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

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

The fix stands in commit `e1fe50650` on `work/the-engine-holds-the-route`, with `test/level0/retro-notes-pull.test.js`. The next hand runs the tests and the check, and hands the evidence back.
