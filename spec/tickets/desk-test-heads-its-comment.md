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
    tags: ["code", "testing"]
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
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: e76d0a4d56d0380bca00b72b3c516b7e899ab461
    hash_after: e76d0a4d56d0380bca00b72b3c516b7e899ab461
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:265:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: b7dca66abb6cb9be
        size: 434
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The push meets a clear lint, so `main` reaches the remote with the bridge draft and its red cases on it. Without the fix, every push from a desk stops on the `CodeComment` warning in `test/contract/desk-start.test.js`, a comment standing mid-file. The fix folds that comment into the file header.

- `./RUNME.sh lint test/contract/desk-start.test.js` names no finding
- `./RUNME.sh test test/contract/desk-start.test.js` answers green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/desk-start.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The comment that stood mid-file in `test/contract/desk-start.test.js` now stands in the file header, so the `CodeComment` rule finds nothing there and the push meets a clear lint. The case and its stub are unchanged. The ticket took a five-word name, because the mint took a six-word one the name rule refuses.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the comment moves into the header, and the lint and the test on the file answer clean
- the change reveals no cleanup beyond the comment it moves
- the change adds no fact: the moved line says what it said before, in the header

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
