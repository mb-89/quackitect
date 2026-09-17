---
kind: [[ticket]]
state: open
urgency: now
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

A person reads what the mouse does to a window drawn in the terminal they work
in. The window design asks for a click on a tab, a click on a header to sort,
and a drag on a column edge. Only a person at that terminal answers whether
those land.

Without it the design output guesses. A box in the cloud runs no terminal. So
the mouse stays untested until a person tries it, and the keys carry every move
meanwhile.

- a person runs `./RUNME.sh log` in the editor's terminal, clicks a row, and says whether the click lands
- the same person clicks the header line and says whether the click lands
- the same person holds a drag across a column edge and says whether the motion arrives
- the answer stands in this ticket's Discussion, one line a case

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
