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
    hash_before: 733253ae6faecf59c6642d825a9bfe78c763c88d
    hash_after: 4d74a4411b9d1a268b2f7e77d576d8fb76d7ccc9
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

`openGroup` pushes trunk with `cloud: true` before the branch push, so a refused branch push leaves the marker on trunk with no branch. Drop the marker on that refusal, or push the branch first, and add the case to the test file.

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

The ask stands met on this branch, so the step changes no code. `openGroup` in `src/scripts/work.js` pushes the branch first and calls `marksTrunk` after the push lands, so a refused branch push returns before trunk takes the marker. The test `a refused branch push leaves trunk without the marker` in `test/level0/work-cloud-marker.test.js` holds the case.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The ask's second road, the branch push first, stands in `openGroup`, with its test.
- The reading reveals no cleanup.
- The order stands in `openGroup` alone, and the comment above `marksTrunk` points at the group ticket.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
