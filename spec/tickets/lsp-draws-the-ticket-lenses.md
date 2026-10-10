---
kind: [[ticket]]
state: closed
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: lsp-takes-the-lenses
step: view
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a040a9c44bc4 · claude-code-remote
    hash_before: f75a6492969c9b8dea1d17d0e9528da6c905f035
    hash_after: f75a6492969c9b8dea1d17d0e9528da6c905f035
    inputs:
      - name: ask
        hash: cb58743a72ffa477
        size: 1045
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a040a9c44bc4 · claude-code-remote
    hash_before: a5f3264d82c064a49a217b1f2fe88b38fef15b53
    hash_after: a5f3264d82c064a49a217b1f2fe88b38fef15b53
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/lsp fails
    inputs:
      - name: design/draft
        hash: 2216d27f4e7eebfc
        size: 2351
      - name: [[spec/design_output/lsp]]
        hash: 7b9463b115145ef1
        size: 23526
    def: 08e16d07b0de477c
  - step: gate
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: de416554c3459eef8c1b25f60d7be35139b8b448
    hash_after: de416554c3459eef8c1b25f60d7be35139b8b448
    inputs:
      - name: design/draft
        hash: 2216d27f4e7eebfc
        size: 2351
      - name: design/tests-red
        hash: 4466b101c4de7b5b
        size: 780
      - name: [[spec/design_output/lsp]]
        hash: 7b9463b115145ef1
        size: 23526
    def: dc4904ab364efa10
  - step: implement/change
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: ef904c05d6ec492fd53a2ae872005d1007cdfa7b
    hash_after: 28f0e575677b24393662c0c765197e9e82d050b5
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: bc878437196ead113eabc8b5321724caa16d5394
    hash_after: 2d091bab4653d0fbdd9931393e8a3877f79fdb48
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/lsp passes
      - name: check
        exit: 0
        said: "   82.2  in all"
    inputs:
      - name: design/tests-red
        hash: 4466b101c4de7b5b
        size: 780
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: ee29eb95da7d60778855a96c109d819e7bb0534a
    hash_after: ee29eb95da7d60778855a96c109d819e7bb0534a
    inputs:
      - name: ask
        hash: cb58743a72ffa477
        size: 1045
      - name: implement/tests-green
        hash: cee8662f5965d336
        size: 1228
    def: 561b3819e1683d37
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: every LSP editor draws the buttons over a ticket and runs them. `se-index lsp` answers `textDocument/codeLens`, and runs a press through `workspace/executeCommand`. The lens rules stand once, in Go.

<!-- breaks, as text: what breaks if it is never done -->
breaks: the buttons stand in VS Code alone. `src/extension/lib/lens.js` keeps a second copy of the hand rule the pull holds in Go.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- a Go case in `src/modules/lsp` meets each lens `lensesOf` draws today, over `textDocument/codeLens`
- a Go case meets no lens on a cloud ticket, and none on a ticket past open
- a Go case runs each press through `workspace/executeCommand` over a fake call. It meets the `ticket/pull` words the extension posts today
- a Go case meets the open buffer written to its file before a hand-back
- a Go case meets `workspace/codeLens/refresh` on a commit moving `holds/standing` or `tickets/cloud`
- a Go case meets `ticket/fill` run on `textDocument/didSave` over a ticket naming a process and no route
- `./RUNME.sh check` exits 0

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none, since a VS Code user sees the same buttons

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

The server draws the buttons over a ticket and runs their press. The extension's rules move into Go unchanged. For the shape, see [[spec/design_output/lsp#a-ticket-carries-its-buttons]].

