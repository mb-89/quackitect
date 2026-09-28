---
kind: [[ticket]]
state: closed
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
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "The take of work/the-foundation-closes-its-gaps commits main's merge with conflict markers at lines 88 to 98 of spec/tickets/the-foundation-closes-its-gaps.md, so Vale fails the check and the push verb refuses every push. The door refuses an agent write to the open group ticket. On origin, delete the three marker lines, keep both record and cloud: true, and push. Did that land?"
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["landed", "not yet"]
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
group: the-foundation-closes-its-gaps
record:
  - step: design/person-1
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 55a8671f3798f48fdd45818f1333ed408f70e51d
    hash_after: 55a8671f3798f48fdd45818f1333ed408f70e51d
    def: 445cd911acc62c3a
  - step: design/draft
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 8c81093920222108260f2b16b2c3d31a798271d2
    hash_after: 8c81093920222108260f2b16b2c3d31a798271d2
    inputs:
      - name: ask
        hash: f29a7678c3fc0c35
        size: 714
      - name: [[spec/design_output/model]]
        hash: 518103d9494e50d7
        size: 9128
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: b95e12c9b38561d54f2b62ac0639b5547d0977cc
    hash_after: b95e12c9b38561d54f2b62ac0639b5547d0977cc
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q/qtest fails
    inputs:
      - name: design/draft
        hash: 9b0c0ae0accddc1f
        size: 2504
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: ask, [[spec/design_output/model]]
  - step: design/draft
    hand: box d7dfbbf7a2d0 · claude-code-remote
    hash_before: de61aff46df736e58960d56e9eff7c4f7e67a731
    hash_after: de61aff46df736e58960d56e9eff7c4f7e67a731
    inputs:
      - name: ask
        hash: 46d959dff24d2f04
        size: 892
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dfbbf7a2d0 · claude-code-remote
    hash_before: 69d8b8aa393fdf836d23f7d8b4dc089fbd0e5852
    hash_after: 69d8b8aa393fdf836d23f7d8b4dc089fbd0e5852
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q/qtest fails
    inputs:
      - name: design/draft
        hash: 86c2562aecacf92a
        size: 3833
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 127cd2274bb3aa6b01b1b8170bcd0296edc2e98f
    hash_after: 127cd2274bb3aa6b01b1b8170bcd0296edc2e98f
    inputs:
      - name: design/draft
        hash: 86c2562aecacf92a
        size: 3833
      - name: design/tests-red
        hash: 686af89acd561d42
        size: 1153
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: 5ab56d92fba07fffbc355d656a1349c6abb09434
    hash_after: 5ab56d92fba07fffbc355d656a1349c6abb09434
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: ae3db181c69ece2e076304edcd334f9e562ec878
    hash_after: ae3db181c69ece2e076304edcd334f9e562ec878
    answered:
      - name: tests
        exit: 0
        said: green, src/q/qtest passes
      - name: check
        exit: 0
        said: "src/scripts/work-answer.js:120:1: correctness/noUnusedFunctionParameters: This parameter all is unused."
    inputs:
      - name: design/tests-red
        hash: 686af89acd561d42
        size: 1153
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

