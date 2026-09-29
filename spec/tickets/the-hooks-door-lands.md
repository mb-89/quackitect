---
kind: [[ticket]]
state: open
step: implement/tests-green
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
record:
  - step: design/draft
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 2a25bcd4c35b0dd43a1af7601f93f33807e8ed73
    hash_after: 2a25bcd4c35b0dd43a1af7601f93f33807e8ed73
    inputs:
      - name: ask
        hash: 4b7bc5b678c5a5fe
        size: 736
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 934c404143020d0f22c7fd1c57ce248ae799ad54
    hash_after: 934c404143020d0f22c7fd1c57ce248ae799ad54
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 5bd1b3f69468c7ec
        size: 4133
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8535e12fc10e · claude-code-remote · helper-3
    hash_before: 64a6d438d76b59d677219c91a8117305ad166bcb
    hash_after: 64a6d438d76b59d677219c91a8117305ad166bcb
    inputs:
      - name: design/draft
        hash: 5bd1b3f69468c7ec
        size: 4133
      - name: design/tests-red
        hash: 29670034f5135614
        size: 1196
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: f463b77e63913ab33e256f8700ce61752c1a8e38
    hash_after: f463b77e63913ab33e256f8700ce61752c1a8e38
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The `hooks` IO module stands under `src/modules/hooks`, flagged with `q.IO()`, and writes `session/<id>/events`. The fold modules answer `session/`, and the cage answers each event beside the bridge server.

Every cage rule after this one runs on it.

- `go test ./...` from the root passes
- an inbound fake replays a recorded hook event, and `session/<id>/events` holds it
- the IO module's test runs over `qtest` and its inbound fake
- a case calls an action with no wait, and reads the default of a second off its config key
- a case ends an operation after its call answers, and reads the result in the session's next turn
- a case ends a turn with an operation running, and reads the Stop hook name it
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

The hooks IO module lands beside the bridge, which keeps answering.

1. `src/q/event.go` declares `q.Event` (seq, at, kind, harness, hand, fields) and `q.Hand`, per the model's chapter The events of a session. `Store.Folds(prefix)` in `src/q/store.go` answers the fold names a prefix reaches.
2. `src/modules/hooks/hooks.go` is one file: `Registers` declares the out-port `events/<id>` with `q.IO()` and the config key `wait`, a second. `Door.Hook(post)` stamps the event, commits it, lands it on every `session/<id>/` fold, and answers effects. An `index_` tool call runs its action through the manager's call, with the post's wait or the key's. An operation of the session that ends after its call answers rides the next post as an `after` block, once. A Stop names each operation still running, with its fraction and time, and passes. `Listen` serves `POST /hook` on loopback and writes `.se/.runtime/hooks.json`. `Replay` is the inbound fake: it drives the door off a JSONL recording under `test/replay/hooks` and answers each difference.
3. `src/modules/session/session.go` holds the folds `<id>/fill` and `<id>/last`, which the instance `session` binds under `session/`.
4. `manager.Served` answers the session's operations beside the stop and the call, and `Serves` wraps it.
5. `src/quack/main.go` loads `hooks` and `session`, and starts the door beside the manager with the hooks instance's writer. `spec/wiring.yaml` wires `hooks.events/<id>` to `session/<id>/events`.
6. The migration module adds the slice `cage`, built-in `old`, and `spec/config/level0.json` sets it to `shadow`, with its schema entry.
7. In `answersEvent`, the bridge posts the event and its own decision to the hooks port while the key reads `shadow`. It awaits nothing, and a failure passes. Decisions meet as shadow rows in cage-rules-replay-session-logs.

