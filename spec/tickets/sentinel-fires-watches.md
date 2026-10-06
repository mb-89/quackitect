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
group: failures-stand-registered
depends_on: ["failure-nodes-stand, failure-door-raises"]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 23fa5b8d8a656a731a86b241a137eefd3bdb3be4
    hash_after: 23fa5b8d8a656a731a86b241a137eefd3bdb3be4
    inputs:
      - name: ask
        hash: ebd72578966d3bfc
        size: 766
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 5ff1dcd0126d8157306e4f77cbd96093889c4543
    hash_after: 8a37fccab292e70b5d72becf96e752639639c0ba
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/failure fails
    inputs:
      - name: design/draft
        hash: d193756acc6de080
        size: 2942
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-7
    hash_before: db62d08d282d1fb6046dca7c8933a5a29aa4eac9
    hash_after: db62d08d282d1fb6046dca7c8933a5a29aa4eac9
    inputs:
      - name: design/draft
        hash: d193756acc6de080
        size: 2942
      - name: design/tests-red
        hash: 93953b6e9f5ee92f
        size: 1038
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: dc4904ab364efa10
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: aa289ce84550ee162c76aa05f66bdbc32187eab5
    hash_after: aa289ce84550ee162c76aa05f66bdbc32187eab5
    inputs:
      - name: ask
        hash: ebd72578966d3bfc
        size: 766
      - name: [[spec/design_output/failures]]
        hash: 8e785cc94e2e32f9
        size: 4503
    def: 7883b3d10633c780
  - step: design/tests-red
    skipped: true
    kept: fc2c608f22299b4a2b46ffd5924e3ac9334c4c4c
    why: its red tests stand as fc2c608f2 landed them, and a later leaf passed since
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-10
    hash_before: a7db35b2c1a3ed4d70f699e389642dfd4048b52b
    hash_after: a7db35b2c1a3ed4d70f699e389642dfd4048b52b
    inputs:
      - name: design/draft
        hash: e4d12a074e383f92
        size: 3512
      - name: design/tests-red
        hash: 93953b6e9f5ee92f
        size: 1038
      - name: [[spec/design_output/failures]]
        hash: 8e785cc94e2e32f9
        size: 4503
    def: dc4904ab364efa10
---

# Ask

