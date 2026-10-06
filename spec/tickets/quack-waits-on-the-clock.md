---
kind: [[ticket]]
state: closed
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
    hash_before: 92f5d70303b17323f7de99d98934b7a670834750
    hash_after: 92f5d70303b17323f7de99d98934b7a670834750
    inputs:
      - name: ask
        hash: c1f5561bef3f8127
        size: 367
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: b10e5c67cd94cab42b1fc00ae125b099bd139441
    hash_after: b10e5c67cd94cab42b1fc00ae125b099bd139441
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: 3157324235f0a831
        size: 2043
    def: 08e16d07b0de477c
  - step: gate
    hand: box add8d8d0dd3d · claude-code-remote · helper-4
    hash_before: 89d23396010af88a630868e58ea764160d31b699
    hash_after: c2afd406327fd790a03cb128d8d4ae4b494b0387
    inputs:
      - name: design/draft
        hash: 3157324235f0a831
        size: 2043
      - name: design/tests-red
        hash: e4908af626725415
        size: 613
    def: dc4904ab364efa10
  - step: implement/change
    hand: box add8d8d0dd3d · claude-code-remote · helper-5
    hash_before: f4ca758df8f19055363a022bca1899cd86df58ab
    hash_after: 99e76dd9791f01658afea857f61c88fb3e5b02df
    answered:
      - name: lint
        exit: 0
        said: The check names no red case and no finding at error.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box add8d8d0dd3d · claude-code-remote · helper-6
    hash_before: 9417e13c5890f308da9d6c73a13d336f7d5df160
    hash_after: 62179af79ff2e6ec969aa571525872e4491faf65
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    3.0  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: design/tests-red
        hash: e4908af626725415
        size: 613
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
depends_on: [go-waits-on-events]
reason: done
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

./RUNME.sh test src/owns

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/owns/quack_clock_tree_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case names each read of the time and each wait in a production file of the root, matching what `./RUNME.sh doors` lists there for the clock. The `box_doors_test.go` case on a stamped time follows once `q.Clock` lands from `go-waits-on-events`, which this ticket now names under depends_on.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the case names its claim and asserts it per walk-around, naming the file, line and name
the case reads the tree and writes nothing
the case goes red on each read the change moves onto the hand, as the run shows

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check --errors

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/quack files the doors verb lists for the clock, and io_test.go for the one signature that takes the clock
the clock door has its fake in src/q/qtest/clock.go, and the watchdog case in src/quack/io_test.go runs on it
io.go names spec/tickets/quack-waits-on-the-clock beside watchesIndex, the one function that now takes the clock
the clock stands once as wall in src/quack/main.go, and every door points at it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/owns/quack_clock_tree_test.go src/quack/box_doors_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The box doors carry the clock the root builds. boxDoors.now becomes clock q.Clock: realBoxDoors takes wall from src/quack/main.go, and the fake box doors in src/quack/box_doors_test.go take qtest.NewFake. The editor link and the retro collect read clock.Now off the box. TestABoxVerbStampsTheTimeTheFakeClockStandsAt in src/quack/box_doors_test.go runs the editor link over a fake clock and holds the installed timestamp to the time the fake stands at. It goes red on its own assertion while the verb still reads the old field, and green once the verb reads the clock. TestNoRootFileReadsTheClockPastItsHand in src/owns passes, so src/owns/quack_clock_tree_test.go leaves the red list.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/quack/boxdoors.go, box_doors_test.go, editorlink.go and retro_collect.go, each named under size or callers
the clock door has its fake in src/q/qtest/clock.go, and the fake box doors hand it
the new case names spec/tickets/quack-waits-on-the-clock beside it, the approach it implements
the clock stands once as wall in src/quack/main.go, and realBoxDoors points at it

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
