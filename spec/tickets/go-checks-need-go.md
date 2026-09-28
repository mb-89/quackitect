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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
record:
  - step: design/draft
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 00fcf573a61d16fd128e6507fd4309dedb5d4126
    hash_after: 00fcf573a61d16fd128e6507fd4309dedb5d4126
    inputs:
      - name: ask
        hash: 554bb47330e89572
        size: 356
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: af83981c19988ab82d0c9bd1389dc12b0f38363e
    hash_after: af83981c19988ab82d0c9bd1389dc12b0f38363e
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 4e285ca88c4e39a0
        size: 1962
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 9b13c38752f1f4d07ac852d9ac9efe9665f76dfb
    hash_after: 9b13c38752f1f4d07ac852d9ac9efe9665f76dfb
    inputs:
      - name: design/draft
        hash: 4e285ca88c4e39a0
        size: 1962
      - name: design/tests-red
        hash: c1a2d73285bb128f
        size: 613
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: de6790aefb9442cb2cb2b13c70223f1f5c778e55
    hash_after: de6790aefb9442cb2cb2b13c70223f1f5c778e55
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: cedf23133fdcf50532200fcae78b7f6b8b33711c
    hash_after: cedf23133fdcf50532200fcae78b7f6b8b33711c
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "src/scripts/work-answer.js:120:1: correctness/noUnusedFunctionParameters: This parameter all is unused."
    inputs:
      - name: design/tests-red
        hash: c1a2d73285bb128f
        size: 613
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

The multi-module plumbing leaves `src/scripts/cli-go.js`, and the check answers red on a box with no Go, where `goHolds` passes today.

One Go module stands now, so the plumbing reads folders that no longer answer. A check passing with no Go passes nothing.

- a case runs the Go gate on a box with no Go, and reads the refusal
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

cli-go.js drops goModulesIn and modulesUnder, since the one module stands at the root. It gains goGate(run, say, quiet), which runs go test ./... at the root through the run door it takes, and then gofmt -l src. Where run throws because no go stands on the box, goGate says so and answers 1, where goHolds answers 0 today. formatFaults drops its folder, since every path it names sits under the root. goHolds in cli-check.js keeps its name and its quiet flag, and hands goGate the outside run door, so the contract case reading its source still finds it. goFoldersOf and goEnvOf stay, since tui-build, go-source and work-test read them and no module list. Weighed: a gate taking its door over a stub of the Go binary on PATH, since the case then runs on every box. Assumed: every box the check runs on carries go, which the install verb puts there.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/cli-check.js: goHolds, goFormat,src/scripts/cli.js: the go part of the check, through goHolds,test/level0/go-tests.test.js: goModulesIn and formatFaults cases,test/level0/go-modules.test.js: the goModulesIn cases,test/contract/go-module.test.js: the one go.mod case,test/contract/cli-check-doors.test.js: the goHolds source case

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/go-tests.test.js: the Go gate on a box with no Go answers red and names the refusal,test/level0/go-tests.test.js: the Go gate runs the tests and the formatter at the root,test/contract/go-module.test.js: the tree holds one go.mod, at the root, read off the disk

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/scripts/cli-go.js,src/scripts/cli-check.js,test/level0/go-tests.test.js,test/level0/go-modules.test.js,test/contract/go-module.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened cli-go.js, goHolds and goFormat in cli-check.js, and the four test files, and checked each claim there
the callers come off a grep for every export of cli-go.js and for goHolds
the first done_when line meets the no-Go gate case, and the check decides the second

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/go-tests.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/go-tests.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both gate cases fail on their assertions, since goGate stands as a stub answering 0, which is what goHolds answers on a box with no Go today. The surprise: the formatter runs over src at the root, so the gate case pins that path, and formatFaults keeps its folder until the change drops it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets the no-Go gate case, red on its assertion, and the check decides the second
the gate takes its run door, and each case hands it a fake run, so no go binary runs

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the approach drops the module list and refuses a box with no Go through goGate, the no-Go case and the root case fail on their own assertions, and the check decides the last line. The one gap, the skip of the red Go tests, stands under Discussion for the implement to close in place.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/cli-go.js src/scripts/cli-check.js test/level0/go-tests.test.js test/level0/go-modules.test.js test/contract/go-module.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the five files of the size list, and the source case of cli-check-doors, which reads goHolds
the gate takes its run door, and each case hands it a fake run, so no go binary runs in the level0 cases
goGate and goHolds point at spec/tickets/go-checks-need-go, and the formatter line at go-code-shares-one-module
the skip stands in skipOf alone, and goHolds hands it to goGate, as the gate note under Discussion asks

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/go-tests.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check no longer walks folders for Go modules, since one module stands at the root. goGate in cli-go.js runs go test at the root with the skip of the red tests, then gofmt over src, through the run door it takes. A box with no Go now answers red and says to run the tools verb, where it passed with nothing run. goHolds keeps its name and quiet flag, and hands the gate the outside run door.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the size list and the goHolds source case alone
the gate takes its run door, and each case hands it a fake run
goGate and goHolds point at spec/tickets/go-checks-need-go
the skip stands in skipOf alone

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

The gate reads one gap the implement closes in place: `goHolds` hands `goGate` the `-skip` that `skipOf` builds off the red list, so a red Go test file stays apart while its ticket stands open. `goTestNames` in `cli-go.js` stays too, since `skipOf` and the branch test verb read it.
