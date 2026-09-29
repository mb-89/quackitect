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
group: lsp-door-lands-in-shadow
depends_on: ["lsp-rules-move-to-check"]
record:
  - step: design/draft
    hand: box d856596c7410d · claude-code-remote
    hash_before: c7ca9c4a10a0e57dafaef053ad4fda4b9f5e7971
    hash_after: c7ca9c4a10a0e57dafaef053ad4fda4b9f5e7971
    inputs:
      - name: ask
        hash: 415572d86f0f8025
        size: 391
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d856596c7410d · claude-code-remote
    hash_before: c2df81bbfb75d36ba982db870ea76b276dea1949
    hash_after: c2df81bbfb75d36ba982db870ea76b276dea1949
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/lsp fails
    inputs:
      - name: design/draft
        hash: ef3db5004de93f2f
        size: 2729
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: 08e16d07b0de477c
  - step: gate
    hand: box d856596c7410d · claude-code-remote · helper-3
    hash_before: 27923a8c295b1e7269f8fdb922c8553579de212f
    hash_after: 27923a8c295b1e7269f8fdb922c8553579de212f
    inputs:
      - name: design/draft
        hash: ef3db5004de93f2f
        size: 2729
      - name: design/tests-red
        hash: d9e334be86a85ddb
        size: 927
      - name: [[spec/design_output/model]]
        hash: 3e2cd8b099700681
        size: 74868
    def: dc4904ab364efa10
---

# Ask

The `lsp` IO module stands, and `quack lsp` relays the editor's stdio to it, as [[spec/design_output/model#the-editor-starts-quack-lsp]] says. It hands each request to the check module through the index.

The editor then reaches the one model.

- `go test ./...` from the root passes
- an inbound fake replays a recorded LSP session, and the IO module answers it
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

The `lsp` IO module lands as [[spec/design_output/model#the-editor-starts-quack-lsp]] says, and the editor stays on `se-lsp` until `lsp-door-switches-over` points it at `quack lsp`.

| the part | lands in | what it does |
|---|---|---|
| the registration | `src/modules/lsp/lsp.go` | the out-port family `buffers/<path...>` with `q.IO()` |
| the server | `Server.Handle` in the same file | answers `initialize` and `shutdown`. On `didOpen` and `didChange` it commits `buffers/<path>` through the store, on `didClose` it drops it, and each of the three answers `publishDiagnostics` for that path off the sweep |
| the sweep read | `Outside.Sweep`, a function `quack` hands in | reads `check/sweep` as the wiring binds it, so the module imports no other module |
| the listener | `Listen` in the same file | a loopback port behind a token, written to `.se/.runtime/lsp.json`. A connection sends the token line first, then LSP frames |
| the inbound fake | `Replay` in the same file | drives the server off a recording under `test/replay/lsp`, one message and its replies a line |
| the command | `src/quack/lsp.go` | `quack lsp` makes the index stand, reads the standing file, dials, sends the token line, and relays stdin and stdout whole |
| the wiring | `spec/wiring.yaml` and `src/quack/main.go` | the instance `lsp`, its out-port bound to `buffers/<path...>`, the check module's buffers wired to it, and the listener opened beside the hooks door and the mcp server |

The sweep settles in a wave after the commit, so the listener also publishes again for every open path when a commit moves `check/sweep`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: main, which routes the `lsp` verb
- src/quack/main.go: modules, doors and listens, which load the instance and open its listener
- spec/wiring.yaml: the instance and its wires, where `check.buffers/<path...>` stops reading its built-in value
- src/modules/check/sweep.go: sweepOf, whose buffers input now has a writer

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/lsp/lsp_test.go: TestTheReplayAnswersTheRecordedSession
- src/modules/lsp/lsp_test.go: TestAnOpenBufferWritesItsName
- src/modules/lsp/lsp_test.go: TestAClosedBufferDropsItsName
- src/modules/lsp/lsp_test.go: TestAConnectionWithoutTheTokenReadsNothing
- src/quack/lsp_test.go: TestQuackLspRelaysTheStreamWhole

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: the model chapters, the mcp and hooks modules, the store, the wiring and the quack start
- the callers list names the verb route, the module table, the listener start, the wiring and the one input the new writer feeds
- `go test ./...` meets every case, the replay case meets the recorded session line, and the check runs over the new package

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/lsp src/quack/lsp_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/lsp/lsp_test.go
- src/quack/lsp_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four module cases and the relay case fail on their own assertion: the replay meets the stub, the open buffer reads nothing, the listener stands nowhere, and the relay sends nothing. The close case passes against the stub, since a stub writing nothing leaves nothing to drop, and it guards the drop once the build writes. The fake index declares `buffers/` itself for a module that reads them, so the writer drives its own catalog through `qtest.Over`, as the config cases do.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a red case: the replay case meets the recorded session, the module and relay cases meet `go test ./...`, and the check runs over both packages
- the tests reach two doors, the listener and the relay, and each case holds its own loopback port and its own fake sweep

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The approach answers the ask: the lsp.go registration, Server.Handle, Listen, Replay, quack lsp in src/quack/lsp.go, and the lsp instance in spec/wiring.yaml and src/quack/main.go match the design output's section on the editor starting quack lsp. The listener copies mcp.Listen and hooks.Listen, which both stand on a loopback port with a token.
- Each done_when line has a decider: TestTheReplayAnswersTheRecordedSession replays test/replay/lsp/one-session.jsonl, and ./RUNME.sh test src/modules/lsp src/quack/lsp_test.go shows four module cases and the relay case failing on their own assertions. The close case passes against the stub, as seen says. ./RUNME.sh check exits 0 is a command the implement leaf answers.
- To fix in place, the diagnostic range: the recording wants end character 21, the end of the row, which follows drawsAs and unitsTo in src/lsp (UTF-16 units, per spec/design_output/lsp#a-finding-is-a-diagnostic). The approach does not name that mapping. Port it into the module, because src/lsp leaves with the-lsp-server-leaves.
- To fix in place, the close: the recording answers didClose with empty diagnostics. Have the close clear the path, and skip the sweep read the approach table names for all three.
- To fix in place, the relay: TestQuackLspRelaysTheStreamWhole has its peer read to EOF, so relays half-closes the connection (CloseWrite) at stdin's end, and only then drains the reply to stdout.
- To fix in place, the sweep read: check/sweep holds []check.Finding as the store keeps it. Outside.Sweep in quack decodes it into lsp.Finding, and Handle keeps the rows whose file is that path.
- To fix in place, the untested parts: the republish when check/sweep moves, and the quack lsp verb route (the standing file, the dial, the token), have no red case. Add a case for each at tests-green.
- To fix in place, a caller the list misses: test/contract/index.test.js copies spec/wiring.yaml, so the new lsp instance opens its listener in that fixture too. Run the contract test at tests-green.

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
