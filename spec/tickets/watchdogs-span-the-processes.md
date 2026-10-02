---
kind: [[ticket]]
state: open
step: implement/change
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
depends_on: ["the-doors-process-stands"]
record:
  - step: design/draft
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: 3fca2c158438e7e5f603ad59418d8eba9b8d6252
    hash_after: 3fca2c158438e7e5f603ad59418d8eba9b8d6252
    inputs:
      - name: ask
        hash: b10dd6eac949de7c
        size: 309
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: 9aa7ff8319402acc965a1d048444dac376bdc042
    hash_after: 9aa7ff8319402acc965a1d048444dac376bdc042
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: e6c71b34bd87d89d
        size: 3899
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/tests-red
    hand: box 36586c1b4c37 · claude-code-remote
    hash_before: 0f32b1143ab049a8d159d031f879e5adff5ea9e7
    hash_after: 0f32b1143ab049a8d159d031f879e5adff5ea9e7
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: e6c71b34bd87d89d
        size: 3899
      - name: [[spec/design_output/model]]
        hash: a4432019dfba878d
        size: 74940
    def: 08e16d07b0de477c
  - step: gate
    hand: box 18c40653fe79 · claude-code-remote
    hash_before: 0ea42a8c56c6eb15f9c25a5acb637a3d5ea3aee0
    hash_after: 0ea42a8c56c6eb15f9c25a5acb637a3d5ea3aee0
    inputs:
      - name: design/draft
        hash: e6c71b34bd87d89d
        size: 3899
      - name: design/tests-red
        hash: 29fb6b88d0e8db57
        size: 1091
      - name: [[spec/design_output/model]]
        hash: a4432019dfba878d
        size: 74940
    def: dc4904ab364efa10
---

# Ask

The leases and the alarms reach across the processes, and the IO process and the hook module watch the index's lease, `index/health`.

A silent process then reads as silent.

- `go test ./...` from the root passes
- a case silences each process in turn, and reads `session/alarms`
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

The leases reach across the bus the doors process builds, per [[spec/design_output/model#the-watcher-of-the-watchdog]]. Under the `processes` slice's `shadow`, a silent process restarts and raises its alarm, and the old path keeps answering.

1. The index hears each beat. `src/index/bus.go` gives `Peer` the method `Leases(hand)`, which subscribes `lease.>` and hands each part its beat.
2. One dog holds every lease. `manager.Served` hands out the manager's `Dog`, and `manages` in `src/quack/main.go` passes it to `ioShadow` and the placements. Each placed process holds a lease under its name, at the term `config/watchdog/lease` sets, and each beat renews it.
3. A silent process restarts. `Dog` gains `Expired(hand)`, which the manager's tick calls for each part its `Check` finds expired. `Placed` kills a process whose lease expires, and its exit path restarts it. The wait before a restart comes off `Dog.Fault`, so a run of faults raises the alarm in `session/alarms` and stops the restarts.
4. The module process beats. `runsModule` beats `lease.<process>` as a step of its run loop, per the placements ticket. The IO process keeps its beat on `lease.io`.
5. The index beats too. `renews` in the manager publishes `lease.index` beside its commit of `index/health`.
6. The IO process watches the index. `ioOver` subscribes `lease.index`, and a silence past the term writes a `watchdog` row to the session log. Under `shadow` it restarts nothing, since the index spawns it, and the switch ticket lands the restart.
7. The hook module reads the index's lease. `hooks.Outside` gains `Health`, which reads `index/health` off the store. Before a guarded call, a lease past its term writes a `shadow` row, since the port answers while the loop hangs, and the call passes as before.

The assumption: the IO process beats off a ticker beside its starts, since no one loop runs its modules. A hung start goes on beating, and the switch ticket moves the beat into each start's loop.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/bus.go Peer, which gains Leases
- src/index/procs.go Placed.Start, whose restart wait comes off the dog, and Placements.Start, which holds a lease for each process
- src/modules/index/lease.go Dog, which gains Expired
- src/modules/index/manager.go Serving and Served, which hand out the dog, renews, which publishes lease.index, and ticks, which calls the expired hands
- src/quack/main.go manages, which hands the dog to ioShadow and the placements, and listensHooks, which hands the hook module its Health
- src/quack/io.go ioShadow, which takes the dog, and ioOver, which watches lease.index
- src/quack/placements.go runsModule, which beats its lease off its run loop
- src/modules/hooks/hooks.go Outside, which gains Health, and the guarded call, which reads it

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/bus_test.go TestTheIndexHearsEachBeatOfALease
- src/index/procs_test.go TestASilentModuleProcessRestartsAndRaisesAnAlarm
- src/modules/index/lease_test.go TestAnExpiredLeaseCallsItsHand
- src/quack/io_test.go TestASilentIOProcessReadsInTheAlarms
- src/quack/io_test.go TestTheIOProcessWritesARowWhenTheIndexFallsSilent
- src/modules/hooks/cage_test.go TestAGuardedCallReadsAnIndexLeasePastItsTermAsDown

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened, and each claim checked there: bus.go Peer and Beat, procs.go Placed and Placements, lease.go Dog, manager.go Registers, begins, renews and ticks, main.go manages and listens, io.go ioShadow and ioOver, and the JS cage
- the callers list names every caller of what the approach changes, off a grep of Beat, Hold, Fault, Check, leaseVerb, HealthName and manages
- every done_when line names the test that decides it: the silence line meets the module, the IO and the index cases, each reading session/alarms or the session log, and go test and the check run at implement

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
- src/modules/index/lease_test.go
- src/quack/io_test.go
- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion over stubs that build. The bus refuses the lease subject, the dog calls no expired hand, the IO process writes no row, and the hook module writes no shadow row. The silent module case waits on the placements, since Placements.Start stands a stub until the placements ticket builds it, so its implement follows that ticket. The IO case runs the real dog of the index manager over a store, so it reads session/alarms itself, and the module case runs a fake dog over the wall clock.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test that fails: the silence line meets the module case, the IO case reading session/alarms, and the index case on both watchers, and go test and the check run at implement
- every door the tests reach has a fake: the processes are the test binary run again, the bus runs in memory on loopback, and the module case runs a fake dog

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- module-silence-reads-alarms: the silent module case counts faults on a fake dog. Run it over the manager's dog, and read session/alarms as the IO case does.

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

- module-silence-reads-alarms moves the silent module case to `src/quack/io_test.go`, since the index imports no module. The case reads `session/alarms` over the manager's dog, and the red list keeps it out of the check.
