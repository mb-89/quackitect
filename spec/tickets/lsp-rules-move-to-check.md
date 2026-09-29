---
kind: [[ticket]]
state: open
step: gate
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
group: lsp-door-lands-in-shadow
record:
  - step: design/draft
    hand: box 5c8055bbc025 · claude-code-remote
    hash_before: cd89a9fa15affa8a670a676fb3ac1a9bfc6e428b
    hash_after: cd89a9fa15affa8a670a676fb3ac1a9bfc6e428b
    inputs:
      - name: ask
        hash: 8ae6e5341e97a787
        size: 320
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box 5c8055bbc025 · claude-code-remote
    hash_before: e0aecd37cc0aeb86ecb60df9d836a7896b6ee6c1
    hash_after: e0aecd37cc0aeb86ecb60df9d836a7896b6ee6c1
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/check fails
    inputs:
      - name: design/draft
        hash: 4b2bf176b63e20be
        size: 3663
    def: 08e16d07b0de477c
---

# Ask

The LSP's rules and schema checks move into the check module, and run in shadow beside the LSP's own.

One copy of each rule then answers the editor, the check and the write door.

- `go test ./...` from the root passes
- `./RUNME.sh log --kind shadow` names each finding the two disagree on
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

The rules move whole, as one copy, into the check module, and the LSP keeps the protocol.

| the part | lands in | why |
|---|---|---|
| the tree, the checker, the note parse, the schema reader and every rule file: anchor, check, conflict, finding, group, history, install, marked, names, note, owned, parsed, paths, pointer, restated, schema-body, schema, syntax, textfaults, tree, and the pure half of private | `src/modules/check`, package `check`, exported where the LSP calls them | one copy answers the editor, the check and the write door |
| the tree's disk | a `Source` of slash paths and text in `check`: `Read`, `Paths`, `Folder` | `onlyq` refuses `io/fs`, which the LSP's `Disk` speaks |
| the `Disk`, the index client, the walk, the config and box reads, the outside tools, the protocol and the command line | stay in `src/lsp`, which adapts its `Disk` to a `Source` | they reach the outside, and the `lsp` IO module keeps them |
| the names the LSP calls | one file, `src/lsp/rules.go`, aliasing each moved name | the protocol files and their tests stay untouched, so the diff reads as a move |
| `src/pointer` | joins `pureTree` in `src/imports` | it imports the pure standard library alone |

The new path: the check module registers the port `sweep`, derived off `files/<path...>` and `env/<name>`. It answers `Checker.Sweep` over a `Source` on the files map, with the name words and the restated runs resolved local file over variable over default file, the order `src/config` holds. The wiring binds `check.files/<path...>` and `check.env/<name>`.

The shadow: the `migration` module declares `lsp`, built in as `old`, and the default file sets `migration.lsp` to `shadow`. Where it reads `shadow`, `se-lsp check` over the whole tree reads `check/sweep` off `/v1` and writes one `shadow` row, slice `lsp`, for each finding one side holds alone. The rules reading the box, `NothingPrivateTravels` and `SurveyFindsNode`, stand outside the compare, since the index reads no user, no git identity and no node. The old answer prints as it stands, and a fault on the new road writes nothing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/lsp: every protocol file and case calling a moved name, through src/lsp/rules.go
- src/lsp/main.go: checks, which runs the shadow after its answer
- src/lsp/twins_test.go: goTwins, through the aliases
- src/quack/main.go: the module table loading check.Registers
- src/quack/main_test.go: the check twins case
- spec/wiring.yaml: the check instance, which gains its two wires
- src/modules/migration/migration.go: Registers, which gains the lsp key
- src/imports/imports.go: pastQ, through pureTree

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/check/sweep_test.go: TestTheSweepAnswersADeadPointerOffTheFiles
- src/modules/check/sweep_test.go: TestTheSweepReadsTheWordsOffTheLocalLayer
- src/modules/migration/migration_test.go: TestTheLspSliceStandsOld
- src/lsp/shadow_test.go: TestTheShadowWritesARowForEachFindingApart
- src/lsp/shadow_test.go: TestTheShadowLeavesTheBoxRulesOut
- src/lsp/shadow_test.go: TestTheShadowWritesNothingUnderOld
- src/imports/imports_test.go: TestAModuleImportsThePointerReader

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: the rule files and their imports, door.go, holds.go, indexed.go, main.go, check.go, the check and migration modules, imports.go, the wiring, and verbs.go for the row
- the callers list names every package importing check and every file calling a moved name, which the alias file holds in one place
- `go test ./...` meets every case above, `./RUNME.sh log --kind shadow` meets the shadow cases, and `./RUNME.sh check` runs the analyzers over the moved package

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/modules/migration src/imports src/lsp

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/check/sweep_test.go
- src/modules/migration/migration_test.go
- src/imports/imports_test.go
- src/lsp/shadow_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Six cases fail on their own assertion: both sweep cases read an empty list, the lsp key stands nowhere, the pointer reader reads as past q, and the stub shadow writes no row. TestTheShadowLeavesTheBoxRulesOut passes against the stub, since a stub writing nothing leaves every rule out. It guards the compare once tests-green writes rows. The shadow cases needed a stub of shadowsSweep in src/lsp/shadow.go, so the package builds and each case reaches its assertion.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a red case: go test ./... meets all four files, the shadow rows meet shadow_test.go, and the check meets the pointer case the analyzer reads
- the one door the tests reach, the new road to /v1, takes a function the case hands in, and the session log takes one too

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
