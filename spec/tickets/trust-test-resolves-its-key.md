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

The trust test at `test/level0/trust.test.js` looks up the project key `join("/tree")`, while `main` in `src/scripts/trust.js` keys the folder `resolve(argv[2])`. On Linux both read `/tree`. On Windows `resolve` adds the drive and `join` adds none, so the key the test reads stands empty. [[one-reader-names-the-home]]

The gain is a check that goes green on a Windows desk, so the push from that desk lands.

Without it the check stays red on a Windows desk, and the pre-push hook refuses every push from there.

- `node --test test/level0/trust.test.js` is green on a Windows desk
- `./RUNME.sh check` exits 0 on the head commit

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
