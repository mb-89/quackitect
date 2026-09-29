---
kind: [[ticket]]
state: open
step: implement/change
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
group: go-cage-lands-in-shadow
depends_on: ["the-hooks-door-lands"]
record:
  - step: design/draft
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: bd4435294e9bbe6ece6361576bb10358aeeaca12
    hash_after: bd4435294e9bbe6ece6361576bb10358aeeaca12
    inputs:
      - name: ask
        hash: a804d3c07693ee2e
        size: 415
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 7cf3ca3409c49ba6ac1246e42532fc1bdb32b118
    hash_after: 7cf3ca3409c49ba6ac1246e42532fc1bdb32b118
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 104a8279f653155f
        size: 2877
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8535e12fc10e · claude-code-remote · helper-3
    hash_before: e8146ad18d54b05e86c6422183b4fc16a31e4e31
    hash_after: e8146ad18d54b05e86c6422183b4fc16a31e4e31
    inputs:
      - name: design/draft
        hash: 104a8279f653155f
        size: 2877
      - name: design/tests-red
        hash: 807824f8506bfb0a
        size: 1047
    def: dc4904ab364efa10
---

# Ask

The cage rules port one at a time. A harness replays session logs recorded at `debug` into the `hooks` IO module, and asserts the decisions the bridge made.

A rule ported with no replay changes what the cage refuses, and nobody sees it.

- `go test ./...` from the root passes
- the replay of every recorded log answers the bridge's decisions, and each difference writes a `shadow` row
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

One new file, src/modules/hooks/cage.go, holds the harness, and Door.Hook stays as it stands.

1. PostsOf(rows []log.Row) []Post rebuilds a Post from each row of kind hook that src/doors/log.js event writes at debug: Event from Extra[event], E from the e field of Text, Old from the JSON of Extra[answer]. A row of any other kind, a shadow row among them, reads as no post.
2. DecisionOf reads one word off either side. The bridge's answer reads hold where it carries needs, refuse on result.deny, block on result.block, and pass otherwise, as letsThrough in src/bridge/server.js reads it. The door's answer reads block on a block effect, refuse on a result effect answering a tool that names no action, and pass otherwise.
3. ReplayLog(door, text, say) drives each post through door.Hook in log order and compares the two words. Each pair read apart becomes an Apart {line, event, tool, old, new}, and say writes it as one shadow row: level info, kind shadow, slice cage, the shape src/scripts/log-shadow.js writes, so ./RUNME.sh log --kind shadow names it.
4. ShadowTo(path) answers a say appending that row to a session log file.
5. Recorded logs stand under test/replay/cage/<name>.jsonl, rows copied off a debug session log. Beside each, <name>.shadow.jsonl holds the shadow rows the replay writes today. A ported rule shrinks that file, so the diff of the port shows every decision it changes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/cage_test.go TestReplayLogAnswersEveryRecordedLog calls ReplayLog and ShadowTo
- src/modules/hooks/cage_test.go the unit tests call PostsOf and DecisionOf
- no caller outside the tests: Door.Hook, Replay, answersEvent in src/bridge/server.js and event in src/doors/log.js stand unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/cage_test.go TestPostsOfRebuildsEveryHookRow
- src/modules/hooks/cage_test.go TestPostsOfSkipsShadowAndOtherRows
- src/modules/hooks/cage_test.go TestDecisionOfReadsTheBridgesAnswer
- src/modules/hooks/cage_test.go TestDecisionOfReadsTheDoorsAnswer
- src/modules/hooks/cage_test.go TestReplayLogWritesAShadowRowForEachDifference
- src/modules/hooks/cage_test.go TestReplayLogAnswersEveryRecordedLog

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened src/modules/hooks/hooks.go (Door.Hook, Replay, Post.Old), src/bridge/server.js (answersEvent, letsThrough), src/bridge/cage-shadow.js, src/doors/log.js (event, fieldsOf), src/modules/log/log.go (RowsOf, Row) and src/scripts/log-shadow.js (the shadow row), and each claim holds there.
The callers list names the tests alone, since the change adds functions and changes none.
go test ./... is decided by the whole suite with cage_test.go in it; the replay of every recorded log by TestReplayLogAnswersEveryRecordedLog; each difference writing a shadow row by TestReplayLogWritesAShadowRowForEachDifference; ./RUNME.sh check exits 0 by the check run at tests-green.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new test fails on its assertion against the stub, and every standing hooks test passes. The draft read the rows through log.RowsOf, but no module imports another, so cage.go parses the hook rows itself: at, kind, event, answer, and the e under text. The recorded log copies the row shape src/doors/log.js event writes, since no box here holds a debug log. The PostsOf test names a Recorded type carrying the line and the stamp beside the post, and ShadowTo gets a test of its own, TestShadowToAppendsOneLineARow, past the draft's list.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Every done_when line meets a red test: go test ./... through the package, the replay of every recorded log through TestReplayLogAnswersEveryRecordedLog, each difference through TestReplayLogWritesAShadowRowForEachDifference; ./RUNME.sh check stays a checkpoint of tests-green.
The door's outside world stands on the fakes doorOver already builds, and ShadowTo writes under t.TempDir alone.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- cage-tool-block-reads-refuse: OldDecisionOf reads `result.block` as block on every event, but on `tool.call` the hook module returns `answer.result`, so the bridge refuses the call there, as `holdsForAnswer` in src/bridge/answer.js answers it. The door answers that call with a `result` effect, which NewDecisionOf reads as refuse, so the row never agrees. Pass the event to OldDecisionOf, read `result.block` as refuse outside `classic.Stop`, and add a `tool.call` row to TestDecisionOfReadsTheBridgesAnswer.
- cage-hold-lacks-door-effect: the bridge answer `needs: reply` reads as hold, and no effect under spec/design_output/model#the-effects answers a hold, so NewDecisionOf never reads hold. The `classic.Stop` row of test/replay/cage/one-refusal.shadow.jsonl stands until the protocol names the effect a hold ports to.

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
