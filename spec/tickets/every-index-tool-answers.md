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
group: engine-verbs-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 11f88116e7d4509bde1f65d65d65f2d9ed38fc73
    hash_after: 11f88116e7d4509bde1f65d65d65f2d9ed38fc73
    inputs:
      - name: ask
        hash: 8125ea638545e4ce
        size: 352
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 7e5d8ebd587987a1922a97f6cf3d4dbbed3554d6
    hash_after: 7e5d8ebd587987a1922a97f6cf3d4dbbed3554d6
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 46b55e4baeebd9a9
        size: 2934
    def: 08e16d07b0de477c
  - step: gate
    hand: box 57a5a484096e · claude-code-remote · helper-4
    hash_before: 6a86145f4ef57147834bd5f61eb2c92f1d718d9b
    hash_after: 6a86145f4ef57147834bd5f61eb2c92f1d718d9b
    inputs:
      - name: design/draft
        hash: 46b55e4baeebd9a9
        size: 2934
      - name: design/tests-red
        hash: a98907ffdc8c3ac2
        size: 930
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 54cbf4a63d1a885badc98b6ab4309724faeea686
    hash_after: 54cbf4a63d1a885badc98b6ab4309724faeea686
    answered:
      - name: lint
        exit: 0
        said: "  114.8  in all"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 3badeb43b0aee66ab15b6ce697ba220aa2255f28
    hash_after: 3badeb43b0aee66ab15b6ce697ba220aa2255f28
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: a98907ffdc8c3ac2
        size: 930
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

Every index tool a box sees answers its call, so no box spends a round on a tool and then on the shell.

Boxes call a listed tool, meet no handler or a refused connection, and fall back to the shell each time.

- `go test ./src/index/` passes a case where each tool that `se-index tools` lists answers a call through `act`.
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

The index lists a tool only where its manager accepts every request the action opens with. Actions stay pure, so `store.Act(name, zero input)` names those requests with no IO.

In src/index/ops.go, `Managed` gains `Accepts func(module, verb string) bool`. A nil Accepts accepts every request, so the current fakes keep their list. The door keeps it beside `one.call`.

In src/index/tools.go, `servesTools` builds the zero input through `store.Input(name, nil)`, reads `store.Act`, and skips an action whose first requests name a verb Accepts refuses. `servesActions` in src/index/actions.go applies the same skip, so the list and the routes agree. One helper, `(*door).answers(name) bool`, holds that read for both.

In src/quack/accepts.go, the switch inside `accepts` moves into `acceptsVerb(module, verb string) bool`. `accepts` calls it before it routes, so the refusal and the list read one table. `manages` in src/quack/main.go sets `Accepts` to `acceptsVerb`, widened by every module the split hands to an IO process (`split.Away`).

A second test in src/quack runs every tool `lists` prints through `acts` over `managesLive`. It names each tool that still answers `no IO module accepts`, so a gap in the real wiring turns red there.

The ask names go test ./src/index/, and src/index imports nothing of package main. So the index case runs over a fake manager and decides the line, and the quack case reads the real wiring beside it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/v1.go (*door).servesV1
src/index/door.go opensOn
src/index/ops.go (*door).manages
src/index/actions_test.go fakeManager
src/quack/main.go manages
src/quack/twin_live_test.go managesLive
src/quack/cli_test.go (manage literal handed to index.ServeManaged)
src/quack/accepts.go accepts
src/quack/main.go manages (accepts caller)
src/quack/twin_live_test.go managesLive (accepts caller)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/index/tools_test.go TestEachListedToolAnswersACallThroughAct
src/index/tools_test.go TestTheToolListSkipsAnActionNoModuleAccepts
src/quack/accepts_test.go TestAcceptsVerbReadsTheTableAcceptsRoutes
src/quack/cli_test.go TestEveryWiredToolAnswersThroughAct

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/index/ops.go
src/index/door.go
src/index/tools.go
src/index/actions.go
src/index/tools_test.go
src/quack/accepts.go
src/quack/accepts_test.go
src/quack/main.go
src/quack/cli_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

tools.go servesTools, actions.go servesActions, ops.go Managed and ServeManaged, v1.go servesV1, q/action.go Act and Input, modules/index/manager.go Serving, quack accepts.go accepts, main.go manages, cli.go lists and acts, and twin_live_test.go managesLive stand opened and read.
A grep for Managed{, servesTools, servesActions and accepts( over src gives the callers list.
The src/index done_when line is TestEachListedToolAnswersACallThroughAct, which posts each tool /v1/tools lists to /v1/actions, the route `act` posts to; ./RUNME.sh check runs the battery.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/index/tools_test.go src/quack/accepts_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/index/tools_test.go
src/quack/accepts_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The list names t/ghost beside t/add, and a call to t/ghost answers 422 with no IO module accepts, the fault the ask names. The table read answers false for every module today, since its body waits for tests-green. The draft named a fourth case calling every real tool through act. That case runs real verbs on an empty input, so tests-green reads the real catalog against acceptsVerb in its place, a pure read with no call.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The done_when line on `go test ./src/index/` meets TestEachListedToolAnswersACallThroughAct and TestTheToolListSkipsAnActionNoModuleAccepts, and the check line waits for tests-green.
The index cases run over the fake manager, and the quack case reads a pure table, so no case reaches a door past the index the package already serves.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- accepts-reads-away-modules: Managed.Away holds instance names, not module names (src/quack/io.go ioProcesses), so widening acceptsVerb by split.Away matches no module; implement/change maps each away instance to the module it serves, or the list drops tools a split process answers
- tool-list-keeps-unreadable-actions: servesTools reads store.Act over the zero input; an action whose zero input errors or names requests other inputs leave out must stay listed, and a case pins that
- real-catalog-reads-accepts: tests-red dropped TestEveryWiredToolAnswersThroughAct, yet draft/tests and draft/size still name it and src/quack/cli_test.go; tests-green adds the pure read of the real catalog against acceptsVerb it promises, or the lists drop the name
- tool-call-hook-answers: the ask names no handler and a refused connection beside the refused module; this approach answers the refused module alone, so a child carries the hook and connection causes

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: it changes the tool list and routes in src/index, and the accept table and its wiring in src/quack, which the draft names.
every door the change reaches has a fake: the index cases run over fakeManager with an Accepts of their own, and the quack cases read the real catalog with no IO.
a comment names the approach the change implements: the comments on accepted in src/index/tools.go and on acceptsVerb in src/quack/accepts.go name it.
every fact the change adds stands in one place: acceptsVerb owns the table, and the list, the routes and accepts read it.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/index/tools_test.go src/quack/accepts_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every tool the index lists now answers its call. The list and the action routes skip an action whose zero-input requests no IO module accepts, off acceptsVerb in src/quack/accepts.go, which accepts also routes by. An action the zero input cannot judge stays listed. The hook now runs act under a ten minute wait and answers a rejected run as a line, so a long hand-back no longer reads as a missing handler. Four children carried the parts: accepts-reads-away-modules, tool-list-keeps-unreadable-actions, real-catalog-reads-accepts and tool-call-hook-answers.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the files are the tool list, the routes, the accept table, the hook and their tests.
every door the change reaches has a fake: fakeManager, the hook engine fake and the real catalog read with no IO.
a comment names the approach the change implements: accepted, acceptsVerb and callsIndexTool each carry it.
every fact the change adds stands in one place: acceptsVerb owns the table and RUNNING owns the wait.

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
