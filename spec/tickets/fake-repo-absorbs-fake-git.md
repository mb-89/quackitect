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
    hash_before: 75366e883e071f144adc6304e6f8f3e590924184
    hash_after: 75366e883e071f144adc6304e6f8f3e590924184
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  118.9  in all"
    inputs:
      - name: ask
        hash: 2d3acb7f6b1dd564
        size: 161
    def: 3a9676c35d5b5a6c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the chapter puts FakeRepo beside FakeGit in src/modules/git and names no fate for FakeGit four reads, so the package keeps two git fakes, the drift the ask names

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/clock_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The doors chapter now names FakeGit's fate: FakeRepo answers the four reads of Git off its own commits and refs, so FakeGit leaves once its cases move, and the package keeps one git fake. FakeRepo stands in the design alone today, so the change touches no code. The clock tests read the family table of the same chapter, so they cover the edit.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the row beside FakeRepo in spec/design_output/doors.md names FakeGit's fate, landed at 3ec19c28e
the cleanup the change reveals, removing FakeGit from src/modules/git/git.go, waits on FakeRepo landing in code, which the child group unfaked-doors-take-fakes holds
the fate stands once, in the doors.md row, and no other note repeats it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
