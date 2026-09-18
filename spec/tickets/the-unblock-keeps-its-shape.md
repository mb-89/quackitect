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

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A person reads the question in the shape its author gives it.

<!-- breaks, as text: what breaks if it is never done -->

- `asked` in `src/scripts/unblock.js` cuts the `asks` field on the semicolon, and writes one list item a piece.
- A question carrying a table lands as one list item a row, and the pipes read as text.
- A question carrying `TL;DR` lands as two items, because the cut falls inside the word.
- The voice rules then refuse the ticket, because a row runs past the list item ceiling.
- So `./RUNME.sh check` answers 1 on a branch running `branch unblock`, and a hand rewrites the chapter itself.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `branch unblock` writes a question holding a table as that table, and a case in `test/level0/unblock.test.js` covers it
- `branch unblock` keeps `TL;DR` whole, and the same case covers it
- `./RUNME.sh branch test test/level0/unblock.test.js` answers green
- `./RUNME.sh check` exits 0 on the commit

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

- This ticket names no group, so it stands in the pool on trunk.
- [[spec/tickets/a-person-reads-the-split]] carries the chapter the defect breaks, and a hand rewrites it there.
- The verb and its design output stand already. For details, see [[spec/design_output/work#a-person-step-leaves]].
