---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: read-verbs-run-in-go/accept
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
group: read-verbs-run-in-go
parent: read-verbs-run-in-go
record:
  - step: do
    hand: box 10fabe1f5ba9 · claude-code-remote
    hash_before: 6449289fb0184c588fde53247dfcb3262d04fc13
    hash_after: 6078e48c3d2f96d7c9bf4296bfa7ad87c07330f8
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   36.0  in all"
    inputs:
      - name: ask
        hash: 0905c600280fbfa2
        size: 164
    def: b523d80c2c6f4b51
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the lint row goes through appendsRow in src/quack/verbs.go, which writes below the log.level floor, so every passing lint appends a debug row the JavaScript dropped

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verb_lint_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go lint wrote its log row through appendsRow, which reads no floor, so every passing lint appended a debug row the JavaScript log door dropped. The lint writer now reads log.level off the config and drops a row below it, and an empty floor reads as info.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the lint row keeps the floor
- the cleanup the change reveals is in the change: none past the lint writer
- every fact stands in one place: the key stands named once in verb_lint.go, and Rank stays the one ladder

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
