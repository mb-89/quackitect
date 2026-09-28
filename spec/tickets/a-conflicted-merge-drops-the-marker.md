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
group: the-cloud-follow-ups-land
---

# Ask

`./RUNME.sh branch merge` drops the `cloud` marker from trunk's copy of the group on a clean merge, and leaves it where the merge conflicts. The owner orders the conflict path to drop it too.

The gain is a trunk that names no group standing in the cloud once its branch comes in, whichever path the merge takes.

Without it a closed group keeps `cloud: true` on trunk, as the-foundation-closes-its-gaps does, and every reader of the marker takes the group for one a box still works.

- a merge that conflicts drops the marker from the group ticket in the working tree, and stages it, so the resolving commit carries it
- the stale marker on the-foundation-closes-its-gaps drops
- `./RUNME.sh test test/level0/work-cloud-marker.test.js` is green

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
