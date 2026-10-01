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
group: go-cage-switches-over
step: gate
depends_on: ["tools-keep-their-own-names"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3bb3757611c · claude-code-remote
    hash_before: afebc8b3259169f2419412b62af150bf8d348978
    hash_after: 7ed402c0b73da05ae92562d12cb51cc986a740d0
    inputs:
      - name: ask
        hash: e25d3cab11757f1c
        size: 527
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3bb3757611c · claude-code-remote
    hash_before: c0cf2c68e064c07182470f2d6aada6247b2b7451
    hash_after: c0cf2c68e064c07182470f2d6aada6247b2b7451
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: b605f79727538e7b
        size: 10103
    def: 08e16d07b0de477c
---

# Ask

The find tool answers off the index, and the wait tool waits on a helper's report, a process or quiet files off the Go side.

`runsFind` and `waits` run in the bridge alone. A wait outlasts the door's call wait, so it answers through the running handle.

- a find answers the lines the index ranks, in a case of `src/quack`. `go test ./src/quack/...` decides it
- a wait returns on a helper's report, and answers a running handle past the call wait, in a case of `src/quack`
- `./RUNME.sh check` exits 0

view: none

from: none

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

Two new IO modules carry the find and wait tools in Go. Like the edits module, they stay off the wiring until the flip. The find module reads the index through a new seam the door hands the manager. The wait module hears a helper's report through a new session fold.

1. `src/index/ops.go` gains `type Reads interface { Find(words string, limit int) ([]Hit, error) }` and `ReadsOf(db)`. `Manage` takes `reads Reads` as a fifth argument, and `door.manages` passes `ReadsOf(one.db)`. The manager has no db handle today: `Manage` hands it only root, store, `OpRows` and steps.
2. A new IO module `src/modules/search` registers `search/find` with `q.ToolName("find")`, `q.Doc` and `q.IO()`, and no `q.Writes`. Its input is `Find{Words string json:"words"; Function string json:"function"}`, as `findSpec` in `.claude/skills/level0/lib/search.js` declares. It lists one request to module `search`. Its `Outside` holds `Root` and `Find func(words string) ([]Row, error)`, with its own `Row{Path, Line, Text}` type, because `onlyQ` in `src/imports/imports.go` lets a module import q alone.
3. `search.Accept` ports `runsFind`, `findSaid`, `deadIndexLine`, `bodyFound`, `definitionOf` and `bodyFrom` from `src/bridge/search.js`, and keeps every answer line word for word. When the find read fails, the module answers `deadIndexLine` with the error. `warmIndex` drops out, because the Go index stands up whenever the manager runs. Go regexp has no lookahead and no backreference, so the quote-stripping regex in `withoutQuoted` becomes a scanner that skips strings and `//` comments.
4. `src/modules/session` gains a fold `<id>/reports` (a `[]string` of agent ids). It takes each `classic.Stop` whose `Hand.Agent` is set. It also gains a derived `reports` that reads the family `<id>/reports` and returns every reported agent. `Door.writes` in `src/modules/hooks/hooks.go` already lands every event on each fold under `session/<id>/`, so `helperReports` gets its Go twin without any door change.
5. A new IO module `src/modules/waits` registers `waits/wait` with `q.ToolName("wait")`, `q.Doc` and `q.IO()`. Its input `Wait{Agent, Output string; Pid *float64; Files []string}` mirrors `waitSpec` in `src/bridge/wait.js`. `Accept` ports `waits`, `signalsOf`, `reportOf`, `outputOf`, `filesOf`, `quietOf` and `stateOf`. It polls once a second until the first signal, or until the cap. Its `Outside` holds `Root`, `Now`, `Pause`, `Most`, `Quiet`, `Reported(agent) bool` and `Alive(pid) bool`. The `since`/`turn` repost logic in `watchOf` drops out: the operation outlives the call in the manager's book, so a repost is no longer needed.
6. The wait outlasts the door's call wait without new code. `Door.calls` in hooks.go uses `waitOf` (default `hooks/config/wait`), and `Call` in `src/modules/index/call.go` returns `Running` with a `Handle` from `Book.Wait`. The door then answers `tool.Running(...)` with "Its result reaches your next turn", and `Door.ended` tells the result on a later event.
7. `src/quack/accepts.go`: `accepts(root, store, reads)` sends module `search` to `search.Accept(searchOutside(root, reads))` and module `waits` to `waits.Accept(waitsOutside(root, store))`. A new `src/quack/finds.go` wires `searchOutside` over `reads.Find(words, 0)`, the default limit the bridge gets through `se-index find`. It also wires `waitsOutside`: `settingsreader.Count(root, "wait.most")` and `"wait.quiet"`, `Reported` over `store.Snapshot().Read("session/reports")`, `Alive` over `os.FindProcess` plus signal zero, and `time.Now` and `time.Sleep`.
8. `modules` in `src/quack/main.go` gains `search` and `waits`, and `manages` passes the door's reads to `accepts`. `spec/wiring.yaml` gains no line. The instance `wait` that stands there is the settings section, and this ticket leaves it alone: a module type named `wait` would answer the live tool at once.
9. `spec/design_output/index.md#find-reads-a-body` and `spec/design_output/level0.md#the-wait-returns-on-signals` each gain a pointer at the Go twin.

Boundaries with sibling tickets:
- level0-tools-leave-the-bridge drops `runsFind`, `waitTools`, `helperReports` and the `since` stamp in level0.js. This ticket leaves the bridge serving.
- grep-glob-answer-off-index widens `Reads` with Grep and Glob for the hooks door. This ticket adds Find alone.
- log-report-stop-in-go owns the report tool. The helper's report fold here is a different thing.

What I weigh: handing the manager the door's reads costs a signature change at every `Manage` site, and in return the find reads the rows in-process instead of calling its own HTTP door.
I assume: a derived reads the bound family `session/<id>/reports` the way the tickets module reads `files/<path...>`. I also assume the flip that wires both modules waits for level0-tools-leave-the-bridge.

Risks:
- the derived family read over a bound session fold has no case in the tree yet. If it fails, the fallback is a `store.OnCommit` set in quack.
- `Alive` by signal zero answers wrong on Windows, so a pid signal needs a Windows twin or a refusal
- a wait running when the index restarts fails in the book, while the bridge's watch survives a repost
- the bridgehead's `since` repost starts a second operation once the Go module is wired. The flip must drop the stamp.
- the `report` log row `helperReports` writes has no Go twin, and no reader of the row kind stands

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/ops.go: Manage and door.manages, which gain the reads the door hands the manager
- src/index/actions_test.go: fakeManager, which takes the new Manage argument
- src/index/failed_start_test.go: the manage literal, which takes the new Manage argument
- src/index/door_test.go: TestTheIndexLeaseRenewsOffItsWorkLoop, whose manage literal takes the new argument
- src/quack/cli_test.go: the manage literal, which takes the new Manage argument
- src/quack/main.go: manages, which passes the door's reads to accepts, and modules, which gains search and waits
- src/quack/accepts.go: accepts, which takes reads and routes modules search and waits
- src/quack/edits_test.go: editCall, which calls accepts with the new argument
- src/quack/main_test.go: the two accepts calls, which take the new argument
- src/quack/ticket_twins_test.go: the accepts call, which takes the new argument
- src/quack/hooks_test.go: TestTheWiringBindsTheHooksEventsAndTheSessionFolds, whose folds line gains session/<id>/reports
- src/quack/described_test.go: TestEveryModuleDescribesWhatItExposes, which now loads search and waits
- src/modules/session/session.go: Registers, which gains the reports fold and its derived
- src/modules/hooks/hooks.go: Door.writes, which lands each event on the new fold unchanged, and Door.calls and Door.ended, which answer the running handle unchanged
- src/index/tools.go: door.servesTools, which lists find and wait once a flip wires them
- src/bridge/search.js: runsFind and src/bridge/wait.js: waits and helperReports, which keep serving until level0-tools-leave-the-bridge drops them

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/finds_test.go: TestAFindAnswersTheLinesTheIndexRanks
- src/quack/finds_test.go: TestAFindByFunctionAnswersItsBody
- src/quack/finds_test.go: TestAFindNoRowCarriesSaysNothingCarriesThem
- src/quack/finds_test.go: TestAFindOverAFailingReadSaysTheIndexIsDead
- src/quack/finds_test.go: TestTheFindAndWaitModulesStandOffTheWiring
- src/quack/waits_test.go: TestAWaitReturnsOnAHelpersReport
- src/quack/waits_test.go: TestAWaitPastTheCallWaitAnswersARunningHandle
- src/quack/waits_test.go: TestTheDoorAnswersAWaitPastItsCallWaitAsRunning
- src/modules/search/search_test.go: TestDefinitionOfMatchesEachShape
- src/modules/search/search_test.go: TestBodyFromSkipsBracesInStringsAndComments
- src/modules/waits/waits_test.go: TestAWaitReturnsOnTheFirstSignal
- src/modules/waits/waits_test.go: TestQuietCountsFromTheLastChange
- src/modules/waits/waits_test.go: TestAWaitReturnsAtItsCap
- src/modules/waits/waits_test.go: TestAnOutputEndsWithItsProcess
- src/modules/waits/waits_test.go: TestAWaitWithNoSignalSaysWhatItTakes
- src/modules/session/session_test.go: TestAHelpersStopLandsItsReport
- src/modules/session/session_test.go: TestTheReportsReadEverySession
- src/index/ops_test.go: TestTheReadsFindTheRowsTheDoorFinds

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/index/ops.go
- src/index/ops_test.go
- src/index/actions_test.go
- src/index/failed_start_test.go
- src/index/door_test.go
- src/modules/search/search.go, new
- src/modules/search/search_test.go, new
- src/modules/waits/waits.go, new
- src/modules/waits/waits_test.go, new
- src/modules/session/session.go
- src/modules/session/session_test.go
- src/quack/main.go
- src/quack/accepts.go
- src/quack/finds.go, new
- src/quack/finds_test.go, new
- src/quack/waits_test.go, new
- src/quack/edits_test.go
- src/quack/main_test.go
- src/quack/ticket_twins_test.go
- src/quack/hooks_test.go
- src/quack/cli_test.go
- spec/design_output/index.md, a pointer at the Go twin
- spec/design_output/level0.md, a pointer at the Go twin

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened and checked: src/bridge/search.js and wait.js line by line; findSpec; server.js TOOLS and classic.Stop; src/doors/index.js find; index Find, answers, ops.go Manage and OpRows; modules/index call.go Call, Book.Wait and manager Served; hooks.go writes, calls, waitOf, ended and running; stops.go stepStops; the session module; q Request, Deliver, derivedOf, Folds and Input; tool.go; wiring.yaml; the settings wait section; config Count; imports onlyQ and fakesuite; the edits module and its quack wiring and test
- Callers: a grep for OpRows and accepts( names every Manage literal and accepts call, and the hooks test asserts the session fold list. The bridge's runsFind and waits stay as callers that level0-tools-leave-the-bridge drops.
- Each done_when line has a deciding test: the find line is decided by TestAFindAnswersTheLinesTheIndexRanks; the wait line by TestAWaitReturnsOnAHelpersReport, together with TestAWaitPastTheCallWaitAnswersARunningHandle and TestTheDoorAnswersAWaitPastItsCallWaitAsRunning; the check line by ./RUNME.sh check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/finds_test.go src/quack/waits_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/finds_test.go
- src/quack/waits_test.go
- src/modules/search/search_test.go
- src/modules/waits/waits_test.go
- src/modules/session/session_test.go
- src/index/ops_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new test fails on its own assertion, and the tree builds and vets. The quack cases call search/find and waits/wait by name, and answer names no action, because the modules map loads neither module yet. The module cases run against stubs that register nothing and answer nil, and the index Reads seam finds nothing. accepts takes a third reads argument, and every caller passes nil for now. Manage keeps its four arguments, since no test needs a fifth to compile. TestATurnCompleteWithTheClearInHandAnswersTheClear in src/modules/hooks fails before this step, and it belongs to clear-answers-off-the-door. A reports fold breaks the two-fold count in TestTheModuleKeepsTheFillAndTheLastAlone and the folds line of TestTheWiringBindsTheHooksEventsAndTheSessionFolds, so tests-green updates both.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the find line meets TestAFindAnswersTheLinesTheIndexRanks, the wait line meets TestAWaitReturnsOnAHelpersReport and TestAWaitPastTheCallWaitAnswersARunningHandle, and the check line meets the check at tests-green
- the module cases run against q/qtest and local fakes of the clock, the pause, the disk and the process, and the quack cases open a temp tree with a fake reads

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
