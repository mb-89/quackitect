---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: node-leaves-the-boxes/accept
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: node-leaves-the-boxes
parent: node-leaves-the-boxes
record:
  - step: do
    hand: box 3f5d7b2a1399 · claude-code-remote
    hash_before: 1117284d87e8431755970032be4e7d0607bd780e
    hash_after: 0a51768e28d26d4f60731b034095838114a2dff6
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   88.0  in all"
    inputs:
      - name: ask
        hash: 3ceee18367d832f5
        size: 145
    def: 22963c491c71f419
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a code --list-extensions exiting non-zero reads as here in setup.js. A spawn failure alone reads as here, and an exit past zero reads as missing.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/setup.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The setup reads a code list that exits past zero as an empty list. So the extensions read as missing, and the setup installs them, as the old installer did. A box with no code on the PATH still skips them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point the accept gate names
- the change reveals no cleanup past itself
- the case names the claim once, beside the line it holds

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
