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
group: tests-meet-the-doors-once
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: f0a74ef4413673673509f24766d1d82802fb6a22
    hash_after: f0a74ef4413673673509f24766d1d82802fb6a22
    inputs:
      - name: ask
        hash: 1daecf3515b870ee
        size: 848
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: 1dcd491ccd73ca39174d5f8e0f027896c98f0152
    hash_after: 1dcd491ccd73ca39174d5f8e0f027896c98f0152
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 38931247381717a6
        size: 3463
    def: 08e16d07b0de477c
  - step: gate
    hand: box b4c8cb96d125 · claude-code-remote · helper-4
    hash_before: a82a010ba9754ae3733df040c5060abddc8d3580
    hash_after: a82a010ba9754ae3733df040c5060abddc8d3580
    inputs:
      - name: design/draft
        hash: 38931247381717a6
        size: 3463
      - name: design/tests-red
        hash: 53d57e1376be6ada
        size: 1107
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Each door meets one test against the real thing, and every other test runs on that door's fake. A test then runs in memory, beside every other, and a slow box slows the door tests alone.

<!-- breaks, as text: what breaks if it is never done -->
Tests that spawn, sleep or reach git outside a door test wait on the box. A loaded box turns them red, as the lease case did, and each one costs the battery real seconds.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- an audit table in `spec/design_output/doors.md` names each door, its one door test and its contract suite
- each test the audit finds reaching a real door outside that list moves onto the door's fake, or names a child ticket
- each fixture the audit finds built per case where one build serves the file builds once
- each module the audit finds reaching the real index, or holding state it does not need, turns pure, or names a child ticket
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

The audit reads wall time, because a test reaching a real door pays real seconds. `go test -json ./src/...` times 1879 Go cases: 89 run past half a second and carry 113 of 192 seconds. `.se/scripts/doors-survey.sh` lists each test file by the doors it greps. The two lists together sort each slow file as a door test, a fixture built too often, or a move onto a fake.

1. A new chapter, The door tests, in `spec/design_output/doors.md` holds the table: each door, its fake, its contract suite, and its one door test. A row per moved or deferred family names its fate.

2. Three contained moves land here.
   - `src/imports`: the two planted trees build once a package run, through `sync.OnceValue`, and every case reads the shared folder. The planted trees are read-only to `analysistest.Run`.
   - `src/quack/manager_test.go`: `built` runs `go build` once a package run and copies the binary into the folder each case names. Three cases build the same binary today.
   - `src/index/procs.go`: `Placements` takes its waits from a timer a case can swap, by a `Timer` builder beside `After` and `Gap`. The stop joins the spawner before it answers. The two cases that watch a real second for no spawn wait on the fake timer's ask instead, and assert after the joined stop.

3. Each wider move becomes a child ticket in this group, with its ask:
   - the branch verbs' cases onto a fake git and a fake process runner, because `newTree` builds a bare origin and a clone a case
   - the quack verb cases still running a real process, onto the process door's fake
   - the `test/level0` JavaScript cases spawning a process outside a contract, onto `src/doors/fake/proc.js`

4. The module audit: the `onlyq` and `ioonly` analyzers already hold every module without the `io` flag off the disk, so each such module reads the index alone. The one module-held state the survey finds is `namePatterns` in `src/modules/check/private.go`, a memo of a pure compile, which the table names as the exception and keeps.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/imports/analyzers_test.go plantFlagged, every case in the file
- src/imports/imports_test.go plant, every case in the file
- src/quack/manager_test.go built, its three cases
- src/index/procs.go NewPlacements, spawns and Start
- src/quack/io.go ioProcesses, the one caller of NewPlacements outside tests
- src/index/placements_test.go TestAStopDuringTheSpawnsStartsNoFurtherProcess and TestAStopInsideTheStartWindowSpawnsNothing

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/placements_test.go TestAStopJoinsTheSpawnerBeforeItAnswers
- src/index/placements_test.go TestAStopDuringTheSpawnsStartsNoFurtherProcess, on the fake timer
- src/index/placements_test.go TestAStopInsideTheStartWindowSpawnsNothing, on the fake timer
- src/imports/imports_test.go TestThePlantedTreeBuildsOnce
- src/quack/manager_test.go TestTheQuackBinaryBuildsOnce

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/design_output/doors.md
- src/imports/analyzers_test.go
- src/imports/imports_test.go
- src/quack/manager_test.go
- src/index/procs.go
- src/index/placements_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each file and function named stands opened: plantFlagged, plant, built, NewPlacements, spawns, Start, the two watch cases, namePatterns, and the doors note
- callers come off a grep of NewPlacements, built, plant and plantFlagged
- each done_when line meets a test or the table: the table decides the first, the three moves and the child tickets the next three, and the check the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/index/placements_test.go src/imports/imports_test.go src/quack/manager_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/placements_test.go
- src/imports/imports_test.go
- src/quack/manager_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The four cases fail on their own assertion. The planted tree builds twice for two calls, and the quack binary takes two go builds for two folders. The spawner asks no wait of the timer the case names, because it still reads the real clock. The quack case alone costs four and a half seconds, two go builds. A surprise: plantFlagged writes its files into the tree plant answers, so the two fixtures share a folder today. Shared, each needs a folder of its own, or the flagged packages leak into the clean cases.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a test or the table: the three moves meet these cases, the table and the child tickets land under implement, and the check decides the last
- the doors these cases reach stand faked where the case is no door test: the spawner's timer is fake, and the bus and process stay real in the index package, the door package of both

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- stop-join-test-stands-red: the draft names TestAStopJoinsTheSpawnerBeforeItAnswers, and no red case holds it, so the join lands unproven
- shared-plant-outlives-each-case: a plant shared through sync.OnceValue cannot sit in t.TempDir, which the first case removes, so it needs os.MkdirTemp and a TestMain cleanup
- door-table-joins-contract-chapter: the doors note already holds One contract test per door, so the audit table extends that chapter and opens no second one

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
