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
    hash_before: 3c5e8a7dee297419eb4364ad5a4ad94a60b9250b
    hash_after: 3c5e8a7dee297419eb4364ad5a4ad94a60b9250b
    answered:
      - name: tests
        exit: 0
        said: green, 39 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "src/scripts/rename.js:170:1: correctness/noUnusedFunctionParameters: This parameter to is unused."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`landed` reads apply journals alone, and `rename` in `src/scripts/rename.js` stages a move and writes no journal, so a renamed path stays out of the pass commit.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/rename.test.js test/level0/apply.test.js test/level0/landed.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`renaming` in `src/scripts/rename.js` writes an undo journal entry. Each old path stands in it as gone, each new path as born, and each rewritten reach as changed. The entry names the ticket the box's one hold carries, so `landed` stages the move with that ticket's pass. Under several holds it names none.

`journalOf` in `.claude/skills/level0/lib/undo.js` carries a gone file as `did_not_stay`, and `restores` writes its text back. So an undo puts a move back whole, and refuses where the old path stands again. A picture's bytes stay out of the entry, because the entry holds text.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the move writes a journal `landed` reads
- the cleanup: an undo of a move needed the gone flag, so it rides this change
- the journal's shape stands in `journalOf` alone, and the rename verb calls it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
