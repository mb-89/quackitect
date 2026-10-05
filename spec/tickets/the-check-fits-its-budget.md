---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
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
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-check-fits-its-budget
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box ce27714b7c6d · claude-code-remote
    hash_before: 1aa2468496c55855f3e504c74477a8284c96ede2
    hash_after: 292d955659e93fbf84dd34941a094522ad234e4a
    inputs:
      - name: ask
        hash: 0a0b05c325cb5bf4
        size: 1035
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box ce27714b7c6d · claude-code-remote
    hash_before: 16ab2a25b8d545801a0ddea0df1ca921c74e52d9
    hash_after: 16ab2a25b8d545801a0ddea0df1ca921c74e52d9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: de831620df1416e4
        size: 2049
    def: 08e16d07b0de477c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Every push and every hand-back waits on `./RUNME.sh check`, and since the verbs moved into Go packages the go part of its battery spends most of the run, past `battery.budget`. This ticket finds where the go part spends time it need not spend, and cuts it. The owner's rule holds: the expensive tests run against the doors once, a fake door stands in everywhere else, and a duplicate case merges into one. No test is skipped, disabled or quarantined.

- gain: the check fits its budget again, so a push and a hand-back wait on the tests alone
- breaks: every box waits minutes past the budget on each check, and the budget reads red on a fresh box
- done_when: `./RUNME.sh check` on a warm box reads `battery.total` under `battery.budget` in `.se/.runtime/check.json`
- done_when: `battery.parts.go` in `.se/.runtime/check.json` reads lower, cold and warm, than the measure before, both under Discussion
- done_when: `./RUNME.sh branch test` passes on every test file the change moves to a fake door or merges
- view: none
- from: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The measure decides the approach, and the Discussion carries its numbers. A warm check spends seconds on go, because Go caches each package's result. A fresh box pays the whole go part, and so does any edit the tree takes, since TestTwinGoldens opens every tracked file and so reruns all of src/quack. The go part's span is its slowest package, because a package runs its tests one after another unless they say t.Parallel. src/branches holds that span: each test builds a real origin and clone. So the heavy packages' tests run beside each other, as rule 9 of spec/guidance/code/testing asks. A test reaching t.Setenv or t.Chdir stays serial, and the one Setenv in src/branches moves onto the fixture's own git env. A branches fixture turns off git's auto gc and maintenance, which spent processes after every fetch and commit. Each analyzer of the imports case loads its tree as a parallel subtest. No test leaves the run, and every case asserts what it asserted before. The race detector and shuffled repeats decide that the parallel tests share no state.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go goGate, which runs go test over every package
- src/branches/tree_test.go newTree and tree.sh, which every branches test calls
- src/branches/port_a_take_test.go paHandOver, which set the git dates through the process env

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/parallel_test.go TestEveryBranchesTestRunsBesideTheOthers

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/*_test.go
- src/quack/*_test.go
- src/imports/*_test.go
- spec/tickets/the-check-fits-its-budget.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: goGate and batteryRun in src/quack/check.go, newTree, sh and paHandOver in src/branches, the Doors run in src/branches/doors.go, TestTwinGoldens, and the imports analyzer test
- callers: every branches test reaches tree.sh through newTree, and goGate alone runs the Go tests in the check
- done_when: the check's battery.total and battery.parts.go in .se/.runtime/check.json decide the first two, and branch test over the moved test files decides the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/serial_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/imports/serial_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The guard names every src/pull test, because none calls t.Parallel. It names nothing in src/branches, src/quack or src/imports, where the change already stands, and its own planted case passes. The surprise is the size of the gap. Alone, src/branches runs in 50 seconds and src/quack in 34. Inside the full run, with every package competing for four cores, they ran far longer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the guard decides the parallel runs, the check's battery decides the budget and the go part, and the Discussion holds the measure
- doors: the guard parses source off the disk in a tree test, as TestTheTreeHoldsTheImportRules loads it, and it reaches no other door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
