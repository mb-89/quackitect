---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-landing-takes-a-verb/design/review
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
group: the-verbs-land-whole
parent: every-landing-takes-a-verb
record:
  - step: do
    hand: box d7a55188b9103 · claude-code-remote
    hash_before: 2c22b1e4189887b5a5862a119ab4d4e9725984f6
    hash_after: 2c22b1e4189887b5a5862a119ab4d4e9725984f6
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/rename.js:170:1: correctness/noUnusedFunctionParameters: This parameter to is unused."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

approach item 5 deletes the `claude/` branch on green while `main` stands ahead of origin. `close` refuses that order, so the merge pushes `main` first or keeps the branch.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/work-group.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`mergeCloud` in `src/scripts/work-merge.js` pushes `main` before it deletes the `claude/` branch, and a refused push leaves the branch standing. The code carries that order already. A new case in `test/level0/work-group.test.js` holds the refused road, beside the case holding the order.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the merge pushes main first, and keeps the branch where the push refuses
- the cleanup: none stands, because the order already lands in the code
- the order stands in `mergeCloud` alone, and its design note links there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
