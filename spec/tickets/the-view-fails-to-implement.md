---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-owner-view-decides-done/design/review
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
group: the-owners-word-reaches-work
parent: the-owner-view-decides-done
record:
  - step: do
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: b0f7d9a96e5963495b55d4bdc4a6a917a3b5bb79
    hash_after: b0f7d9a96e5963495b55d4bdc4a6a917a3b5bb79
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-view-fails-to-implement.md:39:1: CodeSpans: A sentence holds 4 code spans, and this one holds 6. Carry "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the `view` step names no `on_fail`, so `failed` in `src/scripts/pull-writes.js` holds the ticket at `view` and the owner's fail reaches no code; the step carries `on_fail: implement`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/process.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The `view` step in `spec/processes/standard.yaml` carries `on_fail: implement`, so the owner's fail sends the ticket back to the code. It landed with `the-owner-view-decides-done`, and the standard route case asserts it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and landed with its parent's build
- no cleanup stands revealed
- the route states the fail target once, and the case reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