A failure node may declare a watch, and the sentinel fires the failure when its event arrives. A quiet span arms the clock door, so nothing polls, as [[spec/design_output/failures#the-sentinel-fires-a-watch]] says.

Without it, a stall or a loop stands unseen until a person reads the log.

- `go test ./src/failure/` passes a case where an event matching a watch fires its failure
- `go test ./src/failure/` passes a case where a quiet span past on the fake clock fires its failure once, and a matching event arms it again
- `go test ./src/modules/clock/` passes the contract case for After over the real clock and the fake
- `go test ./src/failure/` passes a case where a fired failure runs its reaction through the process door's fake
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

[[spec/design_output/failures#the-sentinel-fires-a-watch]] holds the approach.

- The clock door gains `After(span, hand)`, which answers a stop. The real clock arms `time.AfterFunc`. `FakeClock` keeps a one-shot hand, and `Tick` calls it once its span passes.
- `src/failure/sentinel.go` holds `Sentinel`. `NewSentinel` takes the registry, a `Timer`, a hand taking each `Raised`, and a `Runner`. It arms each quiet watch at once.
- `Hear` fires each matching watch with no quiet span. It arms each matching quiet watch again.
- A mutex holds the armed watches, and a round number drops a stale fire.
- A fire raises the node through `Raise`, hands the `Raised` on, and runs the reaction through the `Runner`. A failing reaction raises `failure-reaction-fails`.
- `src/failure/door.go` holds `Runner`: `Shell` runs `./RUNME.sh` under the root, and `FakeRunner` keeps each line.
- `NodeOf` compiles each watch match, and names a match that reads as no pattern.

Assumed: the hooks door wiring stands outside the done_when lines. The note `sentinel-hears-the-hooks` carries it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/clock/clock.go Clock, whose interface gains After, answered by clock and FakeClock
- src/failure/node.go NodeOf, which now compiles each watch match
- none for Sentinel, Hear and Runner today: the hooks door calls Hear once the note sentinel-hears-the-hooks lands

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/failure/sentinel_test.go TestAnEventMatchingAWatchFiresItsFailure
- src/failure/sentinel_test.go TestAQuietSpanFiresOnceAndAMatchingEventArmsItAgain
- src/failure/sentinel_test.go TestAFiredFailureRunsItsReaction
- src/failure/sentinel_test.go TestAQuietWatchArmsAtOnceAndFiresWithNoEvent
- src/failure/sentinel_test.go TestAFailingReactionRaisesItsOwnFailure
- src/modules/clock/clock_contract_test.go TestAfterKeepsItsContract
- src/failure/door_contract_test.go TestShellAndFakeRunnerAnswerAlike
- src/failure/door_contract_test.go TestShellAndFakeRunnerAnswerAFailingExit

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- no case shows a quiet watch armed at once: TestAQuietWatchArmsAtOnceAndFiresWithNoEvent decides it
- a real hand races Hear: a mutex holds the armed watches, and a round drops a stale fire
- a match regexp refuses reaches run time: NodeOf compiles each match and names the fault
- the fake After hand runs twice: Tick deletes the hand once it calls it
- TestClockKeepsItsContract slept: the real side waits on a channel an After hand closes, and no test under src/modules/clock sleeps
- a failing reaction goes unsaid: the sentinel raises failure-reaction-fails, and TestAFailingReactionRaisesItsOwnFailure decides it
- the After contract hides under the contract tag: the check runs go test with that tag, which decides the line
- the hooks wiring stands outside the ask: the note sentinel-hears-the-hooks carries it to the retro

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/failure/sentinel.go
- src/failure/sentinel_test.go
- src/failure/door.go
- src/failure/door_contract_test.go
- src/failure/node.go
- src/modules/clock/clock.go
- src/modules/clock/clock_contract_test.go
- spec/failures/failure-reaction-fails.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened src/failure/sentinel.go, door.go and node.go, src/modules/clock/clock.go and its contract test, and spec/failures, and checked each claim there
- a search over src finds no caller of NewSentinel or Hear outside sentinel.go, so the list names the clock, NodeOf and the hooks note
- each done_when line names its case: the event, the quiet span, After, the reaction, and ./RUNME.sh check for the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/failure/sentinel_test.go src/failure/door_contract_test.go src/modules/clock/clock_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/failure/sentinel_test.go TestAnEventMatchingAWatchFiresItsFailure
- src/failure/sentinel_test.go TestAQuietSpanFiresOnceAndAMatchingEventArmsItAgain
- src/failure/sentinel_test.go TestAFiredFailureRunsItsReaction
- src/failure/door_contract_test.go TestShellAndFakeRunnerAnswerAlike
- src/modules/clock/clock_contract_test.go TestAfterKeepsItsContract

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The stub sentinel fires nothing and runs nothing, the stub runners run nothing, the fake clock's After never calls its hand, and the real clock's calls it at once, so the hand runs after its stop.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each go test line of the ask meets its case: the event, the quiet span, After's contract and the reaction, and ./RUNME.sh check decides the last
- the sentinel cases take the fake clock and FakeRunner, and the contract cases hold the real clock and the shell to their fakes

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- sentinel-note-names-the-runner: spec/design_output/failures.md says Sentinel takes the registry, the clock door and a hand, and that the engine runs the reaction, while src/failure/sentinel.go NewSentinel takes a Runner and runs the reaction itself, raising failure-reaction-fails; the note's chapter names the Runner and the sentinel as the hand running the reaction
- sentinel-callers-list-whole: the draft's callers list names NodeOf alone in node.go, and misses its callers src/failure/registry.go Load, src/failure/check.go and src/quack/verb_failure.go, each reading the new match-pattern fault; the builder confirms each still answers green

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
