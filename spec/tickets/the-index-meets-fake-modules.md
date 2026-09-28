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
step: design/tests-red
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [commits-name-their-writer]
record:
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 96ea8711eb32c62c8b2d3bae76e8f7f64bf2a4e9
    hash_after: 96ea8711eb32c62c8b2d3bae76e8f7f64bf2a4e9
    inputs:
      - name: ask
        hash: 19410b7019023e83
        size: 834
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
---

# Ask

A fake module drives the index through every transaction a module makes, per [[spec/design_output/model#the-index-meets-fake-modules]]. The index's own tests run over it, and none of them leans on a real module.

The index then tests against the contract its modules see. A change to the core shows its effect on every module at once.

- `go test ./...` from the root passes
- a case reads the passes over the wiring, and the refusal of an in-port left open
- a case reads a write refused from a module registering no such output
- a case reads one snapshot, the commit and the push
- a case reads the built-in value marked `not provided` for a writer running nowhere
- a case reads the stale mark after a lease expires
- a case reads writing actions run one at a time, and a read answering while one runs
- `./RUNME.sh check` exits 0

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

A scripted fake module stands in src/q/qtest/module.go. A script names an instance, its type, its out-ports with their built-in values, its in-ports, and its actions with their writes flag and the requests each answers.
Its types map hands q.Start the registration of each type, so the wiring loads fake modules the way it loads real ones. Each out-port registers through q.OutIn, each in-port through a derived provider that echoes it, and each action through q.ActionIn.
The cases of the q core stand in src/q/qtest/module_test.go, since package q cannot import qtest. They drive q.Start, Store.Commit, Store.Run, Store.OnCommit and Store.Down over the fake.
The cases of the manager stand in src/modules/index/module_test.go. They drive Call and the Book's writer queue, and the dog's lease, over the same fake.
Weighed: a scripted module in qtest against ad-hoc types per case, as src/q/start_test.go writes them now. One script keeps every transaction on one contract, so a change to the core shows across the cases at once.
Assumed: a port holds an int, since the cases read transactions and no value shape. Assumed: the fake module fakes no outside world, so it keeps no contract suite of its own.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/qtest/module.go: Module and its Types, which the new cases call
src/q/wiring.go: Start, which loads the fake's types, unchanged
src/modules/index/call.go: Call, which runs the fake's actions, unchanged
src/modules/index/lease.go: NewDog, which marks the fake's part stale, unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/q/qtest/module_test.go: TestTheWiringResolvesFakeModulesInTwoPasses
src/q/qtest/module_test.go: TestAnOpenInPortRefusesNamingTheReaderAndTheName
src/q/qtest/module_test.go: TestAWriteOfAPortTheModuleRegistersNowhereRefuses
src/q/qtest/module_test.go: TestARunReadsOneSnapshotCommitsAndPushes
src/q/qtest/module_test.go: TestAFakeModuleRunningNowhereReadsNotProvided
src/modules/index/module_test.go: TestAnExpiredLeaseMarksTheFakeModulesPortStale
src/modules/index/module_test.go: TestWritingActionsOfAFakeModuleRunOneAtATime
src/modules/index/module_test.go: TestAReadAnswersWhileAFakeWriterRuns
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/qtest/module.go
src/q/qtest/module_test.go
src/modules/index/module_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened wiring.go for Start and Load, store.go for Commit, Run, OnCommit, Down and Stale, action.go, ops.go for Next, call.go for Call, lease.go for NewDog, and qtest, and checked each claim there.
The approach changes no production function, so the callers list names the functions the new cases drive.
Each done_when line names its case in the tests list, and go test and the check decide the first and the last.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
