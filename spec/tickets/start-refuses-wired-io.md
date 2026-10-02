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
    hash_before: 5342847d59e37727520a08a302178801c276b7d0
    hash_after: b0a266428b31b01dc50ef88b5ca29be5ab162519
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/start-refuses-wired-io.md:41:20: Vocabulary: ioprocesses stands outside the words this tree writes. Write a"
    inputs:
      - name: ask
        hash: 26a7278ee781a4ca
        size: 78
    def: 0d4f9b5a406ad30a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no case holds that ioProcesses itself refuses an IO instance that reads a wire

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/io_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestTheSplitRefusesAnIOInstanceOnAWire calls ioProcesses with a store where the IO instance reader reads a wire source provides. It holds that the split refuses to start, and that the refusal names reader alone. With the guard switched off the case goes red, since the split starts. The fixture the wiredIO case reads moves into ioOnAWire, so both cases read one store.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case drives ioProcesses itself
- the cleanup: the shared fixture moves into one helper
- one place: ioOnAWire owns the wired store

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
