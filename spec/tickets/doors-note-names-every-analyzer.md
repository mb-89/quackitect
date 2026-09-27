---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-import-rules-get-checked/design/review
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
group: the-foundation-lands-unchanged
parent: the-import-rules-get-checked
record:
  - step: do
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 04ba6e13b56f13ead1dcd89189b9f38659c248f2
    hash_after: 04ba6e13b56f13ead1dcd89189b9f38659c248f2
    answered:
      - name: tests
        exit: 0
        said: green, 26 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

add the analyzer `nodoor` to the table of [[spec/design_output/model#the-build-checks-imports]]. The note then owns every analyzer, and the code points there.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/contract/tree.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The analyzer table of the Go doors note gains `nodoor`, so the note owns every analyzer [[spec/tickets/the-import-rules-get-checked]] builds. The change touches no code, and the tree test reads every pointer to the note.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask
- the change reveals no cleanup
- the note owns the analyzers, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
