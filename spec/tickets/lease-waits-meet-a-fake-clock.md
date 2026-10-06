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
urgent: true
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: tests-meet-the-doors-once
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: 3f21bd5307b3f35ddb6736ba9be40b0762150d27
    hash_after: 3f21bd5307b3f35ddb6736ba9be40b0762150d27
    inputs:
      - name: ask
        hash: 664e2b4873cd687b
        size: 889
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: f9052ea47d5b092e7132e8d1f4b041e8d4d4e027
    hash_after: f9052ea47d5b092e7132e8d1f4b041e8d4d4e027
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 64057603b30e5b21
        size: 2892
    def: 08e16d07b0de477c
  - step: gate
    hand: box b4c8cb96d125 · claude-code-remote · helper-4
    hash_before: 40a625a680675a5d4988c0b6b3a6a6d1576e47f1
    hash_after: 40a625a680675a5d4988c0b6b3a6a6d1576e47f1
    inputs:
      - name: design/draft
        hash: 64057603b30e5b21
        size: 2892
      - name: design/tests-red
        hash: ccf1c54a62d97aec
        size: 961
    def: dc4904ab364efa10
  - step: implement/change
    hand: box b4c8cb96d125 · claude-code-remote
    hash_before: 09c392120aebff525f52b8670594110ebde60d99
    hash_after: 09c392120aebff525f52b8670594110ebde60d99
    answered:
      - name: lint
        exit: 0
        said: "src/index/door.go:1:1: FileCeiling: A file holds 600 lines, and the file holds 613. Split it by topic."
    def: f150b8c0dc20fe45
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The full check passes on every run. The restart-and-alarm case decides its lease timing on a fake clock, and the two contract suites start their work when the door stands ready, not when a timer runs out.

<!-- breaks, as text: what breaks if it is never done -->
`TestASilentModuleProcessRestartsAndRaisesAnAlarm` times out at twenty seconds inside the full check, because its real lease waits share the box with the parallel tests. `lint-twins` and `runme-road` time out on a cold box. A red check stops every hand-back.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `go test ./src/quack -run TestASilentModuleProcessRestartsAndRaisesAnAlarm` passes with the lease timing on a fake clock, and asserts the restart and the alarm as before
- one door test still spawns the real silent process and sees it restart
- `test/contract/lint-twins.test.js` and `test/contract/runme-road.test.js` wait on a readiness signal, with no fixed timer deciding
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

Two waits move off a fixed timer onto readiness.

1. The alarm cases in `src/quack/io_test.go` hand the dog `clock.NewFake(...).Now` in place of `time.Now`. Each case moves the fake clock past the lease term only once the current process commits a pid the case has not yet expired, so the spawn's start time never counts against the lease. The cases still spawn the real test binary over the real bus, so the module case stands as the one door test of a placed process, and asserts two pids and then the alarm as before. The cause: the dog holds a 200 ms lease on the real clock from the spawn, so a loaded box kills the second process before it commits its pid, two faults raise the alarm and stop the restarts, and the case waits out twenty seconds for a second pid that never comes.

2. `starts` in `src/index/door.go` waits on readiness. The spawning caller waits until the standing file stands or its spawned index exits, and refreshes its claim each poll. A caller meeting a claim waits while that claim stays fresh, and takes the claim where it goes stale or leaves without a door. A hang guard on a named span ends a wait where an index neither stands nor exits. `spawns` answers a channel carrying the process's exit. The clock and the pause the wait reads stand in package variables, so the reach cases drive them fake and sleep no real second. Both contract suites then share the one index the first caller spawns, however long its first build takes on a cold box.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/main.go reaches, the one caller of starts
- src/index/door.go starts, the one caller of claims and spawns
- src/index/reach_test.go fakeSpawn, TestAStartRunsTheTreesIndexAndNeverTheCaller, TestACallerMeetingAClaimWaitsAndSpawnsNothing, TestAStaleClaimGivesWay
- src/quack/io_test.go TestASilentIOProcessReadsInTheAlarms and TestASilentModuleProcessRestartsAndRaisesAnAlarm, the two callers of manager.NewDog on the real clock there

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/reach_test.go TestAStartWaitsOnItsIndexPastTheOldSpan
- src/index/reach_test.go TestAStartEndsWhenItsIndexExits
- src/index/reach_test.go TestAStartGivesUpOnAHungIndex
- src/index/reach_test.go TestAWaiterHoldsWhileTheClaimStaysFresh
- src/quack/io_test.go TestASilentModuleProcessRestartsAndRaisesAnAlarm, rewritten onto the fake clock with the same assertion

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/index/door.go
- src/index/main.go
- src/index/reach_test.go
- src/quack/io_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: door.go starts, claims and spawns, main.go reaches and the start constants, procs.go runs and holds, lease.go Dog, clock.go FakeClock, both io_test cases, both contract suites
- callers come off a grep of starts, claims, spawns and NewDog under src
- each done_when line names its test: the io_test case, the module case as the door test, the reach cases for readiness, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/index/reach_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/index/reach_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The four cases fail on their own assertion within a third of a second, because the fake start clock moves on at each pause and no case sleeps. Each names the fixed thirty seconds: an index still coming up, an index that exits, a hung index and a fresh claim all end at the same span. The seams land with the tests, as a refactor the standing cases pass over: the clock and the pause a start reads, and a spawn answering its exit. The io_test change is test-only and lands under implement, because the fake clock makes it pass at once.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a test: the readiness lines meet the four reach cases, the alarm lines meet the rewritten io_test cases under implement, and the check decides the last
- the doors these cases reach stand faked: the spawn, the clock and the pause; the disk is a temporary folder the case owns

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- alarm-ticks-await-the-beat: the module case ticks past the term only after the pid lands. The beat lands after the pid commit, so it can renew the lease past one tick. Tick on each poll while the current pid stands unexpired.
- hang-guard-under-suite-timer: startHang stands at five minutes, the same span as RUN_TIMEOUT_MS in both contract suites. Set the guard under the suite timer, so the start names the hang first.
- start-fault-names-its-span: starts still says thirty seconds. The rewrite names the hang guard or the index exit instead.
- io-case-red-before-green: no red test decides the io_test line before implement. The rewritten case under implement decides it, and the check confirms it.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/index src/quack/io_test.go spec/design_output/index.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus the door note, which owns the start's wait
- the doors the change reaches stand faked in the cases: the spawn, the start clock and the pause, and the dog's clock
- each changed function points at spec/design_output/index#a-door-comes-back or at this ticket
- the start's wait stands described once, in the door note, and the code points at it

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
