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
    hash_before: 2f247d6494b66d88b2bb2812b5b4a8dee102570b
    hash_after: 2f247d6494b66d88b2bb2812b5b4a8dee102570b
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  103.9  in all"
    inputs:
      - name: ask
        hash: bc92ba8ce211812e
        size: 233
    def: 30024539343bec95
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the guard in src/imports/serial_test.go names src/pull among slowPackages, and src/pull's tests are its only red, yet size names no src/pull file and no src/imports/serial.go. Add src/pull/*_test.go and src/imports/serial.go to size.

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

The parent's Discussion names the three files the draft's size list leaves out. They are src/imports/serial.go, the src/pull test files the guard reaches, and src/quack/check.go, where the gate runs the red packages apart.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: both files the point names stand in the list, under Discussion, since the engine keeps the draft's fields closed
- cleanup: check.go joins the list, since the skip fix lands there
- one place: the full list stands in the Discussion, beside the draft's four lines

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
