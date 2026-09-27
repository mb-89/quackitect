---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-battery-runs-on-fixtures/design/review
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
parent: the-battery-runs-on-fixtures
record:
  - step: do
    hand: box d7d6327f2b101 · claude-code-remote
    hash_before: ace2fcea230cb04225376ad0cb0157c16c199155
    hash_after: ace2fcea230cb04225376ad0cb0157c16c199155
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

approach item 4 changes `bundle` in `src/scripts/bundle.js`, which the ask leaves out, and the implement checklist refuses a file the ask leaves out. Name it on the ask's drawing-bundle line

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

The drawing-bundle line of the battery ask names `bundle` in `src/scripts/bundle.js`. The approach gives `bundle` an optional entry and out, and the implement checklist refuses a file the ask leaves out.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- The change is the one line the finding asks, on the ask's drawing-bundle line.
- The change reveals no cleanup.
- The line names the file and the function once, and approach item 4 carries the detail.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
