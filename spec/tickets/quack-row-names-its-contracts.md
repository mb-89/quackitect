---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: test-walks-move-onto-fakes/gate
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
group: doors-declare-what-they-own
parent: test-walks-move-onto-fakes
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 7f04c4047925655801212fed04050a9fc8a427c5
    hash_after: 6eae95700d5e3931e26d0c97ac2a27c9b47685d0
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "   61.4  in all"
    inputs:
      - name: ask
        hash: f183321f76882a8a
        size: 362
    def: 16c92ada996c9f36
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the door-audit row of spec/design_output/doors.md for the box and check doors of quack names none under contract suite, while src/quack/owns.yaml names src/quack/box_doors_contract_test.go, src/quack/ending_contract_test.go and src/quack/ending_windows_contract_test.go under contract. The row names those three, so the chapter and the declaration say one thing.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The door audit row for the box and check doors of quack in spec/design_output/doors.md named no contract suite. It now names the three files that src/quack/owns.yaml declares under contract. The chapter and the declaration say one thing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the row names the three files owns.yaml declares, and nothing else changes.
the change reveals no cleanup.
owns.yaml holds the contract list, and the audit row names the same files because the audit table names a contract suite on every row.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
