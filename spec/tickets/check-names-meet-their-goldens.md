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
group: read-topics-land-in-shadow
record:
  - step: design/draft
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 5dcd24a0eab81d8174fcf34a86e72c751f1e8060
    hash_after: fddad13aacebede00c3c248fd7ed6a856515dd12
    inputs:
      - name: ask
        hash: 5afd790b5072669d
        size: 386
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 358fef1601e0e657f4c62bb057d97724d9e6fbba
    hash_after: 358fef1601e0e657f4c62bb057d97724d9e6fbba
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 69c8aa2cc80f8682
        size: 3168
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 8b8407d479ae82e542cdfa71d4da131d42d0f042
    hash_after: 8b8407d479ae82e542cdfa71d4da131d42d0f042
    inputs:
      - name: design/draft
        hash: 69c8aa2cc80f8682
        size: 3168
      - name: design/tests-red
        hash: 09300e00ea9ba763
        size: 1172
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 277d0ce03a8de3de65aa9faa5b3e58904aa4454b
    hash_after: 277d0ce03a8de3de65aa9faa5b3e58904aa4454b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: d6c6458a87f2810387c06d82627138959c9781b4
    hash_after: d6c6458a87f2810387c06d82627138959c9781b4
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s); green, src/lsp passes; green, src/modules/check passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: design/tests-red
        hash: 09300e00ea9ba763
        size: 1172
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

The `check/` names stand, and each twin runs over the whole tree both ways. The golden files hold every difference, and the owner reads them at the merge.

Several twins disagree today, so picking one changes findings. The golden files make each change a choice.

- `go test ./...` from the root passes
- a golden file per twin stands under the check module
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

The check module, src/modules/check, declares one `check/<twin>` name per twin, each a list of findings whose built-in value stands empty, so the names stand before phase 7 moves the rules in. Its testdata folder holds one golden file per twin. A twin's golden holds the findings only one side reports over the whole tree: the JavaScript side and the Go side, keyed by file, rule, line and message. The twins: tree (treeFaults on both sides, plus the rule names each side runs), schema (the note kinds schemasIn finds), size (sizeFaults under the code ceilings), magic (magicIn), names (overLong under names.words), paths (isDraft over every tracked path), private (carriesTheName over every tracked line, for one fixed name), slug (slugOf over every heading of every tracked note), vale (fromJson over captured Vale output) and biome (fromJson over captured Biome output). The two parsers read a tool's output and no tree, so their golden runs over captured outputs under the module's testdata. src/scripts/check-twins.js runs every JavaScript twin over a tree it takes, and test/level0/check-twins.js prints them as JSON over this tree's tracked files. src/lsp/twins_test.go runs every Go twin over the same files, since src/lsp stands as package main and no module imports it. It runs node for the JavaScript side, and compares each twin's differences with its golden, and -update writes them. Weighed: a runtime shadow row per twin waits for phase 7, where the LSP answers the check names, so this phase holds each difference as a golden the owner reads at the merge. Assumed: node stands on every box that runs go test, as the check already runs the node tests beside it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/lsp/twins_test.go: TestTwinGoldens calls treeFaults, schemasIn, sizeFaults, magicIn, overLong, isDraft, carriesTheName, slugOf, valeRowsOf and biomeRowsOf,test/level0/check-twins.js: its entry calls twinsOf in src/scripts/check-twins.js,src/scripts/check-twins.js: twinsOf calls treeFaults, schemasIn, sizeFaults, magicIn, overLong, isDraft, carriesTheName, slugOf and both fromJson,src/modules/check/check.go: Registers, which no wiring loads yet

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/lsp/twins_test.go: TestTwinGoldens,src/modules/check/check_test.go: TestEveryTwinNameStands,test/level0/check-twins.test.js: every twin answers over a tree it takes,test/level0/check-twins.test.js: a twin's golden file stands for every twin

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened every twin on both sides: tree.js RULES and check.go Rules, schema.js and schema.go schemasIn, size.js and textfaults.go sizeFaults, magic.js and textfaults.go magicIn, names.js and names.go overLong, paths.js and paths.go isDraft, private.js and private.go carriesTheName, slug.js and restated.go slugOf, vale.js and code.js fromJson beside outside.go valeRowsOf and biomeRowsOf.
The callers list names every caller of the new code: the Go golden test, the node entry and the module, which no wiring loads yet.
go test ./... decides through TestTwinGoldens and TestEveryTwinNameStands, the golden per twin through TestTwinGoldens and the node golden test, and ./RUNME.sh check through the commit verb.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/check-twins.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/check-twins.test.js,src/lsp/twins_test.go,src/modules/check/check_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The node golden case fails on its own assertion, since no golden file stands for any twin, and TestTwinGoldens fails the same way for all ten twins. The check module test fails to build, since the module stands nowhere yet. The first run of the node twins case failed too, and the fault stood in the fixture: the JavaScript magic twin reads Go files alone, so the fixture now carries one. The surprise: the patch door reads a captured Biome report as a live one, and raises its rows as warnings, so both captured outputs stand as text files.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Every done_when line meets a red test: go test ./... through TestTwinGoldens and TestEveryTwinNameStands, the golden per twin through both golden cases, and the check through the commit verb.
Every door the tests reach takes a fake or a captured answer: the node case runs over a fake disk and a fake git, and the parsers read captured tool output. TestTwinGoldens reads the real tree on purpose, since the ask runs each twin over the whole tree.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- check-module-joins-the-wiring: check.Registers stands in no wiring in src/quack/main.go, so the check names stand in a test catalog alone, where the group ask puts every read-only topic in shadow under its own slice key
- twin-goldens-walk-every-twin: TestTwinGoldens in src/lsp/twins_test.go walks the twins node prints, so a twin the JavaScript side drops passes unread; walk check.Twins and fail where a side lacks a twin
- twin-golden-flag-name-agrees: the draft names -update as the flag that rewrites the goldens, where src/lsp/twins_test.go names it -twins

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/check src/scripts/check-twins.js src/lsp/twins_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the check module, the twin walk and its goldens, and the wiring that loads the module, and nothing past them.
The node case runs over a fake disk and a fake git, and the parsers read captured tool output.
The headers of src/modules/check/check.go and src/scripts/check-twins.js name the approach.
The twin list stands in check.Twins, and src/scripts/check-twins.js spells it again since a script imports no Go, as its comment says.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/check-twins.test.js src/lsp src/modules/check

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every twin of a JavaScript check and its Go port now stands as a check name on the index, loaded by the check instance of the wiring, and each holds an empty list until phase 7 moves the rules in. TestTwinGoldens runs both sides of every twin over the tracked tree and compares the rows each side reports alone with a golden file under src/modules/check/testdata, so the owner reads each difference at the merge. Run go test ./src/lsp -run TestTwinGoldens -twins to write the goldens again.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the check module, the twin walk, its goldens and the wiring, and nothing past them.
The node case runs over a fake disk and a fake git, and the parsers read captured tool output.
The headers of src/modules/check/check.go and src/lsp/twins_test.go name the approach.
The twin list stands in check.Twins, which the golden test reads.

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

The flag that writes the twin goldens again is `-twins`, as src/lsp/twins_test.go declares it: `go test ./src/lsp -run TestTwinGoldens -twins`. The draft's `-update` reads as `-twins`.
