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
step: implement/change
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [ops-keeps-one-state, stale-names-keep-their-value]
record:
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 18daf684614f8684798996e413e5830344dbe0d0
    hash_after: 18daf684614f8684798996e413e5830344dbe0d0
    inputs:
      - name: ask
        hash: 93d7bf73eb9595f4
        size: 820
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 80c530f574bd8827ddd20430f2b78482ea691f72
    hash_after: 80c530f574bd8827ddd20430f2b78482ea691f72
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/index fails
    inputs:
      - name: design/draft
        hash: 78d6bc5b0523f970
        size: 6491
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-3
    hash_before: 327648a9b5bbb64cf75b255f47fb43cbd13b5ea8
    hash_after: 327648a9b5bbb64cf75b255f47fb43cbd13b5ea8
    inputs:
      - name: design/draft
        hash: 78d6bc5b0523f970
        size: 6491
      - name: design/tests-red
        hash: 9f2faac845a5d98a
        size: 915
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: ae753b989467f921b161f70113d8fe27c7530a97
    hash_after: ae753b989467f921b161f70113d8fe27c7530a97
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: gate
    hand: the engine
    stale: design/draft
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: df255b1e46b5da7b48d92bc85c942a978e81be86
    hash_after: 66a14de0fe9634cf887b8ed4764176b23cf51a01
    returns: 1
    why: the rename verb rewrote the moved paths in design/draft, so the pull marks tests-red stale after implement/change passes. The red cases stand green under that build, so this step writes no failing test. The note rename-stales-a-ticket-draft carries it to the retro.
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/index passes; green, src/quack passes
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 98a6123c484b47eb70a8bd40ce7f12af93cf76e8
    hash_after: 98a6123c484b47eb70a8bd40ce7f12af93cf76e8
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/index fails
    inputs:
      - name: design/draft
        hash: f25b09877886653d
        size: 6541
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-9
    hash_before: cbde4b69ab772d2d1ded17baa221eb1f3f973414
    hash_after: cbde4b69ab772d2d1ded17baa221eb1f3f973414
    inputs:
      - name: design/draft
        hash: f25b09877886653d
        size: 6541
      - name: design/tests-red
        hash: 19d6902ff3d8808d
        size: 803
    def: dc4904ab364efa10
---

# Ask

The index's own management moves into one module file with `q.IO()`, in the package `src/modules/index`. The index always loads it, per [[spec/design_output/model#the-index-manager]]. It holds the operations, the leases and the alarms, and writes `index/`, `ops/<id>` and `session/alarms` as registered outputs.

The core then holds no logic of its own. The manager tests like every IO module, over `qtest` and the fakes of its outside.

- `go test ./...` from the root passes
- `src/ops` and `src/watchdog` fold into the package `src/modules/index` beside the manager's file, which `go list ./src/modules/index/...` shows
- a case starts the index with no other module, and reads the manager loaded
- a case reads the manager as the writer of `ops/<id>`, `session/alarms` and `index/health`
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

