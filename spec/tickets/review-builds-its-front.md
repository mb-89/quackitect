---
kind: [[ticket]]
state: draft
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
group: read-topics-land-in-shadow
parent: read-topics-land-in-shadow
---

# Ask

gain: a branch review runs the check with the branch's own front writer, so the mint test meets a binary and the review answers what the branch holds.

breaks: every branch review answers red on the mint contract test, because the worktree carries no `se-front` and only the install builds one.

done_when:

- `./RUNME.sh test test/level0/review.test.js` answers green, with a case asserting the build lands in the worktree's bin before the check
- `./RUNME.sh branch review read-topics-land-in-shadow` names no failing test

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
