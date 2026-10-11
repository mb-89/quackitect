---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: tests-green-names-the-ask/gate
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
group: handovers-and-light-work
parent: tests-green-names-the-ask
record:
  - step: do
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: 4e90cc452dfebd20448c414c60b1406716a61682
    hash_after: 4e90cc452dfebd20448c414c60b1406716a61682
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   70.3  in all"
    inputs:
      - name: ask
        hash: 5e318789ffe16865
        size: 93
    def: 4197ecd572d7ab20
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list skips src/pull/pull_hand.go, whose hand-out calls readAgain and so staleRead

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_hand_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent Discussion adds src/pull/pull_hand.go to the callers of the stale read. Its queue scan calls readAgain, and that calls staleRead. The change touches no code, so the hand-out test stands as it stood.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the callers list names pull_hand.go
- the change reveals no cleanup
- the caller stands once, under the parent Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
