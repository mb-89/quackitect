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
group: loose-fixes-99f4547
step: do
---

# Ask

A draft a box mints with no group lands loose on main through the group's pull request, as [[spec/design_output/work#a-box-leaves]] rules. `branch done` then counts only the open tickets the branch adds, and a fix group reaches done.

Today `leftOpen` in `src/scripts/work-fix.js` counts an added draft as well. A fix group that mints a draft for a person stands short of done, and no box closes it.

- a case in `test/level0/work-fix.test.js` adds a draft with no group, and `leftOpen` leaves it out
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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
