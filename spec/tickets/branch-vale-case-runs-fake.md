---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: branch-verbs-meet-fake-git/gate
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
group: unfaked-doors-take-fakes
parent: branch-verbs-meet-fake-git
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: ec083caabf17ad8ce74f0b78d54f86a41f09cb99
    hash_after: ec083caabf17ad8ce74f0b78d54f86a41f09cb99
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes; green, src/branches passes
      - name: check
        exit: 0
        said: "    2.3  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
    inputs:
      - name: ask
        hash: c84e434e2bb20229
        size: 389
    def: 4f3f6e436536a986
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestDispatchWritesAFixAskTheVoiceRulesPass in src/branches/dispatch_write_test.go spawns vale through proc.Real, so one case in a file done_when one names runs a real process, and the guard in doors_test.go misses it because imports.RealWaits sees no proc.Real call; the case either moves to a door test of vale with a row in the doors chapter's family table, or the audit learns proc.Real

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/clock_test.go src/branches/dispatch_vale_test.go src/branches/doors_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The real-wait audit in src/imports/clock.go now names a call of proc.Real beside exec and the sleep. Before, a test spawning through the process door slipped past every guard. The planted cases in clock_test.go hold the call, and they failed before the audit learned it. The vale case of the dispatcher leaves dispatch_write_test.go for dispatch_vale_test.go, the branch package's one door test of vale. A family row in the doors chapter lists it. The branch guard in doors_test.go leaves that one file out by name, so every other branch case still has to spawn nothing. Vale has no twin in memory, so the case keeps the real program, and the audit now sees it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change takes both roads the ask names: the audit learns proc.Real, and the case stands as a door test of vale with a row in the family table
- the move revealed that the branch guard refuses any branch file in the doors chapter, so the guard leaves the vale door test out by a named constant
- the vale door test's file name stands once, in valeDoorTest, and the doors chapter row names the file the check reads

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
