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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [io-modules-own-their-names]
record:
  - step: design/draft
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 4dce973c740021fb08485246d93cfcaa32b0bf5f
    hash_after: 4dce973c740021fb08485246d93cfcaa32b0bf5f
    inputs:
      - name: ask
        hash: 32dff8229e6ea3bf
        size: 741
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 88bcb0ee1ddb6c486fe341b923ce29372467a3c9
    hash_after: 88bcb0ee1ddb6c486fe341b923ce29372467a3c9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: 5c3d72c7578d0e01
        size: 2340
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: a3a981c96dfcbb08baa7e3557a5e5744d67b2d07
    hash_after: a3a981c96dfcbb08baa7e3557a5e5744d67b2d07
    inputs:
      - name: design/draft
        hash: 5c3d72c7578d0e01
        size: 2340
      - name: design/tests-red
        hash: bce2b59d1790ecde
        size: 795
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 7890d331bbc6842ae9a4d71ea1bffa00ede5339f
    hash_after: 7890d331bbc6842ae9a4d71ea1bffa00ede5339f
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The import analyzers become the ones [[spec/design_output/model#the-build-checks-imports]] names: `onlyq`, `ioonly`, `fakesuite` and `nomodule`. They read a package's flag off its `q.IO()` registration, and `nodoor` and `noname` leave.

A module without the flag then reaches the outside nowhere. A fake with no contract suite beside it fails the build, `q/qtest` among them.

- `go test ./...` from the root passes
- a case plants a module without the flag importing `os`, and `onlyq` names it
- a case plants an IO module importing `os`, and no analyzer names it
- a case plants a fake with no suite beside it, and `fakesuite` names it
- a case plants a module importing another module, and `nomodule` names it
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

The analyzers in `src/imports/imports.go` become the four the model names, and the tree test runs all four.

1. `nodoor` leaves, with its rule and its case. `noname` stands nowhere in the code, so nothing leaves for it.
2. `onlyq` keeps the flag cut `io-modules-own-their-names` lands: `CarriesIO` reads a `q.IO()` call, and `FaultsIn` passes a flagged package. It refuses a call to `time.Now` in a module without the flag too, which a new check over the syntax finds.
3. `ioonly` is new. It refuses an import of `os`, `os/exec`, `net` or `net/http`, and a call to `time.Now`, in `src/q` and in a renderer. `src/index` stands outside it, as the model says.
4. `fakesuite` is new. A package declaring a type or function named `Fake` and more needs a file ending `_contract_test.go` beside it, and `q/qtest` needs its `suite.go`. It reads the file names of the package, so the tree test loads them.
5. `nomodule` stands as it is.

A call check reads the syntax, so `Faults` keeps the import rules and a new `CallFaults(from, files)` answers the call rules. The tree test runs both over every package.

The Vale rules `DoorsOnly`, `FakeDoorsInTest` and `OutsideInDoors` leave the Go code. A `[*.go]` section in `.vale.ini` switches them off, and the per-file sections the IO modules and the root took leave.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/imports/tree_test.go: TestTheTreeHoldsTheImportRules, which runs every analyzer
src/imports/imports_test.go: the planted cases, which take the new analyzers
.vale.ini: the Go sections of the three Vale rules

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: `go test ./...` from the root
src/imports/imports_test.go: TestAModuleImportingOsIsNamed, which stands
src/imports/imports_test.go: TestAnIOModuleImportingOsIsNamedByNone
src/imports/imports_test.go: TestAFakeWithNoSuiteIsNamed
src/imports/imports_test.go: TestAModuleImportingAModuleIsNamed, which stands
src/imports/imports_test.go: TestTheCoreImportingOsIsNamed
RUNME.sh: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/imports/imports.go
src/imports/imports_test.go
src/imports/tree_test.go
.vale.ini

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened `imports.go`, its tests, the tree test and `.vale.ini`, and checked each claim there, `noname` among them
I grepped every user of the analyzers across `src`, and the list names each
each done_when line names its test above, or a command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/analyzers_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/imports/analyzers_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion: the stub analyzers report the package as unbuilt, so the planted IO module draws diagnostics and the want lines find none. The surprise: a contract test file beside a module makes the harness build the generated `disk.test` main, and `onlyq` and `nomodule` name it. The implement skips a package whose path ends in `.test`, as the tree test does.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each done_when line meets a case: the IO module over every analyzer, the fake with no suite, and the core importing os each in `analyzers_test.go`, and the module cases standing in `imports_test.go`
the cases plant their packages in a folder of the test, so they reach no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the draft names TestAnIOModuleImportingOsIsNamedByNone, TestAFakeWithNoSuiteIsNamed and TestTheCoreImportingOsIsNamed in imports_test.go, and they stand in analyzers_test.go: the builder aligns the draft lines
- the approach adds a call rule for time.Now to onlyq and ioonly, and no case plants a call: the builder plants one for each, or leaves the call rule out
- the ask holds q/qtest to fakesuite through its suite.go, and no case plants qtest without it: the builder plants that case

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/imports/imports.go src/imports/imports_test.go src/imports/tree_test.go src/imports/analyzers_test.go .vale.ini

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the analyzers, their tests, the tree test and the Vale file, the size list's files
the analyzers read planted packages in a folder of the test, and the tree test reads the tree, so no door stands unfaked
imports.go opens on a header naming the four analyzers, and each new function points at the import chapter of the model
the refused imports stand once in outside, and the file names of a suite once in the constants block. The time.Now call rule stays out, and ioonly holds src/q, with a note on the renderers

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

`io-modules-own-their-names` lands the `q.IO()` option and a first cut of the flag in `onlyq`: `CarriesIO` and `FaultsIn` in `src/imports/imports.go`. This ticket takes them further for `ioonly` and `fakesuite`, and drops the Vale sections the IO module files take in `.vale.ini`.
