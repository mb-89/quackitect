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
process: [[trivial]]
process_hash: 2b5ab398855a1aba
step: do
---

# Ask

The queue reads a group trunk marks `cloud: true` as the cloud's, beside a standing branch, so the work tab and its count leave the group and its tickets to the cloud. The owner's word: "Just because they are behind a flag that is not set yet does not make them not cloud groups."

Gain: the count behind the work tab's name reads the rows this desk takes. A marked group whose branch holds no commit past trunk reads as merged, and counts on the desk.

Breaks: the desk pull hands out a cloud group's tickets, and the count reads every migration ticket as the desk's.

- a case in `test/level0/work-answer.test.js` holds a marked group on a merged branch, and its open child, at `∞`
- a case in `test/level0/work-answer.test.js` holds a marked group with no branch, and its open child, at `∞`
- a case in `src/tui/workplaces_test.go` holds the cloud letter on a merged group placed at `∞`, and on its ticket
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

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
