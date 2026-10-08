---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-tests-meet-the-doors/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: go-tests-meet-the-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 52a39fa8caeea7c9a0ec1cb7eef12212f3e614e4
    hash_after: 52a39fa8caeea7c9a0ec1cb7eef12212f3e614e4
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: 62870f685d4e9eef
        size: 383
    def: ce7faccd2ca3d01b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask's second done_when line says `./RUNME.sh doors` lists a door's contract test under the door, but TestDoorsPassesAContractTestItsDoorNames in src/quack/verb_doors_test.go asserts the output names no contract test, and doorsVerb in src/quack/verb_doors.go prints walks and a count alone; add a red case asserting the listing, and have doorsVerb print each door's contract tests

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_doors_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

walksOver in src/quack/verb_doors.go prints a line for each contract test a door names, before the walks: <test> keeps the contract of <door>. TestDoorsPassesAContractTestItsDoorNames asserts the line, the walk in a file outside the contract test, and no walk in the test itself. The check reads the verb by its exit code alone, so the new lines change no count. It landed in 5dbf75bb3.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the gate point: a red case asserts the listing, then doorsVerb prints it
the change reveals no cleanup
the line form stands once, as contractLine beside the other forms in verb_doors.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