One, src/ops and src/watchdog move into package index under src/modules/index as ops.go, call.go and lease.go, with their tests.
Two, colliding names take prefixes: NewBook, BookSettings, NewDog, DogSettings. Each SettingsOf turns unexported.
Three, manager.go holds Registers. It calls q.GivenIn for ops/<id>, session/alarms and index/health by full name, one carrying q.IO().
Four, manager.go holds Start over an Outside: the root, the store, its writer, the op rows, a step hook, a now and an every.
Five, Start opens the book over the rows, commits each move under ops/<id>, and fails every operation in flight.
Six, Start builds the dog and holds the lease index at watchdog.lease.
Seven, each loop step renews that lease and commits index/health as part, renewed and term.
Eight, a tick at watchdog.beat runs Check, Expire and Sweep, and drops each swept ops/<id> from the store.
Nine, ops.go gains rowsKeep, which turns raw JSON rows into the Keep the book reads.
Ten, src/index keeps the work loop and the op table, and imports neither ops nor watchdog.
Eleven, the op table answers id and body bytes, so neither side names the other's types.
Twelve, the door takes a Manage start and hands it the store, the op rows and a step hook.
Thirteen, sweeps calls each step hand where it beats today. beats drops Check, and guards drops sweepsOps.
Fourteen, Serve keeps its signature and runs no manager. ServeManaged and Main take one.
Fifteen, src/quack registers the manager into q.Main before the wiring loads.
Sixteen, src/quack hands index.Main an adapter over manager.Start, with or without a wiring file.
Weighed: src/index importing src/modules/index directly. nomodule and TestTheIndexImportsNoModule refuse it.
Weighed also: an index instance in spec/wiring.yaml. A tree with no wiring file never loads it.
Assumed: index/ means index/health alone in this ticket.
Assumed: the manager reads its keys through src/config, which its q.IO() flag lets past onlyq.
Assumed: manager cases run over q.NewStore as clock does, since qtest hides its store. This departs from the ask's qtest line.
Assumed: the tick calls Expire, the deadline watch nothing calls today.
Assumed: this change lands after tickets-becomes-a-module, which edits topic.go, main.go and their tests too, and takes its topic.go as the base.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/door.go: door struct, drops dog and book, gains the step hands
src/index/door.go: Serve, wraps ServeManaged with no manager
src/index/door.go: opens, takes a Manage, drops watchdog.Registers, New, Hold, the lease span and opensBook, and calls the manage after the database opens
src/index/door.go: sweeps, calls each step hand in place of dog.Beat
src/index/door.go: guards, drops sweepsOps
src/index/beats.go: beats, drops dog.Check. leasePart and builtInLease leave for the manager
src/index/ops.go: opKeep, becomes the raw op table. opensBook, hears and sweepsOps leave
src/index/topic.go: registersTopics and writers, drop ops.Registers and the ops writer
src/index/main.go: Main and serves, take the Manage and pass it to ServeManaged
src/quack/main.go: main, registers the manager into q.Main and hands index.Main the adapter
src/quack/main.go: manages, new adapter from index.Manage to manager.Start
src/modules/index/ops.go: New, Settings, SettingsOf renamed. Registers leaves for manager.go. rowsKeep added
src/modules/index/lease.go: New, Settings, SettingsOf renamed. Registers leaves for manager.go. Lease gains json tags
src/modules/index/call.go: Call, Wait, WaitCaller, package clause alone
src/index/core_test.go: TestTheCoreWritesNoInputName, drops watchdog.Registers
src/index/contract_test.go: inProcess, drops watchdog.Registers
src/index/ops_test.go: TestTheOpRowsOutliveTheDoor and TestADroppedOpLeavesTheTable, read raw bodies. TestAnOperationPastItsWindowLeavesTheStore moves to the manager. TestASweepWithNoBookDropsNothing leaves
src/index/door_test.go: TestTheIndexLeaseRenewsOffItsWorkLoop, reads a step hand fire off the loop in place of dog.Lease
src/index/beats_test.go: TestABeatAtZeroTakesTheBuiltInSpan, keeps the beat half, and the lease half moves to the manager
src/index/topic_test.go: TestTheTopicsCommitThroughTheirOwnWriters, drops the as.ops half
src/modules/index/ops_test.go: bookOf and TestRegistersHandsTheWriterOfItsFamily, take the new names and the manager's Registers
src/modules/index/lease_test.go: dogOf, takes the new names, and one clock helper serves both test files
src/modules/index/call_test.go: TestTheConfigHoldsOneActionDeadline, reads config at ../../..

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/quack/main_test.go: TestTheManagerFoldsOpsAndTheWatchdog
src/quack/main_test.go: TestTheIndexLoadsTheManagerWithNoOtherModule
src/modules/index/manager_test.go: TestTheManagerWritesItsNames
src/modules/index/manager_test.go: TestAStartFailsTheOpsInFlightUnderOpsId
src/modules/index/manager_test.go: TestEachStepRenewsIndexHealth
src/modules/index/manager_test.go: TestAnOperationPastItsWindowLeavesTheStore
src/modules/index/manager_test.go: TestALeaseAtZeroTakesTheBuiltInTerm
src/index/door_test.go: TestTheIndexLeaseRenewsOffItsWorkLoop
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/index/ops.go
src/modules/index/call.go
src/modules/index/ops_test.go
src/modules/index/call_test.go
src/modules/index/lease.go
src/modules/index/lease_test.go
src/modules/index/manager.go
src/modules/index/manager_test.go
src/modules/index/ops.go
src/modules/index/call.go
src/modules/index/ops_test.go
src/modules/index/call_test.go
src/modules/index/lease.go
src/modules/index/lease_test.go
src/index/door.go
src/index/beats.go
src/index/beats_test.go
src/index/ops.go
src/index/ops_test.go
src/index/topic.go
src/index/topic_test.go
src/index/core_test.go
src/index/contract_test.go
src/index/door_test.go
src/index/main.go
src/quack/main.go
src/quack/main_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened ops.go, call.go, lease.go, door.go, beats.go, ops.go, topic.go and main.go under src/index, src/quack/main.go, the clock, files and tickets modules, qtest, q.GivenIn, Why, Stale and Load, and imports.go with its tests, and checked each claim there
grepped every importer of quackitect/src/ops and quackitect/src/watchdog, every use of book, dog and leasePart, and every caller of Serve, opens and Main, and the callers list names each
each done_when line names its case: go test, TestTheManagerFoldsOpsAndTheWatchdog, TestTheIndexLoadsTheManagerWithNoOtherModule, TestTheManagerWritesItsNames, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/index/manager_test.go src/q/qtest/qtest_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/index/manager_test.go
src/q/qtest/qtest_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The rename verb moved the draft hash, so this step runs again after the build. The earlier red cases stand green under that build. One ask line stands unmet: the manager tests over qtest like every IO module. TestTheManagerRunsOverTheFakeIndex and TestTheFakeHandsAnIOModuleItsStore fail on their own assertion, because qtest hands an IO module no store yet. Its stub Store answers nil.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a case: the green cases decide the fold, the load and the writers, and the new red cases decide the ask line on qtest
the cases run over the fake index and an op table in memory, and reach no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- draft-names-the-qtest-store: the draft still assumes the manager cases run over q.NewStore and departs from the qtest line, and its size omits src/q/qtest/qtest.go and qtest_test.go, which the new red cases make the build touch: Index.Store answers one.store
- qtest-shares-a-red-package: src/q/qtest holds the red wave_test.go of one-wave-settles-a-change beside this ticket's qtest_test.go, so go test ./... and the check wait on that ticket, which depends_on leaves out

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/index src/modules/index src/quack/main.go src/quack/manager_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft names, and the rename verb rewrote the old src/ops and src/watchdog paths in three ticket files, as it rewrites every reach of a moved name
the manager cases run over q.NewStore with an op table in memory and a work loop stepped by hand, and the root cases run the built binary and an op table in memory
each file under src/modules/index points at the index manager chapter of the model
spanOf stands in src/index/beats.go and src/modules/index/manager.go, since neither package may import the other, and the retro weighs a shared home

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
