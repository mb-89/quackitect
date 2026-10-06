---
kind: [[ticket]]
state: closed
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
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 7fc87b0034ccc68a9062acfca9b5df7722963769
    hash_after: 7fc87b0034ccc68a9062acfca9b5df7722963769
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 2 file(s); green, src/quack passes; green, src/index passes
      - name: check
        exit: 0
        said: "  113.5  in all"
    inputs:
      - name: ask
        hash: 562ae04dc43813a6
        size: 1128
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/quack/io_test.go src/index/reach_test.go test/contract/lint-twins.test.js test/contract/runme-road.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commits b3f1df35f and 157e9a2c9 carry the change. The silent fakes commit a mark of their own run, so the alarm case waits on the alarm and not on a pid Windows hands on. A reach waits on its door up to the start hang guard, so a cold door drains the tree before the lint or the road case reads it. The lint answers its sweep fault on stderr and exits failed, and the twins case prints that fault where the lines differ. The Windows runner decides on the group pull request.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the Windows runner reads it on the group pull request, since this box runs Linux alone
- the cleanup it reveals rides in the change: the twins case shows the Go fault
- each wait stands once, as a named constant in src/index/main.go, and the tests point at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
