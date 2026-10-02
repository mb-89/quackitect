---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: watchdogs-span-the-processes/gate
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
group: module-processes-land-in-shadow
parent: watchdogs-span-the-processes
record:
  - step: do
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 115ae4c9c3f939d7dccca364f0da5a5d65c2e44e
    hash_after: 14b1ce4217f71796bc33dfd590b977baf5b25ee6
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/imports passes
      - name: check
        exit: 0
        said: "spec/tickets/watchdogs-span-the-processes.md:301:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: a10e04215c9b13b0
        size: 127
    def: 768b35c21e8ff843
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the silent module case counts faults on a fake dog. Run it over the manager's dog, and read session/alarms as the IO case does.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/procs_test.go src/imports/tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The silent module case now runs over the index manager's dog, the one the IO case runs, and passes once the fake restarts and session/alarms names it. The case moves from src/index/procs_test.go to src/quack/io_test.go, since the import rule refuses the index importing a module, and the fake dog leaves with it. The case stays red on the parent's red list, and fails on its own assertion until the parent's implement step wires the lease into a placed process.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the discussion on watchdogs-span-the-processes says why the case moves to quack
- the cleanup the change reveals is in the change: the fake dog and the fake silent process leave src/index with the case
- every fact the change adds stands in one place: the case reads manager.AlarmsName, and the parent's discussion points at the moved file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
