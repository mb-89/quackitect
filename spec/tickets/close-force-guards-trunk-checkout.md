---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: groups-carry-the-cloud-marker/design/review
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
group: open-tasks-land-in-shadow
parent: groups-carry-the-cloud-marker
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`close` reads neither `HEAD` nor a dirty tree today, and the forced close now commits on trunk. Add the trunk and `dirty` guards `merge` carries.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/work-cloud-marker.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`close` already stands on `offTrunk` in `src/scripts/work-merge.js`, the guard `open` shares, which refuses off trunk and on a dirty tree. The commit landing it carries a test for the trunk half alone. This step adds the test for the dirty half: a forced close on a dirty tree answers 2 and pushes nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The ask stands met by `offTrunk`, and the change adds the test the dirty guard lacks.
- The change reveals no cleanup: `merge` keeps its own inline guards, which print its own verb.
- The guard stands in `offTrunk` alone, and `close` calls it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