- `src/modules/lsp/lenses.go` ports the lens rules of `src/extension/lib/lens.js` as pure functions.
- A port `Tickets` joins `Outside`: the holds, the cloud tickets, the action call, the file write, and the names.
- The listener runs a press and a save beside the frame loop, and sends their replies on the same connection.
- The lock lets go around the call, as `writes` does, since the call's commit republishes under it.
- A message carrying no method is the client's answer to a request, and draws no reply.
- `listensLSP` in `src/quack/lsp.go` fills the port off the store, the manager's call and the disk.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/main.go` `listens`, which now hands `listensLSP` the manager
- `src/quack/lsp.go` `listensLSP`, which fills the new port
- `src/modules/lsp/lsp.go` `Handle`, `Listen` and `serves`
- `src/modules/lsp/replay.go` `Replay`, which calls `Handle`
- `src/modules/lsp/features.go` `capabilities`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/lsp/lenses_test.go` `TestTheLensesFollowStateStepHoldAndCloud`
- `src/modules/lsp/lenses_test.go` `TestARouteNestsAsTheFrontmatterDoes`
- `src/modules/lsp/lenses_test.go` `TestAPressPostsTicketPullAsAPerson`
- `src/modules/lsp/lenses_test.go` `TestAFailWithNoReasonRunsNothing`
- `src/modules/lsp/lenses_test.go` `TestAHandBackWritesTheBufferFirst`
- `src/modules/lsp/lenses_test.go` `TestACommitMovingTheHoldsRefreshesTheLenses`
- `src/modules/lsp/lenses_test.go` `TestASaveFillsAPickedProcessOverAnEmptyRoute`
- `src/modules/lsp/lenses_test.go` `TestAnAnswerFromTheClientDrawsNoReply`
- `src/quack/lsp_test.go` `TestAPressAnswersAsTheIndexDoorDid`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/lsp/lenses.go`
- `src/modules/lsp/lenses_test.go`
- `src/modules/lsp/lsp.go`
- `src/modules/lsp/replay.go`
- `src/modules/lsp/features.go`
- `src/quack/lsp.go`
- `src/quack/main.go`
- `spec/design_output/lsp.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened, and each claim checked there
- the callers list names every caller of `listensLSP`, `Handle` and the capabilities
- every done_when line meets a case in `lenses_test.go`, or the check
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/lsp/lenses_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `src/modules/lsp/lenses_test.go`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion against the stubs in `lenses.go`, and every standing case passes.

The surprise: the draft's hand-back committed every file the write door wrote for this ticket, the whole rules among them. So the rules stand back as stubs for this run, and come back at the change.

The replay recording held the old capabilities, so it went red with the new initialize. The recording now carries them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a case in `lenses_test.go`, and the check line meets `./RUNME.sh check`
- the tests reach the ticket port through a fake holding the holds, the cloud tickets, the calls and the writes

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

Every done_when line meets a case in src/modules/lsp/lenses_test.go, the check line meets ./RUNME.sh check, and the wiring in a5f3264d8 runs the approach as written: the press and the save beside the frame loop, the refresh on a commit naming the two values, and the port filled off the store and the manager.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/lsp/lenses.go src/modules/lsp/lenses_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches lenses.go and lenses_test.go alone, both in the ask's size
- the ticket port reaches the actions and the disk, and the fake in lenses_test.go stands for it
- the header of lenses.go names the approach through its ticket link
- the press words and the command name stand once, in lenses.go

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/lsp/lenses_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`se-index lsp` now draws the buttons over a ticket, runs their press and fills a picked process on save. The rules port `src/extension/lib/lens.js` into `src/modules/lsp/lenses.go`, so every LSP editor gets them and the hand rule stands once in Go.

- the draft wrote the whole rules, and tests-red stood them back as stubs; the change restores them unchanged
- the lens cases carry the in-package mark, since they reach `stepsIn` and the package's helpers
- the check's types part went red on a box whose claude lays no engine types, so the fix standing on work/the-engine-fixes-its-faults rides here too, and merges as a no-op once that group lands

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches lenses.go and lenses_test.go, both in the ask's size, and the ported types fix touches `src/quack/check.go` and its tests alone, to green the check
- the ticket port is the one door the rules reach, and the fake in lenses_test.go stands for it
- the header of lenses.go points at this ticket, and `spec/design_output/lsp#a-ticket-carries-its-buttons` holds the approach
- the command name and the press words stand once, in lenses.go

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

pass

The ask names no view, since a VS Code user sees the same buttons. The box decides this person step under the cloud rule, and the lens cases stand for the read.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
