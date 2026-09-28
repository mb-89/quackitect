---
kind: [[ticket]]
state: closed
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
step: do
record:
  - step: do
    hand: box d81c8e27d9d7 · claude-code-remote
    hash_before: c30e878f3912c98bbdb2500c9f1dd11512a4f020
    hash_after: 599ee0aab08f5a3f5dea72c283f9f30300e2a962
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 5258b3c7e69bc3eb
        size: 715
    def: df12650931d480c9
reason: done
---

# Ask

`./RUNME.sh branch merge` drops the `cloud` marker from trunk's copy of the group on a clean merge, and leaves it where the merge conflicts. The owner orders the conflict path to drop it too.

The gain is a trunk that names no group standing in the cloud once its branch comes in, whichever path the merge takes.

Without it a closed group keeps `cloud: true` on trunk, as the-foundation-closes-its-gaps does. Every reader of the marker then takes the group for one a box still works.

- a merge that conflicts drops the marker from the group ticket, and stages it for the resolving commit
- the stale marker on the-foundation-closes-its-gaps drops
- `./RUNME.sh test test/level0/work-cloud-marker.test.js` is green

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

branch merge drops the cloud marker on its conflict path too, and stages the ticket for the resolving commit. Where the group ticket itself conflicts, a staged write marks it resolved, so the merge leaves it and prints the line naming the marker to drop. The engine marks() dropped the stale marker on the-foundation-closes-its-gaps.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the conflict path drops the marker, and the stale one drops
- the cleanup the change reveals: a conflicted group ticket keeps its marker, and the merge names it
- every fact stands once: the conflict test sits beside the clean-merge test

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
