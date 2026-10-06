---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tests-meet-the-doors-once
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The check on a cold or loaded runner, Windows among them, answers what the tree says and not what the box's load says, so a healthy pull request turns green.

<!-- breaks, as text: what breaks if it is never done -->
Pull request #110 stands red on its Windows run: `lint-twins` reads an empty Go lint on a cold runner, `TestASilentModuleProcessRestartsAndRaisesAnAlarm` passes its twenty-second cap under a parallel run, and `runme-road` waits past its door's start span on a cold box. Every pull request after it meets the same three.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `go test ./src/quack -run TestASilentModuleProcessRestartsAndRaisesAnAlarm` passes, asserting the restart and the alarm as before, with its wait ending on the state it polls and the suite's deadline as the hang guard
- the Go lint answers a fault, never an empty list, where its rule program fails to answer, and `test/contract/lint-twins.test.js` asserts the same finding lines as before
- `test/contract/runme-road.test.js` waits on the door's readiness, and asserts what it asserted before
- each of the three keeps one test against the real door
- `./RUNME.sh check` stands green on the box and on both runners of the pull request

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
none

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
