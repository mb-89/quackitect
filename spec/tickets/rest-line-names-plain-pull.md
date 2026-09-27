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
    hash_before: 8426d7f653978030645739041d3f942ac34727e8
    hash_after: 8426d7f653978030645739041d3f942ac34727e8
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

the closing line of a cut hand-out names the plain pull, with --as where the hold carries one, and no ticket name, because pull in src/scripts/pull.js sends a name with a held leaf to handBack, and stillHeld stands behind that road

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

runsOn in src/scripts/pull-cap.js writes the closing line of a cut hand-out. It names ./RUNME.sh ticket pull with --as where the hold carries one, and no ticket name, so the next pull reaches stillHeld and prints the rest. The split case pulls plain and gathers every part.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the change reveals no cleanup
- the closing line stands once, in runsOn

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
