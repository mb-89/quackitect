---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: config-answers-keys-and-overrides/gate
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
group: sidebar-switches-over
parent: config-answers-keys-and-overrides
record:
  - step: do
    hand: box d88dc33717d8 · claude-code-remote
    hash_before: b532b2cfa8dba94963c5dd2a14c95a6f713335e8
    hash_after: b532b2cfa8dba94963c5dd2a14c95a6f713335e8
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/config passes
      - name: check
        exit: 0
        said: "spec/tickets/the-lens-calls-actions.md:307:61: Vocabulary: fakedisk stands outside the words this tree writes. Write a c"
    inputs:
      - name: ask
        hash: 79cac3e6da759a54
        size: 94
    def: 3bda54621f1d9975
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's tests and size lists name `config_test.go`, and the cases stand in `keys_test.go`.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/config/config_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The config ticket's draft names config_test.go, and the red cases stand in keys_test.go. The engine writes the draft while the ticket stands open. So a line under its Discussion names the file the cases stand in, and the file the router's case lands in.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask through the one chapter a hand may write on an open ticket
- the cleanup it reveals stands in the gate's other points, each a ticket of its own
- the file names stand in the Discussion alone, and point at the test files

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
