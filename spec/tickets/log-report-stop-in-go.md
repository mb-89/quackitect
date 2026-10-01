---
kind: [[ticket]]
state: open
step: design/draft-2
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
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: 5d05d44720684cf280b04f71bec8c81bb5caa566
    hash_after: 5d05d44720684cf280b04f71bec8c81bb5caa566
    inputs:
      - name: ask
        hash: 202a6354fc09171a
        size: 562
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3cd847cb11c · claude-code-remote
    hash_before: eb5a8165c41bf335f5ea3a0b4909e46b3bc565a3
    hash_after: eb5a8165c41bf335f5ea3a0b4909e46b3bc565a3
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 381b8a04222c1323
        size: 4949
    def: 08e16d07b0de477c
  - step: gate
    hand: box 3cd847cb11c · claude-code-remote · helper-4
    hash_before: eb610ffaa28555fa29d2a2e98dba478c92601fdc
    hash_after: eb610ffaa28555fa29d2a2e98dba478c92601fdc
    returns: 1
    why: "the approach's answers never reach the agent as a tool result: step 5 answers Effect{Kind: resultKind, Result: text} with text a bare string, and stepOf in .claude/skills/level0/hooks/cage.js returns one.result unchanged, so door() in level0.js hands the harness a bare string where it reads {result: text}, the shape report.js, logline.js and stop.js answer today ({result: {result: text}}) and the shape cage.test.js already pins (result: {result: \\\"a line\\\"}); the door must answer Result: map[string]any{\\\"result\\\": text}; the red tests decide the wrong contract: src/quack/answers_test.go and src/modules/hooks/answers_test.go assert one.Result.(string), so they turn green on an answer the harness cannot read, and the first done_when line stays undecided; assert the {result: text} shape instead; no case drives the road from the door to the harness for the three tools: add a cage.test.js case where stepOf over a Go answer for mcp__level0__report yields {result: text}, so the client side stands decided beside the Go cases"
group: go-cage-switches-over
depends_on: ["tools-keep-their-own-names"]
---

# Ask

The log, report and stop tools answer off the Go side, with the text the bridge answers today.

The folds already keep the demand and the claim, and the bridge still writes the answer. The bridge cannot leave while it answers these calls.

- the log, report and stop tools each answer the bridge's text, in a case of `src/quack`. `go test ./src/quack/...` decides it
- the bridge's tools table names none of the three, in a case of `test/level0/cage.test.js`. `node --test test/level0/cage.test.js` decides it
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

The hooks door answers the log, report and stop calls off the folds that already land them. Three actions register under the tools' own names, so the index lists them, and the door answers before any action runs.

1. `Said` in `src/modules/hooks/fold.go` gains `Result string`, the text a tool answers with.
2. `Holds.called` sets `Result` on `reportCall`, as `pays` in `src/bridge/answer.js` words it: no text, no demand, a lack, or a pay naming the demand's why. A report with no demand also lands a reply row on `Said.Rows`.
3. `Holds.called` gains the `log` call, as `writesLine` in `src/bridge/logline.js` answers it. It lands one row on `Said.Rows` at the level the call names, and `Result` names its kind.
4. `Stops.claims` in `src/modules/hooks/stops.go` sets `Said.Result` the way `claims` in `src/bridge/stop.js` words it: an unknown reason lists the ids, a falling check says why, and a standing claim answers the stop line.
5. A new `Door.answers` in `src/modules/hooks/answers.go` reads `Result` off the holds or the stops the event just landed. It answers `Effect{Kind: resultKind, Result: text}`, and `Hook` tries it after `searches` and before `calls`. `NewDecisionOf` reads a result with no text as a pass.
6. `Registers` in `src/modules/hooks` adds the actions `hooks/log`, `hooks/report` and `hooks/stop`, with `q.ToolName`, `q.Doc` and the inputs the bridge's specs declare. Each lists no request, since the door answers first.
7. `src/bridge/server.js` drops `reportTools`, `logTools` and `stopTools` from `TOOLS`, and their specs from the list. `report.js` and `logline.js` leave the tree, and `stop.js` keeps its hooks.

Boundaries with sibling tickets:
- find-and-wait-in-go owns the helper's report fold, a different thing from the report tool
- level0-tools-leave-the-bridge drops every other tool entry of `TOOLS`
- the-bridge-server-leaves removes `server.js` itself

What I weigh: the folds already decide the pay and the claim, so the door reading their result keeps one owner of each decision. An action answering the text would read the folds a second time.

