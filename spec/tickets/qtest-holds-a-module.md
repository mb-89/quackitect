---
kind: [[ticket]]
state: open
step: design/tests-red
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
---

# Ask

`q/qtest` stands as [[spec/design_output/model#the-fake-index]] says. `src/modules/` holds the module packages, and the `onlyq` analyzer holds each one to `q`, `q/qtest` and the pure standard library. The import analyzers read the packages that stand, where today they guard folders holding no Go package.

A module tests against a fake index alone, per the owner's rule. Without the harness and the analyzer, a module reaches past the index unseen.

- `go test ./...` from the root passes
- a case runs a derived provider, a fold and an action through `qtest`
- a case reads the commits and the door calls each run answers
- a case plants a module importing `os`, and `onlyq` names it
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

Four pieces. One: q gains the action of spec/design_output/model#an-action-lists-calls, which no ticket builds yet: a Call struct (Door, Verb, Args, Undo, NoUndo, Then), and ActionIn and Action, which register a function from its input to a list of calls. Two: src/q/qtest, the fake index. New takes the test and a register function, builds a catalog, runs the catalog check and fails the test on a fault. It registers the input families files/, buffers/, cfg/, clock/minute and session/ itself, per proposal (k), and Seed commits the values a case names through those writers. Run runs a derived provider, Land folds events, and Act runs an action, hands each call the answer the case gives it, and follows Then. Commits answers every commit since the build, off a hook the store gains (Store.OnCommit). Three: src/modules/modules.go, a package that stands so the rules read a package there. Four: src/imports gains the onlyq rule in Faults and as an analyzer: a package under src/modules imports q, q/qtest and a listed pure standard library alone, and calls no time.Now. Weighed: a hook on the store over a diff of snapshots, since a diff misses a commit that lands the same value. Assumed: the action need not reach the index runner here, since the index runs no action yet.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/store.go: Store.Commit, which calls the OnCommit hook,src/imports/imports.go: Faults, which gains the onlyq rule,src/imports/tree_test.go: TestTheTreeHoldsTheImportRules, which reads Faults over every package

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/q/qtest/qtest_test.go: TestADerivedProviderRunsThroughTheFake,src/q/qtest/qtest_test.go: TestAFoldReducesTheSeededEvents,src/q/qtest/qtest_test.go: TestAnActionAnswersItsCallsAndThen,src/q/qtest/qtest_test.go: TestCommitsReadEveryCommitOfTheRun,src/imports/imports_test.go: a planted modules/nosy importing os, with its want comment,src/imports/imports_test.go: TestFaultsNameAModuleImportingOs

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/action.go,src/q/store.go,src/q/qtest/qtest.go,src/q/qtest/qtest_test.go,src/modules/modules.go,src/imports/imports.go,src/imports/imports_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened spec/design_output/model (the fake index, actions), go-doors (the build checks imports), src/q, and src/imports, and checked each claim there
the callers come off a grep for Commit and Faults over src
each done_when line names its test: go test and the check for the first and the last, the qtest cases for the run and the commits, the planted package for onlyq

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
