---
kind: [[ticket]]
state: closed
todo: false
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
record:
  - step: do
    hand: box d7a4248a337e5a · claude-code
    hash_before: c43e0bea3f5e121db709ab81fc0d940424c01907
    hash_after: c43e0bea3f5e121db709ab81fc0d940424c01907
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:219:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: abdc26d393c9eb0e
        size: 717
      - name: [[spec/design_output/pull]]
        hash: 5ded6a7d555f6900
        size: 44159
    def: 41499778917f0d75
reason: done
---

# Ask

A hand holding a group at `retro/notes` decides each private note on the box, and the step passes. [[spec/design_output/pull#the-private-queue]] sends a note to that hand.

Today the hold refuses the note. A pull naming it answers that one hand holds one ticket. A pull under `--as` answers that the todo in hand blocks it, whatever the plan names. So `retro notes` exits 1, and the group stands at `retro/notes` with no road to `branch done`.

- a hand holding a group at `retro/notes` pulls a private note and hands it back `became`. A case under `test/level0` decides it
- `./RUNME.sh retro notes` then exits 0, and the group passes `retro/notes`. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/retro-notes-pull.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A group standing at a retro step hands its private notes out before itself, so the hand holding it decides each note and retro notes exits 0. The fix landed in e1fe50650 with test/level0/retro-notes-pull.test.js, and this hand ran both again.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: a hand at retro/notes pulls a note, decides it, and the step passes
the cleanup the change reveals is in the change, and nothing further stands
the rule stands once in handOut in src/scripts/pull-hand.js, and spec/design_output/pull#the-private-queue points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The fix stands in commit `e1fe50650` on `work/the-engine-holds-the-route`, with `test/level0/retro-notes-pull.test.js`. The next hand runs the tests and the check, and hands the evidence back.
