---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-verbs-need-no-wrapper/design/review
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
parent: the-verbs-need-no-wrapper
record:
  - step: do
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: 546afbb5ac3024de97451696ad0360b8bdb7e2c1
    hash_after: 546afbb5ac3024de97451696ad0360b8bdb7e2c1
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

approach items 1 and 4 change `src/scripts/cli-check.js`, `src/scripts/cli-read.js` and `src/bridge/guidance.js`. The ask names none of them, and the implement checklist refuses a file the ask leaves out. Name each on its ask line.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The wrapper ask's check line names `goHolds` in `src/scripts/cli-check.js` and `lint` in `src/scripts/cli-read.js`. Its tools line names `toolsText` in `src/bridge/guidance.js`. The approach changes all three, and the implement checklist refuses a file the ask leaves out.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change names each file on the ask line whose approach item changes it.
- The change reveals no cleanup.
- Each file stands once on the ask, and the approach carries the detail.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
