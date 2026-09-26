---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-finishes-its-asks/design/review
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: each-thing-stands-in-place
parent: the-retro-finishes-its-asks
record:
  - step: do
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 1814337e02fb8e8ad536adbe0f1c2b094e27cfd4
    hash_after: beea5c434c80dfdcd967f25dcb93198e587dbb71
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`listFaults` in `classes.js` reads a promotion's `what`, `from` and `to` alone, so the `ticket` fields the check step adds stand checked in `mintFaults` alone; `classify.md` and `check.md` name the one step writing them

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/retro-mint.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A promotion's ticket fields now have one writer and one checker.

- `classify.md` rule five leaves a promotion's ticket to the check step
- `check.md` rule five asks the check step for each promotion's ticket
- `verifying.md` explains the new rule, and its standing-rule chapter moves to six
- a case in `retro-mint.test.js` shows `faultsOf` passes the ticket, and `mintFaults` refuses it

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change follows the ask, or the discussion says why it departs: the guidance names the check step alone
- [x] the cleanup the change reveals is in the change, or is a note of its own: the rationale gains its chapter
- [x] every fact the change adds stands in one place, and a note points at the file instead of repeating it: `mintFaults` checks

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
