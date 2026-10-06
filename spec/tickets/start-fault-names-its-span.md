---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: lease-waits-meet-a-fake-clock/gate
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
group: tests-meet-the-doors-once
parent: lease-waits-meet-a-fake-clock
record:
  - step: do
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: b7f4263f1c6d9c80bccbe9df2eeac57670d3eb2d
    hash_after: b7f4263f1c6d9c80bccbe9df2eeac57670d3eb2d
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   98.9  in all"
    inputs:
      - name: ask
        hash: 02bb210212b5374d
        size: 93
    def: 4cf644d72e823f8e
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

starts still says thirty seconds. The rewrite names the hang guard or the index exit instead.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The rewrite of `starts` in `src/index/door.go` names the index's exit or the hang guard, and no fixed span. It landed with hang-guard-under-suite-timer, because both points rewrite the same function. `TestAStartEndsWhenItsIndexExits` asserts the exit wording, and `TestAStartGivesUpOnAHungIndex` asserts the hang wording.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fault names the exit or the hang
- the cleanup rode the sibling point, which rewrote the same function
- the guard's span stands once, as `startHang`, and the fault prints it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
