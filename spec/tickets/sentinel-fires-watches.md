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

The clock door gains After(span, hand) (stop func()). The real clock arms time.AfterFunc, and FakeClock keeps a one-shot hand that Tick calls once its span passes. The contract case holds both: the hand runs once, and a stop before the span keeps it from running. The real side waits on a channel the hand closes, not on a sleep.

src/failure/sentinel.go adds Sentinel. NewSentinel(registry, clock, fire, run) takes the registry, a Timer (After alone, which clock.Clock answers, so src/failure imports no module), a hand taking each Raised, and a Runner. It arms each quiet watch at once. Hear(Event{Kind, Text}) matches each watch whose event names the kind and whose match, a regular expression, finds the text. A watch with no quiet span fires on the event. A quiet watch stops its armed hand and arms After again. A fire raises the node's id through Raise and hands the Raised to fire, which writes the row. It then runs the node's reaction through the Runner. A quiet watch fires once and stays unarmed until a matching event arms it again.

src/failure/door.go gains Runner, the process door: Shell{Root} runs ./RUNME.sh with the reaction's words under the root, and FakeRunner keeps each line it gets. The contract case holds the two over a temp root carrying a RUNME.sh that echoes its words.

Assumed: the hooks door handing each post to the sentinel stands outside this ask's done_when lines. A note parks it for the retro.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- none today: Sentinel, After and Runner are new
- src/modules/clock: Clock gains After, and New and FakeClock answer it
- the hooks door, which hands each post to Hear once the wiring lands

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/failure/sentinel_test.go TestAnEventMatchingAWatchFiresItsFailure
- src/failure/sentinel_test.go TestAQuietSpanFiresOnceAndAMatchingEventArmsItAgain
- src/failure/sentinel_test.go TestAFiredFailureRunsItsReaction
- src/modules/clock/clock_contract_test.go TestAfterKeepsItsContract
- src/failure/door_contract_test.go TestShellAndFakeRunnerAnswerAlike

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/failure/sentinel.go
- src/failure/sentinel_test.go
- src/failure/door.go
- src/failure/door_contract_test.go
- src/modules/clock/clock.go
- src/modules/clock/clock_contract_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened src/modules/clock/clock.go and clock_contract_test.go, src/failure/node.go, raise.go and door.go, and src/pull/pull_doors.go Shell, and checked each claim the approach makes against them
- the callers list names the clock module, whose interface grows, and the hooks door, which calls Hear once wired
- each done_when line maps to a test: the event to TestAnEventMatchingAWatchFiresItsFailure, the quiet span to TestAQuietSpanFiresOnceAndAMatchingEventArmsItAgain, After to TestAfterKeepsItsContract, the reaction to TestAFiredFailureRunsItsReaction, and the check to ./RUNME.sh check

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

pass
- the approach answers the ask, and each done_when line meets a red case that fails on its own assertion: the event, the quiet span and the reaction in src/failure/sentinel_test.go, After in src/modules/clock/clock_contract_test.go under the contract tag the check runs, and Runner in src/failure/door_contract_test.go
- implement: TestAQuietSpanFiresOnceAndAMatchingEventArmsItAgain hears an event before the first span passes, so no case shows NewSentinel arming each quiet watch at once; add the stall from the start, a Tick past the span with no event firing once, to sentinel_test.go
- implement: the real clock runs the After hand on its own goroutine while Hear runs on the caller, so Sentinel holds a mutex over its armed stops, and a hand stopped while it fires checks a generation so a stale fire drops
- implement: watchOf in src/failure/node.go takes match as any text and never compiles it, so a pattern regexp refuses reaches the sentinel at run time; NodeOf names that fault, a file past the draft size
- implement: FakeClock.After keeps a one-shot hand that Tick deletes once it calls it, so the hand runs once whatever span later ticks pass
- implement: TestClockKeepsItsContract waits through time.Sleep on the real clock, against the rule of no sleeps in tests; the real side waits on an After hand closing a channel instead, in the same contract file
- implement: Shell.Run names what a nonzero exit and a missing RUNME.sh answer, and the sentinel says what it does with an error the Runner answers, since no case decides either
- the ask says go test ./src/modules/clock/ passes the After contract, and that case stands under the contract build tag, so the plain command runs nothing of it; the check runs go test -tags contract, which decides the line
- the hooks door wiring stands outside the done_when lines, and the note sentinel-hears-the-hooks carries it to the retro, so the sentinel fires nothing in a live session until that note becomes a ticket

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
