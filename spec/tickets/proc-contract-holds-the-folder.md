---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: git-and-process-doors-designed/gate
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
parent: git-and-process-doors-designed
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: cfd54500b8c1c83639e79c381cbbc81f41362890
    hash_after: cfd54500b8c1c83639e79c381cbbc81f41362890
    answered:
      - name: tests
        exit: 0
        said: green, src/proc passes
      - name: check
        exit: 0
        said: "    2.5  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: eae81bee1856f680
        size: 158
    def: 3a9676c35d5b5a6c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Command carries Dir and the door takes a folder, yet src/proc/proc_contract_test.go holds no case running a command in a folder, so a fake ignoring Dir passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/proc/proc_contract_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The process contract gains TestARunStandsInItsFolder: sh runs pwd -P in a temporary folder, and both runners answer that folder. A fake ignoring Dir now fails the suite. The case needed a fake that runs at all, so FakeRunner.Run now answers from its Programs table, with NotStarted and an error on an empty argv or an untaught program.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the folder case stands in src/proc/proc_contract_test.go, and it departs by filling FakeRunner.Run, the implement change of git-and-process-doors-designed, since a stub fake fails every case
the cleanup the change reveals is in the change: the stub fake goes, and the real runner empty argv stays with proc-empty-argv-never-starts
every fact stands once: the case and the fake answer live in their files, and both point at spec/design_output/doors#the-process-door

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
