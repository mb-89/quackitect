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
group: unfaked-doors-take-fakes
parent: quack-spawns-meet-fake-process
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 4589742b8a0025b168e11145f5c8b14f9e824322
    hash_after: 4589742b8a0025b168e11145f5c8b14f9e824322
    inputs:
      - name: ask
        hash: 5639100f0502124e
        size: 578
    def: 7883b3d10633c780
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The quack wait cases read a helper's report off a fake clock, so a loaded box leaves them green and they cost the battery no real wait.

<!-- breaks, as text: what breaks if it is never done -->
`src/quack/waits_test.go` polls `served.Of` on the wall clock through `time.Sleep`, so a loaded box turns its cases red, and the real-wait guard holds it under a row of its own.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/quack/waits_test.go` calls no `time.Sleep`, and its row leaves the family table in `spec/design_output/doors.md`, which `TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit` in `src/imports/clock_test.go` decides
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

`ended` in `src/quack/waits_test.go` polls `served.Of` on the wall clock. The manager writes each op through `Outside.Rows`, and an op that ends lands there as its JSON. So the case waits on that write, as rule 8 of the testing guidance asks.

- `waitWorldOf` hands the manager a `savedTable` in place of `opRows{heldTable{}}`: a `heldTable` behind a mutex, whose `Save` also sends the body on a buffered channel the world holds. The mutex holds because the manager saves off its own goroutines, which the plain map never guarded.
- `ended(action)` reads that channel until a body decodes to an op of the action with `Ended` set, and answers it. It reads the saved op itself, not `Of`, so the order of the save and the book write cannot race it.
- A case whose op never ends blocks until the test binary times out, which names the case. The span `endsWithin` stays as the call wait alone.
- The row for `waits_test.go` leaves the family table in `spec/design_output/doors.md`.

The cost: a wait that never ends costs the battery its whole timeout, where the poll gave up after `endsWithin`. I take it, because a fail there is a bug in the wait, and the timeout names the case.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/waits_test.go waitWorldOf
- src/quack/waits_test.go waitWorld.ended
- src/quack/waits_test.go TestAWaitReturnsOnAHelpersReport
- src/quack/waits_test.go TestAWaitPastTheCallWaitAnswersARunningHandle
- src/quack/waits_test.go TestTheDoorAnswersAWaitPastItsCallWaitAsRunning
- src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit, red once the row leaves doors.md while the sleep stands
- src/quack/waits_test.go TestAWaitPastTheCallWaitAnswersARunningHandle, which reads the end through the saved op
- done_when 1: TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit
- done_when 2: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/waits_test.go
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened waits_test.go, manager.go Served and Outside, ops.go rowsKeep, heldTable and opRows
- The callers list names every case reaching waitWorldOf and ended, and the guard reading the table
- Each done_when line names its test

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
