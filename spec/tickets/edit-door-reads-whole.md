---
kind: [[ticket]]
state: closed
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 8c38ceb02637f2c30afcfa4774e08630efcc1362
    hash_after: 8c38ceb02637f2c30afcfa4774e08630efcc1362
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 49 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The Edit door lints the replaced text alone. So a shape rule over a whole file, such as VocabularyEntry or GuidanceChapter, refuses an edit that stands far from its header. Without it an agent inserts near a header to pass, and the file drifts. Done is one thing:

- the door reads the file as it stands after the edit
- a test under test/level0/hooks.test.js proves an edit far from a header passes

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/hooks.test.js

## check

    ./RUNME.sh check

## says

The write door reads the file as it stands after the edit, and hands that whole text to every rule. So a shape rule over the whole file reads the header and the edit together, wherever the edit stands. The reader now stands exported, and a test drives an edit far from the header, a multi-edit and a write.

## checked

- the change follows the ask: the door reads the whole file, and the test proves the far edit passes
- the cleanup the change reveals is none

# Discussion

Nothing stands here yet.