`q/qtest` stands as [[spec/design_output/model#the-fake-index]] says, and `src/modules/` holds the module packages. A case feeds a module's in-ports and reads its out-ports by their local names. The fake index keeps one contract suite, run against `qtest` and the real index in process, per [[spec/design_output/model#the-fake-keeps-a-contract]].

A module tests against a fake index alone, per the owner's rule. Without the suite, the fake drifts from the index it stands for, and a green module test proves the fake.

- `go test ./...` from the root passes
- a case runs a derived provider, a fold and an action through `qtest`, by local port names
- a case reads the commits and the requests each run answers
- a case seeds a config key the way it seeds any other in-port
- the contract suite passes against `qtest` and the real index, with no port and no NATS
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## person-1

<!-- The take of work/the-foundation-closes-its-gaps commits main's merge with conflict markers at lines 88 to 98 of spec/tickets/the-foundation-closes-its-gaps.md, so Vale fails the check and the push verb refuses every push. The door refuses an agent write to the open group ticket. On origin, delete the three marker lines, keep both record and cloud: true, and push. Did that land? -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is choice -->

not yet

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

Five pieces, following spec/design_output/model#an-action-lists-requests, which renames the call of the stale draft to a request. One: src/q/action.go renames Call to Request, with Module, Verb, Args, Undo, NoUndo and Then, and Store.Act answers the list the action function returns, in place of the stub answering none. Two: src/q/qtest/qtest.go keeps the fake index as it stands: New builds the catalog off the register function and fails the test on a catalog fault. It registers files/, buffers/, cfg/ and clock/minute itself, so Seed takes a config key like any in-port. Run, Land and Act drive a derived provider, a fold and an action, and Commits reads every commit off Store.OnCommit. Act answers every request it runs, following Then with the answers the case hands it. Three: src/q/qtest/suite.go holds the contract of spec/design_output/model#the-fake-keeps-a-contract. A Harness interface names Seed, Read, Run, Land, Act and Commits, and Suite(t, open) runs every case against the harness open builds. qtest_test.go runs Suite against qtest.New. Four: src/index/contract_test.go runs the same Suite against the real index in process: a q.Store over a catalog carrying registersTopics and watchdog.Registers, the way Serve builds it, with no database, no port and no NATS. Five: src/modules/modules.go stands, so onlyq in src/imports reads a package there, and the planted modules/nosy keeps its want comment. Weighed: the suite takes a Harness over a second copy of each case, since two copies drift. Assumed: the in-process index seeds files/ through its own writer as a Content, so the suite seeds cfg/ and clock/minute alone, which both sides type alike, and leaves files/ to a later ticket naming one type in q.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/q.go: registration.act, which answers the renamed []Request,src/q/action.go: Action, ActionIn and Store.Act,src/q/action_test.go: the action case, which names Request,src/q/qtest/qtest.go: Index.Act, which answers []q.Request,src/q/qtest/qtest_test.go: the action case, which moves into Suite,src/imports/imports.go: OnlyQ, which reads src/modules,src/imports/tree_test.go: TestTheTreeHoldsTheImportRules, which reads Faults over every package

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/q/qtest/suite.go: Suite, holding a derived provider, a fold, an action with its requests and Then, the commits of a run, and a seeded config key,src/q/qtest/qtest_test.go: TestTheFakeKeepsTheContract, which runs Suite against qtest.New,src/index/contract_test.go: TestTheIndexKeepsTheContract, which runs Suite against the index in process,src/q/action_test.go: TestAnActionAnswersItsRequests,src/imports/imports_test.go: the planted modules/nosy importing os, with its want comment

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

the stale mark: the model renames the calls of an action to requests, and a request names its module in place of a door, so the approach renames Call to Request and Door to Module,the ask adds the contract suite against the real index, and a seeded config key, so the approach adds Suite, its run in src/index, and the cfg case

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/action.go,src/q/q.go,src/q/action_test.go,src/q/qtest/qtest.go,src/q/qtest/suite.go,src/q/qtest/qtest_test.go,src/index/contract_test.go,src/modules/modules.go,src/imports/imports.go,src/imports/imports_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened spec/design_output/model at the fake index, the fake keeps a contract and an action lists requests, src/q/action.go, src/q/qtest/qtest.go, src/index/door.go Serve and src/index/topic.go registersTopics, and checked each claim there
the callers come off a grep for Call, Act, OnCommit and OnlyQ over src
each done_when line names its test: go test and the check decide the first and last, Suite decides the run, the requests, the commits and the config key, and TestTheIndexKeepsTheContract decides the suite against the real index

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q/qtest

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/action_test.go,src/q/qtest/qtest_test.go,src/index/contract_test.go,src/imports/imports_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The suite runs the same cases against the fake and against the index catalog in process, and both sides fail alike: the action case answers no request, since Store.Act answers none, and the commits case reads no commit, since Store.Commit reaches no OnCommit hand. The derived provider over a seeded config key and the fold pass on both sides already. The surprise: src/index is package main, so the contract test stands in package main beside door.go. The index registers no cfg/ and no clock/minute of its own, so its harness registers the two the way the config module will once it stands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a case: Suite holds the derived provider, the fold, the action with its requests, the commits and the config key, and TestTheIndexKeepsTheContract runs it against the real index; go test and the check decide the rest as commands
the index side runs with no database, no port and no NATS, and the fake side opens no disk, so no door stands unfaked

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- files-seed-one-type: the contract suite seeds cfg/ and clock/minute alone, because the fake seeds files/ as a string and the index seeds it through its own writer as a Content; name one type for files/ in q and add a files/ case to Suite

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/q/action.go src/q/store.go src/modules/modules.go src/imports/imports.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/q/action.go, src/q/store.go, src/modules/modules.go and src/imports/imports.go and their tests, and store.go carries the listener call the seen field names
the change reaches no door: the store calls its listeners in memory, and the fake index and the index in process run the same suite
every changed file opens on a header or a pointer at spec/design_output/model
the list of outside packages stands once in src/imports/imports.go, and the model note points at the analyzer for it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/q/qtest

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

An action now answers the requests its function lists, so Store.Act hands the index and the fake the same list, and each Then reads the answers a case hands it. A commit reaches every OnCommit listener after the store lets go of its lock, so the fake index reads each commit and a listener reading a snapshot waits on nothing. The onlyq analyzer refuses a module import past q, q/qtest and the standard library packages that stay inside the process, and leaves a door import to nodoor. src/modules stands as the folder the module packages live under. The contract suite runs against qtest and against the index catalog in process, with no port and no NATS.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the four files of the change leaf and their tests, and no file the ask leaves out
the listener call and the action run in memory, and the contract suite holds the fake to the index in process
each changed file points at spec/design_output/model at the section it implements
the list of outside packages stands once in src/imports/imports.go

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
