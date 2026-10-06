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
    hash_before: 695d0433a75b7b460fcface41dd6c7f58626b496
    hash_after: 695d0433a75b7b460fcface41dd6c7f58626b496
    answered:
      - name: tests
        exit: 0
        said: green, src/proc passes
      - name: check
        exit: 0
        said: "    3.0  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
    inputs:
      - name: ask
        hash: ff9df1d85151be68
        size: 120
    def: 3a9676c35d5b5a6c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

proc.Real indexes Argv[0] and panics on an empty Argv, where the door answers NotStarted for a program that never starts

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

proc.Real read Argv[0] before it checked the argv, so an empty command panicked. Both runners now answer a command naming no program with one value, namesNoProgram, which carries NotStarted and an error. The contract case TestACommandNamingNoProgramAnswersNotStarted holds both runners to it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: Real answers NotStarted on an empty argv, and the contract suite proves it on both runners
the cleanup the change reveals is in the change: the fake had its own copy of the answer, and both runners now share namesNoProgram
the answer stands once, in src/proc/proc.go, pointing at spec/design_output/doors the-process-door

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
