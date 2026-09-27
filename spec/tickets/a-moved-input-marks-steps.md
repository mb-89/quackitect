---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-process-stays-editable
step: design/review
record:
  - step: design/draft
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: 37121f76c6fc6552e82d6eeb72f418a6a6bf03ed
    hash_after: 37121f76c6fc6552e82d6eeb72f418a6a6bf03ed
---

# Ask

A moved input marks exactly the steps that read it, and a process stays editable while it runs. [[spec/design_input/level-two]] asks it in its chapter Evidence and stale steps.

Today a changed input leaves every step that read it standing as done, and a route edit reaches a ticket through `ticket update` alone.

- the ticket file holds the hash of each input and of each step definition. The engine asks the index for them. A case under `test/level0` decides it
- a moved input marks exactly the steps whose checks read it. A case under `test/level0` decides it
- an append moves the hash of a node on, and the steps reading it stay whole. A case under `test/level0` decides it
- an edit downstream of the step in hand keeps the earlier steps. An edit upstream sends the process back to the last whole step. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

For details, see [[spec/design_output/pull#an-input-marks-its-steps]].

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull-writes.js passed, which writes inputs and def into the record entry,src/scripts/pull-hand.js handOut, which runs the stale read before it takes a leaf,src/scripts/pull.js pull, which reaches handOut,src/scripts/ticket.js update and updated, which the process edit reuses,src/doors/index.js ask, which gains the hashes method,src/index/door.go the method switch, which gains hashes,spec/schemas/ticket.schema.yaml the record entry, which gains inputs, def and stale

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-stale.test.js a passed leaf records the hash of each input and of its definition,test/level0/pull-stale.test.js a note input takes its hash from the index,test/level0/pull-stale.test.js a moved input marks exactly the leaves reading it,test/level0/pull-stale.test.js an append to an input keeps the leaves reading it whole,test/level0/pull-stale.test.js a process edit past the step keeps the earlier leaves,test/level0/pull-stale.test.js a process edit before the step sends it back to the last whole leaf,src/index/files_test.go TestHashesAnswersTheHashOfEachPath

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

processAt, updated, reachedOf, handOut, the index door and Files stand opened, and each claim checked there
the callers list names each function the stale read and the record fields change
each done_when line maps to a pull-stale case: hashes, marks, append, edit

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The split of the-engine-holds-the-route leaves one line of [[spec/design_input/level-two#gates]] to this ticket. The commit of a gate counts as the output of the gate, and moves no input of the phase it closes.
