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
    hash_before: d0536aeb14eaf32b7b4c249a7b7ee8fda212647b
    hash_after: d0536aeb14eaf32b7b4c249a7b7ee8fda212647b
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-style-carries-the-top.md:143:56: Vocabulary: blocksof stands outside the words this tree writes. Write "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list names ephemeralPull as a caller of handed, and dueHandOut in src/scripts/ephemeral-pull.js makes that call

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-cap.test.js test/level0/pull-ephemeral.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

dueHandOut in src/scripts/ephemeral-pull.js calls handed, and ephemeralPull reaches it through dueHandOut. The record of an-answer-stays-under-cap keeps its draft as the hand wrote it, and this line corrects it: the callers of handed are handOut in src/scripts/pull-hand.js and dueHandOut in src/scripts/ephemeral-pull.js. Both reach printPart, and the pull cases drive both.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and names the caller here, since the draft of a closed ticket stays as its hand wrote it
- the change reveals no cleanup
- the caller stands named once, here

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
