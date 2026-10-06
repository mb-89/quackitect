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
group: unfaked-doors-take-fakes
depends_on: git-and-process-doors-designed
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 4f5c268fe7e0d58aef6ba11b80ec9c0505523b26
    hash_after: 4f5c268fe7e0d58aef6ba11b80ec9c0505523b26
    inputs:
      - name: ask
        hash: 991e2455b4efe785
        size: 656
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 14db272a679bab786236d52def86bc8a04e0adf0
    hash_after: 14db272a679bab786236d52def86bc8a04e0adf0
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/proc fails
    inputs:
      - name: design/draft
        hash: aa8ef2545de3a91d
        size: 3995
    def: 08e16d07b0de477c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The lsp tools spawn through the one process door, so a case teaches `FakeRunner` and the contract suite holds the lsp spawn to the real thing.

<!-- breaks, as text: what breaks if it is never done -->
The lsp module keeps a `Runner` of its own with no env and no exit code, so the tree carries two process doors, and the lsp fake answers no contract.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/modules/lsp/tools.go` holds no `Runner` type, and its runs of Vale and Biome go through the `Runner` in `src/proc`
- the halt and the wait on a tool run stand on the process door, and `src/proc/proc_contract_test.go` holds a case for each
- `./RUNME.sh branch test src/modules/lsp/tools_test.go` stands green
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
none

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

The process door takes the two things the lsp runner holds and the door lacks: a halt that ends every run in flight, and a wait that ends one run. The lsp module then drops its own `Runner` and runs Vale and Biome through `proc.Runner`.

The door gains these parts in `src/proc/proc.go`:
- `Command` gains `Wait`, a span past which the run ends with a fault. A zero `Wait` lets the run take as long as it takes.
- `Halting()` answers a real `Runner` and a halt. The runner runs each command under one shared life, through `exec.CommandContext`, so the halt ends every run in flight. A run the halt reaches, or one past its `Wait`, answers a nonzero code and an error. A run after the halt answers `NotStarted`.
- `Real` stays, as a runner whose life never ends.
- `FakeRunner` gains `Halted`, which the fake's own `Halt` sets, and `After`, the timer a wait arms through. A run after the halt answers `NotStarted`. A program the fake runs takes the command, and a taught program that waits reads a channel the fake closes at the halt or the wait.

The lsp module moves:
- `Runner` leaves `src/modules/lsp/tools.go`, and `Tools.Run` takes `proc.Runner`.
- `valeRun` and `biome` build a `proc.Command` with the folder, the input and `Wait: toolWait`. A run answering no output and a nonzero code reads as the fault it reads today.
- `ToolsAt` takes its runner and its halt from `proc.Halting`. `runsUntilHalt` and `runsIn` leave `src/modules/lsp/door.go`, and so does `os/exec` there.
- `fakeTools` in `src/modules/lsp/tools_test.go` becomes a `proc.FakeRunner` taught `vale` and `biome`, with a table of answers and a record of calls.
- `src/modules/lsp/door_test.go` leaves. Its claim, that a halt ends a running tool, moves into the process contract, which runs it on both runners.

The moves table row for this ticket already names the halt and the wait. The family table's row for a tool's process, now on `src/modules/lsp` and `door_test.go`, moves onto the process door and its suite.

I weighed keeping the halt in the lsp module, wrapping `proc.Real` in a goroutine. I refuse it: a wrapper cannot kill the process it waits on, so the halt would leave the tool running, which the index's stop forbids. The cost: the process door grows a life and a wait that only the lsp module needs today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/modules/lsp/door.go` `ToolsAt`
- `src/modules/lsp/door.go` `runsUntilHalt`
- `src/modules/lsp/door.go` `runsIn`
- `src/modules/lsp/tools.go` `Runner`
- `src/modules/lsp/tools.go` `Tools`
- `src/modules/lsp/tools.go` `valeRun`
- `src/modules/lsp/tools.go` `biome`
- `src/modules/lsp/lsp.go` the stop calling `tools.Halt`
- `src/quack/verb_lint.go` the lint calling `tools.Halt`
- `src/modules/lsp/tools_test.go` `fakeTools`
- `src/modules/lsp/door_test.go` `TestAHaltEndsARunningTool`
- `src/proc/proc.go` `Command`
- `src/proc/proc.go` `FakeRunner.Run`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/proc/proc_contract_test.go` `TestAHaltEndsARunInFlight`
- `src/proc/proc_contract_test.go` `TestARunAfterTheHaltNeverStarts`
- `src/proc/proc_contract_test.go` `TestARunPastItsWaitEndsWithAFault`
- `src/modules/lsp/tools_test.go` `TestTheToolsRunThroughTheProcessDoorWithTheirWait`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/proc/proc.go
- src/proc/proc_contract_test.go
- src/modules/lsp/door.go
- src/modules/lsp/door_test.go
- src/modules/lsp/tools.go
- src/modules/lsp/tools_test.go
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened `src/modules/lsp/door.go`, `tools.go`, `tools_test.go`, `door_test.go`, `src/proc/proc.go` and its suite, and the process door section of `spec/design_output/doors.md`. `Halt` callers stand in `lsp.go` and `verb_lint.go`, and keep their call.
- The callers come off a search for `Runner`, `Run(`, `runsUntilHalt` and `Halt()` under `src`.
- Done_when one meets `TestTheToolsRunThroughTheProcessDoorWithTheirWait`, two meets the three process contract cases, three meets `./RUNME.sh branch test src/modules/lsp/tools_test.go`, and four is the check.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/proc/proc_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/proc/proc_contract_test.go
- src/modules/lsp/tools_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The three process cases fail on both runners: a run outlasts its halt and its wait, and a run after the halt still answers. The lsp case fails on Wait alone, since an adapter in the test carries the folder and the input onto the door but no wait. A killed sh leaves its sleep holding the output pipe, so the real case runs exec sleep. A killed process reads code -1, the same as NotStarted, so implement writes the error itself.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

done_when one and three meet TestTheToolsRunThroughTheProcessDoorWithTheirWait in src/modules/lsp/tools_test.go, done_when two meets the three process contract cases, and done_when four is the check
the one door the tests reach is the process door, and FakeRunner stands beside the real runner in every case

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
