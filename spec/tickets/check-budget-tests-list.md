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
    hand: box c7dec0a36dda · claude-code-remote
    hash_before: d5b77a53ceee31d657bd18ec65de3a40926a0177
    hash_after: d5b77a53ceee31d657bd18ec65de3a40926a0177
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    3.3  test/contract/lint-twins.test.js the Go lint and the check's lint name the same finding lines"
    inputs:
      - name: ask
        hash: a0df5d25ceffbde2
        size: 290
    def: 30024539343bec95
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's tests list names src/branches/parallel_test.go TestEveryBranchesTestRunsBesideTheOthers, which stands nowhere. The guard stands in src/imports/serial_test.go as TestATestRunningAloneWithNothingBarringItIsNamed and TestTheSlowPackagesRunEveryTestBesideTheOthers, so fix the list.

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

The group's Discussion gains a section naming the two guard tests in src/imports/serial_test.go, in place of the draft's tests line naming a file that stands nowhere. The draft field stays closed to edits, so the correction sits beside the size correction the same way.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- ask: the list now names the two guard tests the gate names, under the group's Discussion, since the draft field stays closed
- cleanup: none revealed
- one place: the test names stand once, in the Discussion, and point at the file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
