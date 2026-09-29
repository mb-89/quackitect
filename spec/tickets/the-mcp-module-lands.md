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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: go-cage-lands-in-shadow
depends_on: [the-hooks-door-lands]
record:
  - step: design/draft
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 95101a01765698f1ce48b79ee4440c1c346962cb
    hash_after: 95101a01765698f1ce48b79ee4440c1c346962cb
    inputs:
      - name: ask
        hash: c47e15bb2c1c3ff9
        size: 1323
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 006e3b874404405f4090a64baf0cf6c413215710
    hash_after: 006e3b874404405f4090a64baf0cf6c413215710
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/mcp fails
    inputs:
      - name: design/draft
        hash: 7d3074c95701cd20
        size: 3605
    def: 08e16d07b0de477c
  - step: gate
    hand: box d8535e12fc10e · claude-code-remote · helper-3
    hash_before: 21e6de57fe8382a2e8f44b57495b9ec0219063fb
    hash_after: 21e6de57fe8382a2e8f44b57495b9ec0219063fb
    inputs:
      - name: design/draft
        hash: 7d3074c95701cd20
        size: 3605
      - name: design/tests-red
        hash: 09e30bdebd78c5de
        size: 1065
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d85490c97110e · claude-code-remote
    hash_before: 79a60676941b7ea26e1da63ef4c70df323893401
    hash_after: d6c53f1b8933443c060ad1f05528e04aca6d29ff
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The `mcp` IO module stands, flagged with `q.IO()`, and keeps no tool list of its own, per [[spec/design_output/model#what-each-surface-gets]]. Every action in the registry becomes a tool at start, with its name off the action's name and its description off `q.Doc`. Its input schema comes off the input type and its field tags, the source OpenAPI reads through Huma. The module adds the `wait` argument to every tool, and each tool answers within it, per [[spec/design_output/model#a-caller-sets-its-wait]]. The default wait is a config key of the IO module.

Copilot carries no function hooks, so MCP is its road to the index. A new action reaches it with no change to the MCP code, and an agent needs one call once the system runs live.

- `go test ./...` from the root passes
- an inbound fake replays a recorded MCP session, and the IO module answers it
- a case adds an action to a fake registry, and reads a new tool listed, with the MCP module unchanged
- a case reads a tool's description equal to its action's `q.Doc`
- a case calls a tool with no wait, and reads the default of a second off its config key
- a case passes a wait argument to a tool, and reads the call wait that long
- a case calls a slow tool, and reads `still running` with the fraction done, the time and the handle
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

The mcp IO module stands under src/modules/mcp, one file.

1. Registers declares the key wait, a second, with q.IO(). It keeps no tool list of its own.
2. New(Outside) reads the store's actions at start. Each becomes a tool: its name spells the action the way /v1/tools does, index_ and each slash an underscore, so one action carries one tool name on every surface. Its description is the action's q.Doc off Store.Presentation. Its input schema comes off Store.Types through a Huma registry, with the reference resolved, a bare input wrapped as the one property input, and the property wait added.
3. Server.Handle(session, body) answers one JSON-RPC message of MCP over streamable HTTP: initialize names the server and its tools capability and hands a session id, a notification answers nothing, ping answers empty, tools/list answers the tools, and tools/call runs the action through the manager's call within the wait the arguments set or the key's. A call ending within its wait answers its result as text. A call running past it answers still running, with the fraction done, the time gone by and the handle. A failing call answers isError.
4. Listen serves POST /mcp on loopback behind a token, and writes the port and the token to the runtime file mcp.json, the way the hooks door does.
5. Replay is the inbound fake: it drives Handle off a JSONL recording under test/replay/mcp, one request and its response a line, and answers each difference.
6. src/quack/main.go loads the module type mcp, and starts its listener beside the hooks door over the same manager. spec/wiring.yaml names the instance.

I assume the manager's call and its session id stand as the hooks door takes them. The schema code stands beside the one in src/index/tools.go, because the index core imports no module and a module imports no index core.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go manages and listens: start the mcp listener beside the hooks door
- src/quack/main.go hookedOf: reads an instance of a module type, now taking the type
- src/quack/main.go the modules table: names mcp
- spec/wiring.yaml: names the instance mcp

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/mcp/mcp_test.go TestTheInboundFakeReplaysAnMCPSession
- src/modules/mcp/mcp_test.go TestANewActionListsANewToolWithNoChangeHere
- src/modules/mcp/mcp_test.go TestAToolsDescriptionIsItsActionsDoc
- src/modules/mcp/mcp_test.go TestACallWithNoWaitTakesTheSecondOffItsKey
- src/modules/mcp/mcp_test.go TestAWaitArgumentSetsTheCallsWait
- src/modules/mcp/mcp_test.go TestASlowToolAnswersStillRunning
- src/modules/mcp/mcp_test.go TestTheListenAnswersAPostBehindItsToken
- src/quack/mcp_test.go TestTheWiringLoadsTheMCPModule

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/mcp/mcp.go
- src/modules/mcp/mcp_test.go
- test/replay/mcp/one-session.jsonl
- src/quack/main.go
- src/quack/mcp_test.go
- spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened: the model chapters on surfaces, operations and the inbound fake, src/index/tools.go, src/index/actions.go, src/modules/hooks/hooks.go, src/quack/main.go and go.mod, which holds Huma and no MCP library
- the callers list names every caller of the composition it changes, found by grep
- each done_when line names its test: the replay TestTheInboundFakeReplaysAnMCPSession, the new action TestANewActionListsANewToolWithNoChangeHere, the doc TestAToolsDescriptionIsItsActionsDoc, the default wait TestACallWithNoWaitTakesTheSecondOffItsKey, the wait argument TestAWaitArgumentSetsTheCallsWait, the slow tool TestASlowToolAnswersStillRunning, and go test and the check as commands

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/mcp src/quack/mcp_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/mcp/mcp_test.go
- src/quack/mcp_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion over the stub. The replay case fails on the line it wants named, since the stub answers every line as matching. The recording holds initialize, the initialized notification, a tools/call and a call naming no tool, and the tools/list line comes off the built module, read before it stands, because a Huma schema written by hand guesses its form.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test: the replay TestTheInboundFakeReplaysAnMCPSession, the new action TestANewActionListsANewToolWithNoChangeHere, the doc TestAToolsDescriptionIsItsActionsDoc, the default wait TestACallWithNoWaitTakesTheSecondOffItsKey, the wait argument TestAWaitArgumentSetsTheCallsWait, the slow tool TestASlowToolAnswersStillRunning, and go test and the check as commands
- the doors the tests reach are the manager call, faked in the case, and the loopback listen, which the listen case drives for real

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- hooked-of-caller-missed: the draft changes `hookedOf` to take the module type. Its callers list misses `src/quack/hooks_test.go`, whose line 33 calls it, so the implement step changes that caller too.
- tool-surface-moves-into-q: the tool name, the Huma input schema, the wait read and the still running line stand in `src/index/tools.go` and `src/modules/hooks/hooks.go` already. The draft writes a third copy in `src/modules/mcp`. Move the shared piece into `src/q`, which the index core and every module import.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/mcp src/quack/main.go spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, and src/q/tool through the gate point that moved the shared piece there
- the door the change reaches, the loopback listen, stands driven for real in the listen case, and Replay is the inbound fake over a recording
- the head of src/modules/mcp/mcp.go names the approach, and each function links its section
- every fact stands once: the tool name, schema, wait and running line come from src/q/tool, and the standing file path stands in the module alone

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

- Each tool also takes its output schema off `Presentation.Out`, the fields `q.Answers` declares for its action. `actions-answer-over-http` carries the same for OpenAPI, and no surface reads it for MCP yet.
