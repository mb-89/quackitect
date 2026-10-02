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
group: module-processes-switch-over
record:
  - step: design/draft
    hand: box b1311a2beaed · claude-code-remote
    hash_before: 84aae9b9453f7ecf36ffd5b5b0ad2c15bdb58a2a
    hash_after: 84aae9b9453f7ecf36ffd5b5b0ad2c15bdb58a2a
    inputs:
      - name: ask
        hash: 227259d439bc87b6
        size: 238
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box b1311a2beaed · claude-code-remote
    hash_before: 30d3a868463fc39088918795e0b0f94e0c0b667d
    hash_after: 30d3a868463fc39088918795e0b0f94e0c0b667d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: b0d415a0971c4dff
        size: 3778
    def: 08e16d07b0de477c
---

# Ask

`migration/config/slices/processes` moves to `new`, and the one process gives way to the split.

The model's isolation then holds on every box.

- a case kills one module process, and the others keep answering
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

The processes slice moves to `new` alone: the built-in mode in `src/modules/migration/migration.go` and the tracked `spec/config/level0.json` read `new`, and the enum holds `new` alone, as every switched slice before it does. Then the shadow path leaves the tree.

| the part | the change |
|---|---|
| `src/quack/io.go` | `ioShadow` becomes `ioProcesses`, which runs under every mode. It spawns `quack io` with each IO instance's own writer, and one process a placement. No `Heard` stands, so `index.Placed.heard` lands each commit in the store and clears the down mark. The weigh, `shadows`, `sends`, `sameContent` and the `shadowsOwnLog` quiet name leave. The first spawn waits no start window, since the IO values reach the store through the IO process alone now |
| `src/quack/main.go` | `wired` hands `index.Main` no IO start, since `quack io` runs them. `loaded` answers the writers alone. `healthOf` reads the index lease under every mode |
| `src/index/ops.go`, `src/index/door.go` | `Managed` carries `Away`, the instances a process of their own runs. The door calls `Scheduler.Except` with them once the manager starts, so no wave in the index runs a provider a placement runs |
| `src/q/scheduler.go` | `Except(instances...)` beside `Only`, and `runsHere` refuses an instance it names |
| `src/index/procs.go` | the `Heard` seam and `Placements.Quiet` leave, with the old path |
| `src/modules/hooks/cage.go` | a lease past its term writes a row of kind `watchdog`, per the model's watcher of the watchdog, in place of the `shadow` row. The call passes on |

What I weigh, and what I assume:

- The cage refusing on a stale lease, as the model's watcher chapter reads, stays out. The hooks door runs in the index process, and the session log on this box shows the lease past its term during a busy sync with the index answering. A refusal there locks the agent out of every tool. The row keeps the alarm, and the call passes.
- Actions keep running in the index, since `act.<name>` stands unbuilt on the bus, and the module code links into the one binary. The split moves the providers and the IO starts, which the shadow weighed.
- The alarm stands already: each exit hands the dog a fault, and a run of faults in the window writes `session/alarms`, which `TestASilentModuleProcessRestartsAndRaisesAnAlarm` holds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: manages, calls ioShadow, renamed ioProcesses
- src/quack/main.go: main, calls wired and index.Main with the IO starts
- src/quack/main.go: wired, calls loaded
- src/quack/main.go: listensHooks, calls healthOf
- src/quack/placements.go: moduleMain, calls loaded
- src/index/door.go: opensOn, reads Managed and builds the scheduler
- src/index/procs.go: Placed.heard and Placed.down, read Heard
- src/index/procs.go: Placements.runs, reads quiet
- src/modules/hooks/hooks.go: Door.handle, calls readsHealth
- src/modules/migration/migration.go: Registers, declares the processes slice
- spec/config/level0.json: migration.processes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/procs_test.go: TestAKilledPlacedProcessLeavesTheOthersAnswering
- src/q/scheduler_test.go: TestAWaveRunsNoProviderOfAnInstanceExcepted
- src/quack/io_test.go: TestTheProcessesLandWhatQuackIOCommits
- src/modules/hooks/cage_test.go: the lease case reads a watchdog row
- src/modules/migration/migration_test.go: the processes slice reads new alone

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened io.go, placements.go, main.go, procs.go, door.go, ops.go, scheduler.go, store.go, cage.go and migration.go, and checked each claim above there
- the callers come off a grep for ioShadow, healthOf, loaded, wired, Heard, Quiet, readsHealth and the processes key
- the kill case decides the first done_when line, and ./RUNME.sh check decides the second

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/migration/migration_test.go
- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The slice test and the lease row test fail on their assertions. The kill case in src/index/procs_test.go passes already: the index's placements land each process's commits apart, and an exit marks the dead process's names alone. The switch puts that runner on the live path, so the case holds the done line from here on. The scheduler's Except test and the io test land with the change, since each calls a function the change adds.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the kill case decides the first done line, and ./RUNME.sh check the second
- the bus and the spawned fake process stand in for every door the kill case reaches, and the hooks door's Health and Shadow seams take fakes

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
