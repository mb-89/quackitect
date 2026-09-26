---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-holds-the-clear/design/review
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
group: the-gates-read-the-state
parent: the-retro-holds-the-clear
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: b5054be43dc346dd5417270bf6f686a0caf9838e
    hash_after: b5054be43dc346dd5417270bf6f686a0caf9838e
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-window-keeps-the-binding.md:39:130: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`holdsIn` reads every hold on the box, so a helper holding a retro step keeps the owner's session from clearing. The builder reads the session's own hold in `clearsHere`, or records why the box-wide read stands

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/retro-clear.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`retroInHand` in `src/bridge/handover.js` reads the retro holds, then keeps the one whose hand is the session's own, off `handOf`. A helper's hold carries its own name after the session's hand, so a helper's retro clears nothing away. The case a helper holding a retro leaves the session clearing under the queue, in `test/level0/retro-clear.test.js`, holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the session's own hold decides
- the cleanup: a box with no process door names no hand, and `ownHand` answers empty there
- the rule stands in `stop.md` under `The queue alone clears`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
