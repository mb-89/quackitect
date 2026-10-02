---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: module-processes-switch-over/accept
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
group: module-processes-switch-over
parent: module-processes-switch-over
record:
  - step: do
    hand: box 09eeff3afa7c · claude-code-remote
    hash_before: bbe5de88723d5189e0367dc7b70a4668dfbbc003
    hash_after: 5c00aaab17be775ddb7656f26dc6a3fa76c5576d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/start-refuses-wired-io.md:41:20: Vocabulary: ioprocesses stands outside the words this tree writes. Write a"
    inputs:
      - name: ask
        hash: 452b1702d40060df
        size: 106
    def: 0d4f9b5a406ad30a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the live kill case passes a nil dog, so no case holds that a crash under ioProcesses raises session/alarms

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/split_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestACrashingModuleProcessUnderTheSplitRaisesItsAlarm runs the live split under a dog that raises an alarm at two faults. It kills the guidance process, waits for the restart, kills it again, and reads session/alarms naming guidance alone. That holds the second half of the group's done line on the live path. The setup both split cases share moves into splitRuns, and spawnedPid takes the pid it waits past, so a case reads a restart. At three faults the case goes red.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a case under a real dog over ioProcesses
- the cleanup: the shared setup moves into one helper, so the two cases read their claims alone
- one place: splitRuns owns the setup, and the ticket front stands once as a constant

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
