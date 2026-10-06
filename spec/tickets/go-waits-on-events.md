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
group: doors-declare-what-they-own
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 6b0799eedfea0d016277c90cfc8fabc7b48fd987
    hash_after: 6b0799eedfea0d016277c90cfc8fabc7b48fd987
    inputs:
      - name: ask
        hash: f04f51723a777a9d
        size: 516
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: ccf2c0092b55f8d1dc37170ac044ba160e480968
    hash_after: ccf2c0092b55f8d1dc37170ac044ba160e480968
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/clock fails
    inputs:
      - name: design/draft
        hash: 28302b6e72396e22
        size: 2965
    def: 08e16d07b0de477c
  - step: gate
    hand: box add8d8d0dd3d · claude-code-remote · helper-4
    hash_before: 5d5c4687d2eb621a8a68b9d4c55b962d254a915f
    hash_after: 5d5c4687d2eb621a8a68b9d4c55b962d254a915f
    inputs:
      - name: design/draft
        hash: 28302b6e72396e22
        size: 2965
      - name: design/tests-red
        hash: 7a20935396b81582
        size: 787
    def: dc4904ab364efa10
  - step: implement/change
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: a4ea5fef73dcd9e9db384ba4ce9f3d7c0b285f83
    hash_after: e81b4a1544959a1c09ebd5e8033a8305c7aab4ae
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
---

# Ask

Go code outside `src/quack` waits on the event a duration stands for, or reads the time through the clock door, so its tests replay on a fake clock and run as fast as the work.

A sleep or a deadline outside the clock makes a test wait on the wall and flake on a slow box, and the guard never refuses time while these stand.

- `./RUNME.sh doors` lists no walk-around of `time` or `context` in a Go file outside `src/quack` that is no test
- `./RUNME.sh test` passes over every package the change touches

none

none

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

The `Clock` interface moves from `src/modules/clock` into the core as `q.Clock`, since a module, a door, the index and a renderer import no other module. It names the time types alone, which no door owns whole, so the core stays pure.

`q.Clock` grows the members the callers reach for:

| member | answers | the fake |
|---|---|---|
| `Now` | the time now | the time it stands at |
| `Every` | a hand on each span | fires on `Tick` |
| `After` | a channel closing past a span | closes on `Tick` past the span |
| `AfterFunc` | a hand run once past a span, and its stop | runs on `Tick` past the span |
| `WithTimeout` | a context ending past a span | ends on `Tick` past the span |

The real clock in `src/modules/clock` stays the one file calling `time`. One contract suite runs every member against the real clock and the fake.

Each caller takes a `q.Clock` as an argument or a field, and the root `src/quack` hands it `clock.New()`. A test hands it `clock.NewFake`, and moves it with `Tick`. A poll waiting on a thing that fires an event takes the event in place of the clock: a process exit, a watcher event, a ready signal. A `time.Sleep` between two tries becomes `<-clock.After(span)`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/engine/swap/swap.go Watches
src/index/beats.go beats
src/index/door.go awaits
src/index/door.go claims
src/index/door.go guards
src/index/door.go starts
src/index/door.go sweeps
src/index/main.go displaced
src/index/procs.go Settle
src/index/procs.go runs
src/index/procs.go spawns
src/index/stop.go stopsAfter
src/modules/hooks/hooks.go now
src/modules/index/call.go Wait
src/modules/index/call.go WaitCaller
src/modules/lsp/door.go runsIn
src/modules/lsp/lsp.go serves
src/modules/lsp/runs.go schedule
src/tui/frame/door.go TellPort
src/quack/modules.go and src/quack/main.go: the root that builds the clock and hands it on
every caller of the functions above that gains a clock argument, which the build names

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/clock/clock_contract_test.go: After, AfterFunc and WithTimeout against the real clock and the fake
src/modules/clock/clock_test.go TestTheFakeFiresAfterOnTick
src/modules/clock/clock_test.go TestTheFakeEndsAContextOnTick
src/modules/clock/clock_test.go TestAStoppedAfterFuncNeverRuns
src/q/clock_test.go TestTheRealClockAndTheFakeAreAQClock

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/clock.go
src/q/clock_test.go
src/modules/clock/clock.go
src/modules/clock/clock_test.go
src/modules/clock/clock_contract_test.go
every file the callers list names
the tests of those files, which hand in the fake

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened `src/modules/clock/clock.go`, `src/imports/imports.go` seesModules, `src/index/main.go` and `src/engine/swap/swap.go`, and each claim stands there
the callers list comes off every walk-around `./RUNME.sh doors` names outside `src/quack`, one function a line
the first done_when line falls to `./RUNME.sh doors`, the second to `./RUNME.sh test` over each package the callers list names

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/clock

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/clock/clock_test.go
src/modules/clock/clock_contract_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The build stops on `q.Clock` undefined, and the contract build on `After` missing from `Clock`. Those are the two pieces the change adds. The case that the real clock and the fake stand as a `q.Clock` sits in the clock's own test, not under `src/q`, because a core test imports no module.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each case names its claim and asserts it: After fires once its span passes and not before, the context ends on its deadline, a stopped hand never runs, and both clocks stand as `q.Clock`
each case builds its own fake, and the shared start time is a value nobody writes
each case goes red for the reason the change answers, as the build shows

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- tests-reach-the-fake-clock: the draft hands each caller's test clock.NewFake, but noModule in src/imports/imports.go refuses src/index, src/modules/lsp, src/modules/hooks, src/modules/index and src/tui/frame, their _test packages among them since ownModule trims _test, an import of src/modules/clock; the fake moves where those tests reach it, q/qtest beside its contract suite, and size names those files
- watchertest-waits-through-clock: src/watcher/watchertest/watchertest.go:58 time.After is a walk-around in a Go file that is no test, and the callers list leaves it out, so the first done_when line stays unmet without it
- clock-test-asserts-q-clock: tests-red seen says the build stops on q.Clock undefined, yet the tests compile and fail on the waiterOf assertion, and TestTheRealClockAndTheFakeAreAQClock stands nowhere; once q.Clock lands, a test asserts New() and NewFake both stand as a q.Clock

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the clock module, the core, `q/qtest`, and each caller the draft names, plus the root that wires them and the tests that build them, every one inside the ask
the clock door reaches the change, and its one fake now stands in `q/qtest`, where a package that imports no module reaches it, with `qtest.Wall()` held to the same contract suite
the header of `src/q/clock.go` points at the doors note section on time as a door
`q.Clock` stands once, in the core, and the clock module and `q/qtest` implement it

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
