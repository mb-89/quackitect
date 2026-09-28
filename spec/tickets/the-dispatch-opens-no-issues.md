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
group: boxes-keep-their-own-tickets
step: do
---

# Ask

A ticket waiting on a person stays a ticket in the tree, and the dispatch hands it to a box like any open work. The owner answers inside the ticket system, per the owner's ruling: "We have a ticket system for that."

Without it the dispatch opens a GitHub issue a question, the answer lands outside the tree, and no box picks the ticket up.

- `./RUNME.sh test test/level0/dispatch-fire.test.js` passes, with a case holding that the fire sends no request to the issues API
- `./RUNME.sh test test/level0/dispatch.test.js` passes, with a case bundling a loose ticket at a question step into a fix group, and a case leaving a person-only ticket loose
- `.github/workflows/dispatch.yml` grants no `issues: write`
- `./RUNME.sh check` passes

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
