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
    hash_before: 5269567469e190abf0ded09cd810785dbb07ccdc
    hash_after: 5269567469e190abf0ded09cd810785dbb07ccdc
    answered:
      - name: tests
        exit: 0
        said: green, 31 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-verbs-need-no-wrapper.md:184:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`git diff --cached -M` reads a move as a delete and an add where the rename rewrites the file past the similarity cut, so `landsAndPushes` misses the old path. Read the staged deletions, or have `rename` record the move.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/commit-verb.test.js test/level0/rename.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The rename verb's journal entry records the move as `moved`, its from and its to. `movedFrom` in `src/scripts/commit-verb.js` reads those entries beside `git diff --cached -M`. So a commit naming a renamed path lands the old path's deletion, even where the rewrite takes the file past git's similarity cut.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask's second road: the rename records the move, and the commit verb reads it
- the cleanup: none stands past the two cases
- the move stands on the journal entry alone, and the commit verb reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
