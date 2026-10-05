---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-check-fits-its-budget/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-check-fits-its-budget
parent: the-check-fits-its-budget
record:
  - step: do
    hand: box ce27714b7c6d · claude-code-remote
    hash_before: 083a430336090e563b534a1f889ed343ac2e2ce9
    hash_after: 083a430336090e563b534a1f889ed343ac2e2ce9
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  101.5  in all"
    inputs:
      - name: ask
        hash: bf608eca9702c20f
        size: 195
    def: 30024539343bec95
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach rests on the race detector and shuffled repeats to show the parallel tests share no state, and goGate runs neither. Name that command, and put its result under implement/tests-green.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/schema.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent's Discussion names the race command a hand runs after a change to the parallel tests, and its result on this box. The check runs no race detector, because it builds with no C compiler, so the command stands in the ticket where the reader of the parallel change finds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: the result stands under the parent's Discussion, because a hand writes only the chapter of the leaf it stands on, and tests-green points there
- cleanup: none shows
- one place: the command and its result stand once, in the parent's Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
