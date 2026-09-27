---
kind: [[ticket]]
state: closed
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
record:
  - step: do
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 9aadc8c08719f55d6ca9000bb22fc87c694a8272
    hash_after: 13fd7b211a7d3d22186d1afd84dbb38452c7790e
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:122:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the `already stands in the cloud` return in `openGroup` writes nothing, so a branch opened before the change carries no marker. Write the marker on that road too.

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

The ask stands met on this branch, so the step changes no code. The `already stands in the cloud` road in `openGroup`, in `src/scripts/work.js`, returns through `marksTrunk`, so a branch opened before the marker takes it on the next open. The test `branch open marks a branch already standing in the cloud` in `test/level0/work-cloud-marker.test.js` holds the case.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The ask stands met by the `marksTrunk` call on that road, with its test.
- The reading reveals no cleanup.
- The marker write stands in `marksTrunk` alone, and both roads of `openGroup` call it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