I assume: the client's cage returns a hook result as the tool's result, as `stepOf` does for the bridge. The stop spec's reason list comes off the rules, so the Go doc names the ids at the refusal alone.

Risks:
- the stop spec lists the reasons in its description today, and a static Go doc loses that list
- every test under `test/level0` driving the bridge's report or stop tool moves to a Go case or drops

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/fold.go: Holds.called, which sets the result for report and log
- src/modules/hooks/fold.go: Said, which gains Result
- src/modules/hooks/stops.go: Stops.claims, which sets the stop's result
- src/modules/hooks/hooks.go: Door.Hook, which gains the answers branch before calls
- src/modules/hooks/hooks.go: Registers, which adds the three actions
- src/modules/hooks/cage.go: NewDecisionOf, which reads a textless result as a pass, unchanged
- src/bridge/server.js: TOOLS and the spec list, which drop the three tools
- src/bridge/stop.js: TOOLS and claims, which leave
- src/bridge/report.js and src/bridge/logline.js, which leave the tree
- test/level0/stop.test.js, stop-said.test.js, answer.test.js and cage.test.js: cases calling the bridge's three tools

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/answers_test.go: TestAReportWithNoDemandAnswersTheBridgesLine
- src/modules/hooks/answers_test.go: TestAReportPayingTheDemandNamesWhatItAnswers
- src/modules/hooks/answers_test.go: TestAReportLackingTheDemandSaysWhatItLacks
- src/modules/hooks/answers_test.go: TestALogCallLandsItsRowAndNamesItsKind
- src/modules/hooks/answers_test.go: TestAStopNamingNoReasonListsTheIds
- src/modules/hooks/answers_test.go: TestAStopWhoseCheckFallsSaysWhy
- src/modules/hooks/answers_test.go: TestAStopThatStandsAnswersTheStopLine
- src/quack/answers_test.go: TestTheLogReportAndStopToolsAnswerOffTheDoor
- test/level0/cage.test.js: the bridge's tools table names none of log, report and stop

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/fold.go
- src/modules/hooks/stops.go
- src/modules/hooks/hooks.go
- src/modules/hooks/answers.go, new
- src/modules/hooks/answers_test.go, new
- src/quack/answers_test.go, new
- src/bridge/server.js
- src/bridge/stop.js
- src/bridge/report.js, removed
- src/bridge/logline.js, removed
- test/level0/cage.test.js
- test/level0/stop.test.js
- test/level0/stop-said.test.js
- test/level0/answer.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened report.js reports, logline.js writesLine, answer.js pays and paid, stop.js claims, server.js TOOLS, fold.go Holds, Said, called and stepHolds, stops.go claims and stops, and rows.go rows
- callers come from a search of server.js imports and of test/level0 for the three tool names and their call constants
- the first line meets TestTheLogReportAndStopToolsAnswerOffTheDoor, the second the cage.test.js case, and the third the check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/answers_test.go src/quack/answers_test.go test/level0/cage.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/answers_test.go
- src/quack/answers_test.go
- test/level0/cage.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion: the folds answer no text, and the bridge's table still names the three tools. Said gains a Result field as a stub so the cases compile, and server.js exports toolNames so a test reads the table. The cage file already stands red for clear-answers-off-the-door, whose clear case fails beside mine. A demand lacking chapters pays nothing, so the lack case builds the demand directly.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first line meets TestTheLogReportAndStopToolsAnswerOffTheDoor, the second the cage.test.js case, and the third the check at tests-green
- the hooks cases run over the fold steppers and doorOver, and the quack case over the real wiring the wait cases build

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

### size

<!-- every file the approach touches, one a line -->

<!-- the form is list -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-red-2

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

reject
- the approach's answers never reach the agent as a tool result: step 5 answers Effect{Kind: resultKind, Result: text} with text a bare string, and stepOf in .claude/skills/level0/hooks/cage.js returns one.result unchanged, so door() in level0.js hands the harness a bare string where it reads {result: text}, the shape report.js, logline.js and stop.js answer today ({result: {result: text}}) and the shape cage.test.js already pins (result: {result: "a line"}); the door must answer Result: map[string]any{"result": text}
- the red tests decide the wrong contract: src/quack/answers_test.go and src/modules/hooks/answers_test.go assert one.Result.(string), so they turn green on an answer the harness cannot read, and the first done_when line stays undecided; assert the {result: text} shape instead
- no case drives the road from the door to the harness for the three tools: add a cage.test.js case where stepOf over a Go answer for mcp__level0__report yields {result: text}, so the client side stands decided beside the Go cases

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
