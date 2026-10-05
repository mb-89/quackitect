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
group: the-check-fits-its-budget
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box ce27714b7c6d · claude-code-remote
    hash_before: 1aa2468496c55855f3e504c74477a8284c96ede2
    hash_after: 292d955659e93fbf84dd34941a094522ad234e4a
    inputs:
      - name: ask
        hash: 0a0b05c325cb5bf4
        size: 1035
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box ce27714b7c6d · claude-code-remote
    hash_before: 16ab2a25b8d545801a0ddea0df1ca921c74e52d9
    hash_after: 16ab2a25b8d545801a0ddea0df1ca921c74e52d9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: de831620df1416e4
        size: 2049
    def: 08e16d07b0de477c
  - step: gate
    hand: box ce27714b7c6d · claude-code-remote · helper-4
    hash_before: af3af79f49d784ea7d4d7e0eec9514c4f811179e
    hash_after: af3af79f49d784ea7d4d7e0eec9514c4f811179e
    inputs:
      - name: design/draft
        hash: de831620df1416e4
        size: 2049
      - name: design/tests-red
        hash: 6b15b62b0ab55396
        size: 784
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Every push and every hand-back waits on `./RUNME.sh check`, and since the verbs moved into Go packages the go part of its battery spends most of the run, past `battery.budget`. This ticket finds where the go part spends time it need not spend, and cuts it. The owner's rule holds: the expensive tests run against the doors once, a fake door stands in everywhere else, and a duplicate case merges into one. No test is skipped, disabled or quarantined.

- gain: the check fits its budget again, so a push and a hand-back wait on the tests alone
- breaks: every box waits minutes past the budget on each check, and the budget reads red on a fresh box
- done_when: `./RUNME.sh check` on a warm box reads `battery.total` under `battery.budget` in `.se/.runtime/check.json`
- done_when: `battery.parts.go` in `.se/.runtime/check.json` reads lower, cold and warm, than the measure before, both under Discussion
- done_when: `./RUNME.sh branch test` passes on every test file the change moves to a fake door or merges
- view: none
- from: none

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

The measure decides the approach, and the Discussion carries its numbers. A warm check spends seconds on go, because Go caches each package's result. A fresh box pays the whole go part, and so does any edit the tree takes, since TestTwinGoldens opens every tracked file and so reruns all of src/quack. The go part's span is its slowest package, because a package runs its tests one after another unless they say t.Parallel. src/branches holds that span: each test builds a real origin and clone. So the heavy packages' tests run beside each other, as rule 9 of spec/guidance/code/testing asks. A test reaching t.Setenv or t.Chdir stays serial, and the one Setenv in src/branches moves onto the fixture's own git env. A branches fixture turns off git's auto gc and maintenance, which spent processes after every fetch and commit. Each analyzer of the imports case loads its tree as a parallel subtest. No test leaves the run, and every case asserts what it asserted before. The race detector and shuffled repeats decide that the parallel tests share no state.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go goGate, which runs go test over every package
- src/branches/tree_test.go newTree and tree.sh, which every branches test calls
- src/branches/port_a_take_test.go paHandOver, which set the git dates through the process env

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/parallel_test.go TestEveryBranchesTestRunsBesideTheOthers

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/*_test.go
- src/quack/*_test.go
- src/imports/*_test.go
- spec/tickets/the-check-fits-its-budget.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: goGate and batteryRun in src/quack/check.go, newTree, sh and paHandOver in src/branches, the Doors run in src/branches/doors.go, TestTwinGoldens, and the imports analyzer test
- callers: every branches test reaches tree.sh through newTree, and goGate alone runs the Go tests in the check
- done_when: the check's battery.total and battery.parts.go in .se/.runtime/check.json decide the first two, and branch test over the moved test files decides the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/serial_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/imports/serial_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The guard names every src/pull test, because none calls t.Parallel. It names nothing in src/branches, src/quack or src/imports, where the change already stands, and its own planted case passes. The surprise is the size of the gap. Alone, src/branches runs in 50 seconds and src/quack in 34. Inside the full run, with every package competing for four cores, they ran far longer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the guard decides the parallel runs, the check's battery decides the budget and the go part, and the Discussion holds the measure
- doors: the guard parses source off the disk in a tree test, as TestTheTreeHoldsTheImportRules loads it, and it reaches no other door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- check-budget-measure-before: the Discussion stands empty, though the approach says it carries the numbers. done_when 2 compares battery.parts.go against the measure before, cold and warm, so take that measure at 63c619f0d and write it under Discussion before implement lands.
- check-budget-size-names-pull: the guard in src/imports/serial_test.go names src/pull among slowPackages, and src/pull's tests are its only red, yet size names no src/pull file and no src/imports/serial.go. Add src/pull/*_test.go and src/imports/serial.go to size.
- check-budget-tests-list: the draft's tests list names src/branches/parallel_test.go TestEveryBranchesTestRunsBesideTheOthers, which stands nowhere. The guard stands in src/imports/serial_test.go as TestATestRunningAloneWithNothingBarringItIsNamed and TestTheSlowPackagesRunEveryTestBesideTheOthers, so fix the list.
- check-budget-race-run: the approach rests on the race detector and shuffled repeats to show the parallel tests share no state, and goGate runs neither. Name that command, and put its result under implement/tests-green.

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

## The measure before

The box is a fresh cloud container with four cores. The tree stands at bcafef356, the commit that opens this ticket, and it carries the code of 63c619f0d unchanged. The parts come off `battery.parts` in `.se/.runtime/check.json`, in milliseconds. The first run found a Go cache the box image left half full, and the second run follows it with nothing changed.

| part | first run | second run |
|---|---|---|
| go | 95210 | 15274 |
| level0 | 52702 | 47373 |
| tests | 34357 | 36264 |
| rules | 29947 | 47856 |
| plugin | 1300 | 1873 |
| projections | 241 | 443 |
| total | 161073 | 101731 |

A third run with every Go package cached read a total of 67621, the go part 7378.

The Go tests alone, `CGO_ENABLED=0 go test -tags contract ./...`, in seconds:

| run | seconds |
|---|---|
| a fresh `GOCACHE`, compile and run | 237 |
| builds cached, `-count=1` | 188 |

The packages under `-count=1`, each one's span in seconds, alone and inside the full run:

| package | alone | in the full run |
|---|---|---|
| `src/branches` | 50.5 | 185.3 |
| `src/quack` | 34.5 | 81.2 |
| `src/imports` | 14.0 | 24.3 |
| `src/index` | 13.6 | 18.4 |
| `src/pull` | 5.3 | 7.9 |

A package runs its tests one after another, so its span is their sum. `src/branches` builds a real origin and clone for each of its tests. `TestTwinGoldens` opens every tracked file, so an edit anywhere in the tree reruns the whole of `src/quack`.

## The skip turns the cache off

Go caches no test result of a run carrying `-skip`. Two runs of `go test -skip '^TestNothing$' ./src/yaml` both run, where two runs under `-run` answer the second from the cache. The check passes `-skip` for the red list, so while a ticket stands between tests-red and tests-green, every package reruns on every check. On this branch, with the guard on the red list, two checks in a row read go at 64.3 and 59.4 seconds, totals 135.6 and 125.9.
