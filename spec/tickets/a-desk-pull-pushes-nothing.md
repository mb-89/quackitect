---
kind: [[ticket]]
state: closed
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
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: d62d892ec3dac1de087aeb304c53f98cd87abab1
    hash_after: 7558bf06b0f45c99bb863736da60143516b41412
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "src/bridge/refactor-hand.js:142:55: Modal: This register holds the modals can, must, will. Say what is, or name the one "
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A desk's pull hands back on this box alone, as its commit verb does, and the owner pushes. The desk then works a ticket through its steps, and every push stays the owner's.

Without it every hand-back on a desk pushes `main`, so a desk breaks working rule 11 at each step, or stops.

- a desk's hand-back commits and pushes nothing, and a test drives it
- a cloud box's hand-back pushes as it does now, and the same test drives it
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-push.test.js test/level0/pull-escalate.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`pushed` in `src/scripts/pull-push.js` answers local on a desk, before any check or push. So every pull hand-back on a desk stands on the box, and the owner pushes. A cloud box pushes through the same function. One test drives the desk hand-back and the cloud push, and the escalation on a desk pushes nothing. `spec/design_output/pull.md` names the desk road.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the desk commits and pushes nothing, the cloud box pushes, and one test drives both
- the cleanup: the trunk road of `pushed` has no pull caller, and the note `trunk-push-has-no-caller` carries it
- one place: the desk road stands in the `pull.md` table, and the code comment points at the working guidance

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
