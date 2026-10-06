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
step: design/tests-red
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
