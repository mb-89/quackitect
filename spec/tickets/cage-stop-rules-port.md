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
depends_on: [cage-command-rules-port]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: fd5cdaf3f8ded054b8dddda953582993304aadde
    hash_after: fd5cdaf3f8ded054b8dddda953582993304aadde
    inputs:
      - name: ask
        hash: 29ccd1d3cec3f09e
        size: 761
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 2b754047a72b2317c0755f0882da1af01f75b138
    hash_after: 2b754047a72b2317c0755f0882da1af01f75b138
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 967bb22b1139c872
        size: 4718
    def: 08e16d07b0de477c
---

# Ask

The `hooks` IO module blocks every turn's end the bridge blocks, with the same reason. The rules:

- the handover due, off `holdsForHandover` in `src/bridge/handover.js`
- the owner's prompt still unanswered, off `holdsTurn`
- the stop reasons of `onStop` in `src/bridge/stop.js`, off the stop rules under `spec/config`

Without it, the cage key moving to `new` lets a turn end with its handover unwritten. The next session then starts blind.

- each rule meets a recorded log under `test/replay/cage`, and its `.shadow.jsonl` holds no row that rule decides. `go test ./src/modules/hooks/...` decides it
- each block's text reads as the bridge's text for the same turn, in a table case of `src/modules/hooks`
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

The door answers `classic.Stop` in the bridge's order off `src/bridge/server.js`: a helper's stop passes, then `holdsForHandover`, then `onStop`. `gatesAnswer` stands between them and blocks nothing, so it stays with the bridge. `holdsTurn` blocks only on a demand carrying `fits`, which the full update alone sets, and the holds fold leaves that shape to the bridge. So the Go side reads it as a pass, and the ticket that ports the full update takes it up.

The work lands in four commits.

1. A pure package `src/modules/hooks/stop`, off `.claude/skills/level0/lib/stop.js`:
   - a reader of the flat rule list under `spec/config/stop`, which keeps a rule it cannot read out of the vote, as `pool` does
   - `Decide`, `AtTurnEnd` over the run of holds, `StopReasons`, `NamesNext`, `ReportStands`, the last line's reason, `ClaimFalls` and the block text of `asksForStop`
   - each check of `CHECKS` in `src/bridge/stop.js`, as a function over a `Facts` struct
2. A stops fold in `src/modules/hooks`, beside the holds fold, keeps what the bridge keeps on the box across events:
   - the run of holds in a row
   - the claim the stop call makes
   - the report mark off `turn.said`
   - the helpers spawned in the background
   - the todo list off TodoWrite, and the handover phase with its asks, fill and marks off `session.measure`
   - the owner prompts, which `chatIsNew` counts
3. `Door.writes` stamps the facts under `stopped` on a `classic.Stop` post and on the stop call, as it stamps `held` on a call. The facts:
   - the plan, the holds in hand and the clear ticket
   - the ticket texts a person's step reads, the group in hand off the branch, the open private tickets
   - the free queue off the tickets and `git for-each-ref`
   - the binding, `stop.enabled`, `stop.mostInARow`, `context.handoverAt`, the cloud flag and the rules
4. `Door.Hook` answers the Stop with a block effect carrying the bridge's text, the case table, and one recorded log a rule.

What I weigh:

- The facts ride the event, so the fold stays pure and replays over no disk, as the holds port chose.
- The bridge counts prompts off the session log, which a restart keeps. The fold counts the session's events, which the index keeps, so the two agree within one session.
- The stop tool's own result text stays the bridge's, since the ask names the turn's end. The fold records a claim where its check stands, so the vote reads the same claim.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Registers registers the folds
- src/modules/hooks/hooks.go: Door.writes stamps each event
- src/modules/hooks/hooks.go: Door.Hook answers each post
- src/modules/hooks/cage.go: NewDecisionOf reads the block effect
- src/modules/hooks/cage.go: OldDecisionOf reads the bridge's block
- src/quack/main.go: listensHooks builds hooks.Outside
- src/modules/hooks/hooks_test.go: doorOver builds Outside

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/stop/stop_test.go: TestTheRulesReadAsThePoolReadsThem
- src/modules/hooks/stop/stop_test.go: TestDecideVotesAsTheToothVotes
- src/modules/hooks/stop/stop_test.go: TestTheToothLetsGoAfterItsCap
- src/modules/hooks/stop/stop_test.go: TestEachCheckReadsItsFacts
- src/modules/hooks/stops_test.go: TestTheStopsFoldKeepsWhatTheBoxKeeps
- src/modules/hooks/stops_test.go: TestTheStopBlocksWhatTheBridgeBlocks
- src/modules/hooks/cage_test.go: TestReplayLogAnswersEveryRecordedLog, over one log a rule
- test/level0/stop-cases.test.js: the bridge answers the shared stop case

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/stop/rules.go
- src/modules/hooks/stop/vote.go
- src/modules/hooks/stop/checks.go
- src/modules/hooks/stop/stop_test.go
- src/modules/hooks/stops.go
- src/modules/hooks/stops_test.go
- src/modules/hooks/hooks.go
- src/modules/hooks/cage_test.go
- src/quack/main.go
- test/replay/cage/stop-cases.json
- test/level0/stop-cases.test.js
- test/replay/cage: one log, box file and golden shadow a rule

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file and function named stands opened: the classic.Stop dispatch and endsTurn in src/bridge/server.js, holdsForHandover, measures, clearsHere and clearsAfter in src/bridge/handover.js, holdsTurn and onTurnEnd in src/bridge/answer.js, gatesAnswer in src/bridge/answer-read.js, onStop, claims, CHECKS and every tree read behind it in src/bridge/stop.js, decide, pool, toothOf, namesNext and todos in lib/stop.js, and the rules under spec/config/stop
the callers list names every reader of the answer's effects and every builder of Outside, found by grep over src
the replay line meets TestReplayLogAnswersEveryRecordedLog over the new logs, the text line meets TestTheStopBlocksWhatTheBridgeBlocks and its JS twin, and the check line meets ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/stops_test.go
- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

`TestTheStopBlocksWhatTheBridgeBlocks` stands red on its own assertion in each case the bridge blocks, and green in each case it lets end. Today the door passes every Stop. The bridge twin `test/level0/stop-cases.test.js` passes every case over the live rules.

The replay stands red on the four stop logs: the handover, the vote, a claim that falls, and a full update lacking its chapters.

The surprises:

- `holdsTurn` blocks only on a full update's shape, which the call-holds port left to the bridge. The shape is a chapter list in `spec/config/status.yaml` and a heading check, so this port carries it, and the gap the call-holds handover names closes here
- the block text ends on the binding line, which stamps the moment the binding was first read. The table records the fake clock's instant as `now`, and the Go twin sets the door's clock to it. The fold keeps that moment
- the owner prompt's demand refuses a stop call made before the prompt is paid, so the stop call case pays the prompt with a display first

The scaffold adds `StopOff`, `MostInARow`, `HandoverAt` and `BindingLayer` to `Settings`, so the red tests build.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the replay line meets TestReplayLogAnswersEveryRecordedLog over stop-handover, stop-vote, stop-claims and stop-full-update, red now; the text line meets TestTheStopBlocksWhatTheBridgeBlocks, red in each block case; the check line stands a checkpoint the implement step answers with ./RUNME.sh check
every door the tests reach has a fake: git through taughtGit, the clock through the door's Now, the tree through t.TempDir holding the live rules, and the index through q/qtest in doorOver; the bridge twin takes fakeDisk, fakeProc, fakeClock and fakeLog

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
