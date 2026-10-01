---
kind: [[ticket]]
state: open
step: gate
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
group: module-processes-land-in-shadow
record:
  - step: design/draft
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: b434f51a588b1b5807a1d111f421a7b185b2f28b
    hash_after: b434f51a588b1b5807a1d111f421a7b185b2f28b
    inputs:
      - name: ask
        hash: a166f2553415d2a5
        size: 402
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 03ba8e0fb2d4 · claude-code-remote
    hash_before: b4593c297636a62e8a4241a7b99830a45646267a
    hash_after: b4593c297636a62e8a4241a7b99830a45646267a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: ae24a1e131bd583f
        size: 4169
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
      - name: [[spec/tickets/watchdogs-span-the-processes]]
        hash: b10dd6eac949de7c
        size: 309
      - name: [[spec/tickets/hooks-listener-joins-io-process]]
        hash: 5a754c5b9e92ffff
        size: 167
    def: 08e16d07b0de477c
---

# Ask

`quack io` runs the IO modules holding a listener in one process of their own, per [[spec/design_output/model#the-io-process]]. The index reaches them over the inner protocol.

The operating system then holds the boundary.

- `go test ./...` from the root passes
- a case kills the fake IO process, and reads its names at their built-in values, with the mark `not provided`
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

`quack io` runs in shadow beside the index, per [[spec/design_output/model#the-io-process]] and [[spec/design_output/model#the-inner-protocol]].

1. The bus. `src/index/bus.go` runs `nats-server/v2` inside the index on `127.0.0.1`, on a port the system picks, with a token off `crypto/rand`, no JetStream and no disk. `Standing` in `src/index/door.go` gains `bus` and `token`, which `stands` writes. A peer dials it with `nats.go`.
2. A placed process. `src/index/procs.go` adds `Placed`: a name, the command, and the instances it runs. `Placed.Start` answers an `index.Start`. It spawns the command with the bus and the token in its environment, and commits each `commit.<instance>` message through the start's `Commit`. On the child's exit it marks each instance down through `Store.Down`, and the next commit clears the mark through a new `Store.Up`. The restart waits on the dog, and [[spec/tickets/watchdogs-span-the-processes]] carries the leases and alarms across.
3. `quack io`. `src/quack/io.go` dials the bus off the environment, runs the start of each IO instance placed in the IO process, and publishes each commit on `commit.<instance>`. Its work loop beats `lease.io`.
4. The shadow. `migration/config/slices/processes` takes `old`, `shadow` or `new`, built-in `old`, and the tracked file sets `shadow`. Under `shadow` the index keeps every start in its own process, and spawns `quack io` over the IO instances holding no port: watch, clock, env and git. The index lands none of the shadow's commits. It weighs each name the shadow commits against the value the store holds once a settle span passes, and a value apart writes a `shadow` row naming the slice, the name, the old and the new. Under `new`, the switch ticket places those instances in the IO process alone.
5. The listeners of hooks, mcp and lsp stay in the index under `shadow`, the interim [[spec/tickets/hooks-listener-joins-io-process]] names, since two processes hold no one port. The switch moves them.

The assumption: the shadow weighs commits and no requests, since the IO modules' requests write the disk, and a second answer to a write writes twice.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/door.go stands, which writes Standing
- src/index/main.go standingOf and stands, which read Standing
- src/index/door.go starts, which runs each Start, a placed one among them
- src/quack/main.go main, whose dispatch gains io
- src/quack/main.go manages and wired, which hand the index its starts and spawn the shadow
- src/q/store.go Down, Snapshot.Read and Snapshot.NotProvided, beside the new Up
- src/q/why.go Why, which reads NotProvided
- src/modules/migration/migration.go Registers, whose slices gain processes
- spec/config/level0.json and spec/config/level0.schema.json, which quack schema --write regenerates
- src/quack/testdata/readers.schema.json, readers.tracked.json and readers.golden.json

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/bus_test.go TestTheBusAnswersALoopbackPeerShowingItsToken
- src/index/bus_test.go TestTheBusRefusesAPeerWithoutTheToken
- src/index/door_test.go TestTheStandingFileNamesTheBusAndItsToken
- src/index/procs_test.go TestAKilledFakeIOProcessLeavesItsNamesNotProvided
- src/index/procs_test.go TestTheNextCommitOfARestartedProcessClearsTheMark
- src/q/start_test.go TestAnInstanceUpAgainReadsItsValue
- src/quack/io_test.go TestQuackIOCommitsItsInstancesOverTheBus
- src/quack/io_test.go TestAShadowValueApartWritesAShadowRow
- src/modules/migration/migration_test.go TestTheProcessesSliceTakesThreeModes

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened, and each claim checked there: door.go stands and Standing, store.go Down and NotProvided, why.go, main.go manages, wired and loaded, migration.go, level0.json, and the go proxy answering nats-server v2.15
- the callers list names every caller of what the approach changes, off a grep of Standing, standingPath, .Down(, manages(, wired() and migration.Registers
- every done_when line names the test that decides it: the kill line TestAKilledFakeIOProcessLeavesItsNamesNotProvided, the go test line go test ./..., and the check line ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/bus_test.go
- src/index/procs_test.go
- src/index/standing_test.go
- src/q/start_test.go
- src/quack/io_test.go
- src/modules/migration/migration_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion over stubs that compile: the bus names no address, the fake IO process never commits, the standing file names no bus, Up leaves the down mark, quack io reaches no bus, the shadow writes no row, and the slices hold no processes key. The standing case stands in src/index/standing_test.go, apart from door_test.go, since it drives ServeManaged with a manager of its own. The pins surprise: nats.go at its newest asks Go 1.26, so the tree takes nats-server v2.11.9 with nats.go v1.45.0, which keep the go line at 1.24.2.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test that fails: the kill line meets TestAKilledFakeIOProcessLeavesItsNamesNotProvided, and go test ./... and ./RUNME.sh check run at implement
- every door the tests reach has a fake: the fake IO process is the test binary run again with the bus in its environment, and the bus runs in memory on loopback

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