I assume the session id rides `e.session.id`, `e.sessionId` or `e.session_id`, the spellings `pull.js` reads.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go main: loads the hooks and session module types, and hands the hooks writer to manages
- src/quack/main.go manages: starts the hooks door over manager.Served
- src/quack/main.go load and wired: answer the writer of each instance
- src/modules/index/manager.go Serves: wraps the new Served
- src/modules/index/manager_test.go and call_test.go: call Serves, unchanged
- src/modules/migration/migration.go Registers: the cage slice joins its table
- src/modules/migration/migration_test.go: reads every slice key
- src/q/store.go Folds: called by src/modules/hooks/hooks.go Door.Hook
- src/bridge/server.js answersEvent: forwards the shadow copy
- src/bridge/server.js boxOf: carries the http door
- test/level0/*.test.js cases calling answersEvent and boxOf

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/hooks_test.go TestReplayWritesTheEvents
- src/modules/hooks/hooks_test.go TestTheDoorRunsOverQtest
- src/modules/hooks/hooks_test.go TestACallTakesTheDefaultWait
- src/modules/hooks/hooks_test.go TestAnEndedOperationReachesTheNextTurn
- src/modules/hooks/hooks_test.go TestTheStopNamesRunningOperations
- src/modules/session/session_test.go TestTheFoldsReadTheEvents
- src/q/store_test.go TestFoldsUnderAPrefix
- src/modules/index/manager_test.go TestServedAnswersTheSessionOps
- test/level0/cage-shadow.test.js the bridge posts the event beside its answer in shadow

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: q.go, store.go Land, action.go, send.go, qtest.go, manager.go Serves, call.go, ops.go, quack main.go manages/load/wired, wiring.go Bound, migration.go, level0.json, server.js answersEvent/boxOf, doors/http.js, level0.js post body, pull.js session spellings
- the callers list names the Go and JavaScript callers of each changed function, found by grep
- go test ./... decides by the whole suite; the replay line by TestReplayWritesTheEvents; qtest by TestTheDoorRunsOverQtest; the default wait by TestACallTakesTheDefaultWait; the next turn by TestAnEndedOperationReachesTheNextTurn; the Stop by TestTheStopNamesRunningOperations; ./RUNME.sh check by the check itself

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks src/modules/session src/q src/modules/index test/level0/cage-shadow.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/hooks_test.go
- src/modules/session/session_test.go
- src/q/store_test.go
- src/modules/index/ops_test.go
- test/level0/cage-shadow.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every Go case fails on its own assertion over stubs, and the listen case fails reading the standing file the stub never writes. branch test ran the JavaScript case alone, so the Go folders ran through go test directly. Two JavaScript cases pass on the stub already, the post-nothing case and the refusal case, since a stub that posts nothing holds both; the shadow case carries the red.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test: the replay line TestTheInboundFakeReplaysARecordingOverQtest, qtest and the inbound fake the same case, the default wait TestACallTakesTheDefaultWaitOffItsKey, the next turn TestAnOperationEndingAfterItsCallReachesTheNextTurn, the Stop TestTheStopNamesEveryOperationStillRunning; go test ./... and the check stand as commands
- the door the tests reach is the manager call and book, faked in the case, and the http door, faked by src/doors/fake/http.js

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- hooks-draft-matches-red-tests: the draft names manager.Served, Serves and test names the red tests lack; the red tests stub Book.Of in src/modules/index/call.go (ops_test.go TestOfAnswersEveryOperationOfTheCaller) and carry other hooks, session and store test names, so the builder follows the red tests, and the callers list adds call.go Book.Of and src/bridge/cage-shadow.js shadowsCage, which server.js answersEvent calls
- hooks-standing-file-names-token: model The hook protocol says the standing file names the port and the token; Listen writes and the listen case reads the port alone, so any local process posts to /hook
- hooks-at-reads-clock-module: model The events of a session takes at off the clock IO module; the door reads Outside.Now, a clock of its own
- hooks-wait-leaves-tool-input: the call's wait rides the tool input's wait key, which clashes with an action carrying a wait field of its own; strip it before the call, or carry it beside the input
- hooks-listener-joins-io-process: the draft starts the listen in quack main beside the manager, and the model's IO process chapter places inbound listeners in quack io; name the interim in the approach
- hooks-listen-case-fails-assertion: TestTheListenAnswersAPostAndStandsItsPort stands red on a t.Fatal over a missing file, not its own assertion
- cage-slice-past-the-ask: the migration slice cage, migration_test.go, spec/config/level0.json and its schema entry lie past the ask's files; the shadow line of the ask carries them, so they ride with the build

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/hooks src/modules/session src/quack/main.go src/quack/hooks_test.go src/q/store.go src/q/event.go src/modules/index src/bridge/cage-shadow.js src/bridge/server.js test/level0/cage-shadow.test.js spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, and the answered findings add the token, the clock and the wait field
- every door the change reaches has a fake: the manager call and book, the fake http door, and the replay
- a comment on each function points at the ticket or the model section it implements
- the standing file, the slice key and the wait key each stand in one place, and the bridge takes the folder off folders.js

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
