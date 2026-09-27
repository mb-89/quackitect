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
step: design/tests-red
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [ops-keeps-one-state]
record:
  - step: design/draft
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: f6f9f0ae66a91bd07e9deba7f90632e4ee7776a1
    hash_after: f6f9f0ae66a91bd07e9deba7f90632e4ee7776a1
    inputs:
      - name: ask
        hash: 17806c17b7526713
        size: 965
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
---

# Ask

Every call of an action takes a record, `ops/<id>`, and carries the wait its caller sets, per [[spec/design_output/model#a-caller-sets-its-wait]]. A call ending within the wait answers the result. One running past it answers `still running`, with the handle, the fraction done and the time gone by.

The split between `q.Action` and `q.Op` then leaves, and an author guesses no length. An agent holds no handle, because `ops/wait` with none waits on its session's open operations.

- `go test ./...` from the root passes
- `q.Op` and the field `Declared.Op` stand nowhere under `src`, which `grep -rn 'Op()' src/q` shows
- a case calls a quick action, and reads the result within the wait
- a case calls a slow action with steps, and reads `still running`, the handle and the fraction done
- a case calls `ops/wait` with no handle, and reads the session's open operations end
- `watchdog.deadlineOp` folds into `watchdog.deadlineAction`
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

Five pieces, following spec/design_output/model at a caller sets its wait, the agent does not poll, the handle is a name and the states.

One, the split leaves: q.Op, the registration field op and Declared.Op go from src/q. An action declares q.Deadline and q.Writes alone.

Two, src/ops/call.go adds Call(book, store, name, input, caller, wait, accept), which answers an Answer. Call starts the operation in the book with the action's Declared. It runs the action on a goroutine through Store.Send of io-modules-own-their-names, or through Store.Act where Send stands unbuilt, and ends it with Finish or Fail. It then waits through the wait. An operation ending within the wait answers its result. One running past it answers Running true, with the handle, the fraction done and the time gone by. The runner counts progress itself: each request answered moves Progress.Done, and each list Then answers adds to Progress.Known. So an action with no steps answers the time gone by alone.

Three, the book wakes its waiters: Book.Wait(id, span) answers the operation once it ends or the span runs out, over a channel each move closes. Book.Progress(id, done, known, step) records the step and pushes the move. Book.Open(caller) answers the session's operations standing queued or running. Book.WaitCaller(caller, span) waits on all of them, which ops/wait with no handle answers.

Four, spec/config/level0.json and its schema drop watchdog.deadlineOp. watchdog.deadlineAction takes its 600 seconds and the help line: the span an action's operation ends within. ./RUNME.sh project writes the slash command projections again, so se-config-watchdog-deadlineOp leaves.

Five: the tests ride a fake accept, which answers each request at once or blocks until the case lets it go. The book runs over the memory keep the ops tests use and a clock the case moves.

Weighed: the runner counts the requests as the fraction done, against a progress call from the module. A module names requests and reaches nothing, so the index alone sees the steps. Assumed: each surface's default wait comes with its IO module, the hooks, MCP and HTTP, so Call takes the wait its caller hands. The Stop hook's line comes with the hooks module in phase 5.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/q.go: Op and registration.op, which leave
src/q/store.go: Declared and Store.Declared, which drop Op
src/q/store_test.go: TestAnActionDeclaresItsHandleAndItsWrite
src/ops/ops.go: Book.Start, move and end, which wake the waiters
src/ops/ops_test.go: the writer and reader declarations
src/index/v1.go: valueOf, which reads Store.Declared
spec/config/level0.json and spec/config/level0.schema.json: watchdog.deadlineOp

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/ops/call_test.go: TestAQuickCallAnswersItsResultWithinTheWait
src/ops/call_test.go: TestASlowCallAnswersStillRunningWithItsHandleAndFraction
src/ops/call_test.go: TestAFailingCallAnswersItsReason
src/ops/call_test.go: TestWaitWithNoHandleWaitsOnTheSessionsOpenOperations
src/ops/call_test.go: TestTheConfigHoldsOneActionDeadline, reading spec/config/level0.json through src/config for no watchdog.deadlineOp
src/q/store_test.go: TestAnActionDeclaresItsDeadlineAndItsWrite, in place of the handle case

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/q.go
src/q/store.go
src/q/store_test.go
src/ops/ops.go
src/ops/call.go
src/ops/call_test.go
src/ops/ops_test.go
spec/config/level0.json
spec/config/level0.schema.json
.claude/commands/se-config-watchdog-deadlineOp.md, which the projection removes

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened spec/design_output/model at a caller sets its wait, the agent does not poll, the handle is a name, the states and deadlines, src/q/q.go Op, src/q/store.go Declared, src/ops/ops.go Book, src/index/v1.go and spec/config/level0.json, and checked each claim there
the callers come off a grep for Op(), Declared, deadlineOp and deadlineAction over src, spec/config and .claude
each done_when line names its test: the three call cases and the wait case decide the calls, a grep for Op() over src/q decides the split, TestTheConfigHoldsOneActionDeadline decides the fold, and go test and the check decide the first and last

## tests-red

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
