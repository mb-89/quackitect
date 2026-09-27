---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: an-answer-stays-under-cap/design/review
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
group: guidance-rides-each-step
parent: an-answer-stays-under-cap
record:
  - step: do
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 8895363046911ea729ac9347dda034c907b68773
    hash_after: 8895363046911ea729ac9347dda034c907b68773
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-style-carries-the-top.md:143:56: Vocabulary: blocksof stands outside the words this tree writes. Write "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

partOf in src/scripts/pull-chapter.js cuts at a UTF-8 boundary inside room where one line alone runs past room, because a cut at the last line ending finds none there

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-cap.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

partOf lives in src/scripts/pull-cap.js, beside the rest of the cap. A first line longer than the room cuts at the last character inside it, so the cut splits no UTF-8 character, and the case a line longer than the room cuts at a character holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and partOf stands in src/scripts/pull-cap.js in place of pull-chapter.js, since the cap owns it
- the change reveals no cleanup
- the cut stands once, in partOf

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
