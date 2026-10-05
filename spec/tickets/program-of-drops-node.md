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
group: the-node-road-closes
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: 3e601b1d7cc9f9f54d48b2ec10962fff9e647f47
    hash_after: 3e601b1d7cc9f9f54d48b2ec10962fff9e647f47
    inputs:
      - name: ask
        hash: 3826b66824beaed9
        size: 444
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: 121e1aeb12c9a0cf93b015040bd1caddb4cf067d
    hash_after: 1a0bbc78ff0ce2c91853a87d5234df95d4ac3dfc
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: b4d544931cd8f9de
        size: 2882
    def: 08e16d07b0de477c
  - step: gate
    hand: box 89f685f4bb16 · claude-code-remote · helper-4
    hash_before: 281cc16ba5214d6552f9c1e7f29535807a2e94d4
    hash_after: 281cc16ba5214d6552f9c1e7f29535807a2e94d4
    inputs:
      - name: design/draft
        hash: b4d544931cd8f9de
        size: 2882
      - name: design/tests-red
        hash: d64454c3cfaba25f
        size: 691
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 89f685f4bb16 · claude-code-remote
    hash_before: 71df045c68f2e6a30575dccc90244b72c37eea51
    hash_after: 71df045c68f2e6a30575dccc90244b72c37eea51
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

`programOf` and the program door leave `src/quack/verbs.go`, with `verb-run.js` and the `src/scripts/verbs` folder.

The verbs then run in Go alone, and the road to node stops costing a branch a case. Until it lands, an unregistered verb still starts node, and the folder stands empty but for `verb-run.js`.

- `grep -n node src/quack/verbs.go` names no program the road starts
- `test -d src/scripts/verbs` exits 1
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

Every verb of the table registers whole in Go, so the program road answers only help, a flag-led line or a word nothing registers. 1) src/quack/verbs.go: programOf, programDoor and oldDoor leave; usageDoor(argv, errs) takes the old door's place, printing the usage for help or no verb and refusing an unknown word with exitUsage. startFault stays for check.go, and its line drops the claim that verbs run on node. 2) src/quack/twins.go nodeAccept: a word nothing registers answers an error naming it; a registered verb answers as today, in process or in a child quack road for a person. The module keeps its name, since actions call it by module. 3) src/scripts/verb-run.js leaves: roadArgv and quackArgv move into src/scripts/quack-topic.js beside quackAt; verbMain and exitsDrained move into src/scripts/probe-dry.js, their one user; verbArgv, whereOf and VERBS leave with no caller. 4) src/extension/lib/lens.js drops PROGRAMS. 5) registry.go header names no node. Assumption: the verbs slice's mode machinery stays, since a multi-word twin still reads it; its removal is a later slice.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go: verbRoad calls programDoor
- src/quack/twins.go: nodeAccept calls programOf
- src/quack/accepts.go: accepts calls nodeAccept
- src/quack/check.go: runs node tests, calls startFault
- src/scripts/work-merge.js: quackArgv
- src/scripts/work-review.js: roadArgv
- src/scripts/probe-dry.js: verbMain
- test/level0/cli-exit.test.js: exitsDrained
- test/level0/verb-run.test.js: verbArgv
- test/contract/verb-programs.test.js: VERBS, PROGRAMS

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/programs_test.go: TestAnUnknownVerbAnswersTheUsage
- src/quack/programs_test.go: TestHelpAnswersTheUsageAndZero
- src/quack/registry_test.go: an unregistered verb answers no verb through the node module
- src/quack/person_run_test.go: TestAPersonRunCarriesNoHarness, over the child road
- test/contract/verb-programs.test.js: the road to node stands nowhere

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verbs.go
- src/quack/twins.go
- src/quack/registry.go
- src/quack/programs_test.go
- src/quack/verbs_test.go
- src/quack/registry_test.go
- src/quack/person_run_test.go
- src/scripts/verb-run.js
- src/scripts/quack-topic.js
- src/scripts/probe-dry.js
- src/scripts/work-merge.js
- src/scripts/work-review.js
- src/extension/lib/lens.js
- test/level0/verb-run.test.js
- test/level0/cli-exit.test.js
- test/contract/verb-programs.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened verbs.go, twins.go, registry.go, accepts.go, check.go, verb-run.js, quack-topic.js, probe-dry.js, lens.js and every test named, and checked each claim there
- the callers list comes off a grep for programOf, programDoor, oldDoor, nodeAccept, startFault and every verb-run.js export
- grep on verbs.go is decided by the contract test reading it; test -d by the same test; ./RUNME.sh check by the check itself

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/no_program_test.go
- test/contract/node-road.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The node module today starts node on a program that stands nowhere, and the error carries the node version. The verbs folder already left the tree, so the folder line holds today and the runner line fails. The branch test verb reads the contract test, and go test shows the Go case failing on its assertion too.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the grep line and the folder line meet the contract test, and the check line meets the check run at tests-green
- the contract test drives the real disk door, and the Go case runs the node module over a temporary root with no program in it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- drops-node-tests-list: draft tests list names cases tests-red never wrote, so align it
- drops-node-size-list: size omits no_program_test.go and node-road.test.js, which tests-red added

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/cli-main.js src/scripts/probe-dry.js src/scripts/quack-topic.js src/scripts/work-merge.js src/scripts/work-review.js src/extension/lib/lens.js test/level0/cli-exit.test.js test/level0/topic-readers.test.js test/level0/probe-dry.test.js test/level0/work-merge-cloud.test.js test/level0/review.test.js test/level0/lens-v1.test.js test/contract/verb-programs.test.js test/contract/node-road.test.js src/quack/verbs.go src/quack/twins.go src/quack/main.go src/quack/registry.go src/quack/commit.go src/quack/programs_test.go src/quack/verbs_test.go src/quack/registry_test.go src/quack/person_run_test.go src/quack/ticket_twins_test.go src/quack/no_program_test.go src/modules/verbs/tree.go src/modules/verbs/ticket.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the drafted files and each reader of the gone road, and the draft names the rest
- the node module test drives the child road through a stand-in binary, and every other case runs in memory
- each new function carries a comment naming program-of-drops-node
- the main runner stands once, in cli-main.js, and quack-topic.js owns the road argv

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

The draft's size and tests lists, as the gate asks them corrected:

- size adds `src/quack/no_program_test.go`, which tests-red wrote
- size adds `test/contract/node-road.test.js`, which tests-red wrote
- tests reads `src/quack/no_program_test.go`: `TestTheNodeModuleRefusesAWordNothingRegisters`
- tests reads `test/contract/node-road.test.js`: the road starts no node program
- tests reads `test/contract/node-road.test.js`: neither the programs nor their runner stands
- tests names no `programs_test.go` case, since tests-red wrote none there
