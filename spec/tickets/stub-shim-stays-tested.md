---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: window-verbs-run-in-go/accept
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
group: window-verbs-run-in-go
parent: window-verbs-run-in-go
record:
  - step: do
    hand: box 05659fab4226 · claude-code-remote
    hash_before: e0a6d90b290f7c6180de65427bd3422ac0b56c6a
    hash_after: bd9a46211b359231fb0432793b00e1382e423698
    answered:
      - name: tests
        exit: 0
        said: green, src/vehicle passes
      - name: check
        exit: 0
        said: "   87.5  in all"
    inputs:
      - name: ask
        hash: 65732ffa1a9e2039
        size: 151
    def: 66bb314c32a9b6ac
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no test runs the real src/stub/RUNME.sh since test/contract/stub.test.js left, so its hand-over through SE_VEHICLE and the register road stand untested

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/vehicle/shim_contract_test.go runs the real src/stub/RUNME.sh with sh against a vehicle of one script that prints what reaches it. The cases cover the SE_VEHICLE road, the register road where SE_VEHICLE stands empty, the clone folder under HOME, and the miss, which exits one on a line naming the upstream and the clone folder. They take the place of the shim cases that left with test/contract/stub.test.js.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the real shim runs again under a test, on its hand-over and its register road
- the cleanup: none revealed past this file
- each fact stands once: the cases read the shim from src/stub and reuse seed from vehicle_test.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
