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
    hash_before: 92f5d70303b17323f7de99d98934b7a670834750
    hash_after: 92f5d70303b17323f7de99d98934b7a670834750
    inputs:
      - name: ask
        hash: c1f5561bef3f8127
        size: 367
    def: 7883b3d10633c780
---

# Ask

The root `src/quack` reads the time and waits through the clock door, so a verb's timing replays in a test.

The root holds the most reads of the wall clock, and while they stand the guard never refuses time.

- `./RUNME.sh doors` lists no walk-around of `time` or `context` in a file under `src/quack` that is no test
- `./RUNME.sh test src/quack` passes

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

The root builds one clock and hands it on.

1. `main.go` builds `clock.New()` from `src/modules/clock` once, as the root that may import a module.
2. `boxDoors.now` becomes `clock q.Clock`, the interface `go-waits-on-events` puts in the core. The check, ticket and write hands take the same clock.
3. Every root file reading the time or waiting takes the clock off its hand: `Now` for a stamp, `After` for a wait, `WithTimeout` for a bounded context, `Every` for a beat. A wait on a thing that fires an event takes the event, as the index manager and a process exit do.
4. A test hands `clock.NewFake` and moves it with `Tick`.

This waits on `go-waits-on-events`, which lands `q.Clock` and its waits.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/main.go: builds the clock
src/quack/boxdoors.go realBoxDoors and boxDoors
src/quack/checkdoors.go, src/quack/ticket_doors.go, src/quack/writedoor.go: their hands
src/quack/io.go, branch.go, cli.go, command.go, commit.go, finds.go, placements.go, plans.go, retro_collect.go, review.go, vehicle_verb.go, verb_config.go, verb_lint.go, verb_log.go, verb_split.go, verbs.go, voice_verb.go: each function `./RUNME.sh doors` names there
every test building a hand, which takes the fake

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/owns/quack_clock_tree_test.go TestNoRootFileReadsTheClockPastItsHand: no production file under src/quack walks around the clock
src/quack/box_doors_test.go: a box verb stamps the time the fake stands at

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/quack/main.go
src/quack/boxdoors.go
src/quack/checkdoors.go
src/quack/ticket_doors.go
src/quack/writedoor.go
every root file the callers list names
src/owns/quack_clock_tree_test.go
src/quack/box_doors_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened `src/quack/boxdoors.go` boxDoors and the per-file walk-arounds of the clock under src/quack, and each claim stands there
the callers list names every root file the doors verb lists for the clock
the first done_when line falls to TestNoRootFileReadsTheClockPastItsHand and `./RUNME.sh doors`, the second to `./RUNME.sh test src/quack`

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
