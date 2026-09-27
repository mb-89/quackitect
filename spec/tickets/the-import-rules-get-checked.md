---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-foundation-lands-unchanged
depends_on: [go-code-shares-one-module]
record:
  - step: design/draft
    hand: box d7a69cb6601d7 · claude-code-remote
    hash_before: fb30c49323723d9767cf3fd2eb803f4b0048eb60
    hash_after: fb30c49323723d9767cf3fd2eb803f4b0048eb60
  - step: design/review
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 277c9318030a599e20b32b9fd72cb73831a32f72
    hash_after: 277c9318030a599e20b32b9fd72cb73831a32f72
  - step: implement/tests-red
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 5dfac167063cd9a59f094a3c70916d6b9b7f1b1e
    hash_after: 5dfac167063cd9a59f094a3c70916d6b9b7f1b1e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
  - step: implement/change
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: f16b0baebc974bce86f4f98d1611149000c5bd63
    hash_after: f16b0baebc974bce86f4f98d1611149000c5bd63
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d7d598fb92101 · claude-code-remote
    hash_before: 4d0d0a52a7ffd507f0f7986667a8f7169d970960
    hash_after: 4d0d0a52a7ffd507f0f7986667a8f7169d970960
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

A `go/analysis` check holds the import rules: a module imports no door, and a door or a renderer imports no module. `./RUNME.sh check` runs it. [[spec/design_input/the-index-holds-the-model#the-build-holds-the-rules]] asks it.

The model stays whole only while a door special-cases no name. Without the check a single import brings the eleven-file change back.

- - `go test ./...` from the root passes
- a case plants a module importing a door, and the check names it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A package `src/imports` holds one `go/analysis` analyzer per rule. A Go test runs both over the tree, so the check runs them inside `go test ./...`, with no step of its own.

| the analyzer | what it refuses |
|---|---|
| `nodoor` | an import of a package under `src/doors` from a package under `src/modules` |
| `noname` | an import of a package under `src/modules` from a door, the index or a renderer |

The renderers stand in one list in the package: `src/tui/frame` and `src/tui/tree`, per [[spec/design_output/migration]]. The index stands in `src/index`.

| the part | what it holds |
|---|---|
| `imports.go` | the two analyzers and the list of the renderers |
| `imports_test.go` | the planted cases, through `analysistest`, over packages under `testdata` |
| `tree_test.go` | both analyzers over every package of the module, loaded through `go/packages` |

The module takes `golang.org/x/tools` at its last release asking Go 1.24. The check asks no new step, because the battery runs every Go test.

No Go door and no Go module stands yet, so the tree passes today. Each rule holds from the first file that lands under those folders.

The other analyzers of [[spec/design_output/model#the-build-checks-imports]] wait for the Go doors, since each reads a door file.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/cli-check.js` `goHolds`, which runs `go test ./...` and so the tree test
- the root `go.mod`, which takes `golang.org/x/tools`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/imports/imports_test.go` `TestAModuleImportingADoorIsNamed`, deciding the second done line
- `src/imports/imports_test.go` `TestADoorImportingAModuleIsNamed`
- `src/imports/imports_test.go` `TestARendererImportingAModuleIsNamed`
- `src/imports/imports_test.go` `TestAModuleImportingAModulePasses`
- `src/imports/tree_test.go` `TestTheTreeHoldsTheImportRules`
- `go test ./...` from the root, deciding the first done line
- `./RUNME.sh check`, deciding the third

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the rule chapter of the model input, the Go doors note and the migration note stand opened
- the battery in `cli-check.js` stands opened, and it runs every Go test
- each done line names its test in the tests list

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings

- doors-note-names-every-analyzer: add the analyzer `nodoor` to the table of [[spec/design_output/model#the-build-checks-imports]]. The note then owns every analyzer, and the code points there.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh test src/imports

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The three planted cases fail on their want comments, and `TestFaultsNameAModuleImportingADoor` fails on its count. The clean module and the tree pass on the stub. `golang.org/x/tools` stands at `v0.42.0`, the last release asking Go 1.24. The analyzers and the tree test share `Faults`, so one predicate holds both. The commit hook reads a Go file under `testdata` as code, so the test writes the planted packages to a temp folder.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch `src/imports` and `go.mod` alone
- the planted packages in a temp folder stand in for doors and modules
- each file opens on a comment pointing at the Go doors note
- the note owns the analyzers, and the code points there
- the review row stands fixed in the note

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches `src/imports`, `go.mod` and the comment of `goHolds`, which the draft names
- the planted packages in a temp folder stand in for doors and modules
- each file opens on a comment pointing at the Go doors note
- the note owns the analyzers, and the list of renderers points at the migration note
- the review row stands fixed in the note

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh test src/imports

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The battery holds the import rules, so a single import breaking one turns the check red.

| the part | what it does |
|---|---|
| `nodoor` | names an import of a door from a module |
| `noname` | names an import of a module from a door, the index or a renderer |
| `Faults` | the predicate both analyzers and the tree test share |
| the tree test | loads every package of the module, and fails on each fault |

What I assume, for the reader at the merge:

- No Go door and no Go module stands yet, so the tree passes today. Each rule holds from the first file under those folders.
- The planted packages stand in a temp folder, because the commit hook reads a Go file under `testdata` as code.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the draft names
- the planted packages stand in for doors and modules
- each file opens on a comment pointing at the Go doors note
- the note owns the analyzers
- the review row stands fixed, and `says` names each assumption

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
