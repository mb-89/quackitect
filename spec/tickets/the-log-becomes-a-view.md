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
group: tui-shell-lands-in-shadow
depends_on: ["the-tui-becomes-a-shell"]
record:
  - step: design/draft
    hand: box d856db450bd7 · claude-code-remote
    hash_before: 4cc966896e72c57a75ad2523d805434c6d9be563
    hash_after: 4cc966896e72c57a75ad2523d805434c6d9be563
    inputs:
      - name: ask
        hash: f268653c1878cc1f
        size: 207
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d856db450bd7 · claude-code-remote
    hash_before: 7a3e0009fe5f3395cd3549decd01673bdf42c88f
    hash_after: 7a3e0009fe5f3395cd3549decd01673bdf42c88f
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/tree fails
    inputs:
      - name: design/draft
        hash: bfcb45d8ba9abd2a
        size: 3090
    def: 08e16d07b0de477c
  - step: gate
    hand: box d856db450bd7 · claude-code-remote · helper-3
    hash_before: 583ccacc8fd01bbc20b629c163eefb50537acdda
    hash_after: 583ccacc8fd01bbc20b629c163eefb50537acdda
    inputs:
      - name: design/draft
        hash: bfcb45d8ba9abd2a
        size: 3090
      - name: design/tests-red
        hash: b2c76ad4a79c0e5d
        size: 865
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 6f2668a6c6f2196bee19902aeeaf5a05809a4dfa
    hash_after: 6f2668a6c6f2196bee19902aeeaf5a05809a4dfa
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d857a59424d7 · claude-code-remote
    hash_before: 9d815d85fa8e69454b69aafd7634661be241cb66
    hash_after: 9d815d85fa8e69454b69aafd7634661be241cb66
    answered:
      - name: tests
        exit: 0
        said: green, src/tui passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: b2c76ad4a79c0e5d
        size: 865
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

The log becomes a declared view over `log/`.

The log view then reads the rows one owner holds.

- `go test ./...` from the root passes
- a case draws the log view over fake rows
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

The log becomes a declared view, in shadow: the tailed rows keep drawing, and the rows the index holds under log/rows stand beside them.

| the part | where | what it does |
|---|---|---|
| the declaration | spec/views/log.base | reads log/rows, follow true, the actions E (jumps to level: error) and alt+l (cycles floor), and one table view over at, level, kind and said |
| the reader | src/tui/tree/base.go ReadBase | View gains Reads, Badge, Follow and Actions, read off the file's top-level keys, so the work view reuses them |
| the compare | src/tui/log/shadow.go | Shadow holds a Source (the one Read the registry catalog has), a Mode func and a Say func. Apart(old, rows) names each row the tail and log/rows read apart, on at, level, kind and said, and a tail one side holds alone is the log growing |
| the tab | src/tui/log/tab.go Update | on LinesMsg, a shadow in shadow mode runs the compare in a command and writes one shadow row a mismatch |
| the write | src/tui/log/door.go | appendLine adds a row to the session log, the one file call the compare makes |
| the slice | src/modules/migration/migration.go | a window slice, built in as old, which the default file sets to shadow and the group's last ticket switches |
| the window | src/tui/main.go newModelOver | hands the log tab the catalog and a mode read off the config key migration.window |

Assumptions for the hand at the merge: the old tail stays the drawn path under shadow, since the ask says the window keeps answering the old way. A shadow row never counts in the compare, so no row breeds another, as log-shadow.js does. The mode reads through the config package in the window's root, so log imports no config.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/tree/base.go viewOf: builds every View, so the new keys ride there
- src/tui/work/work.go New: reads work.base through tree.ReadBase
- src/tui/main.go newModelOver: builds the log tab
- src/tui/log/tab.go New and Update: the tab the shadow hangs on
- src/modules/migration/migration.go Registers: the slices list gains one

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/tree/base_test.go TestABaseFileNamesWhatItReadsItsBadgeAndItsActions
- src/tui/log/shadow_test.go TestTheShadowNamesEachRowTheTailAndTheIndexReadApart
- src/tui/log/shadow_test.go TestAShadowRowNeverCountsInTheCompare
- src/tui/log/shadow_test.go TestTheLogTabWritesAShadowRowOnAMismatchInShadow
- src/tui/log/shadow_test.go TestTheLogTabWritesNoRowUnderOld
- src/tui/log/view_test.go TestTheLogBaseFileDeclaresTheLogView
- src/modules/migration/migration_test.go TestTheWindowSliceStandsAmongTheSlicesBuiltInAsOld

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first, on a first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: tree/base.go, log/tab.go, log/door.go, log/record.go, main.go, migration.go, scripts/log-shadow.js and the views chapter of the model note
- the callers list names each caller of ReadBase and the tab constructor
- the ask's case draws the log view over fake rows: TestTheLogTabWritesAShadowRowOnAMismatchInShadow and TestTheLogBaseFileDeclaresTheLogView decide it, and go test ./... with the check close it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/tree src/tui/log src/modules/migration

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/tree/base_test.go
- src/tui/log/shadow_test.go
- src/modules/migration/migration_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its assertion over stubs that compile. The two cases that pass on a stub are the no-mismatch ones, since an empty compare names nothing, and the case that pins a shadow row out of the compare, which the implementation holds. The catalog source needs no new fake, since a case hands the compare its own rows.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask case draws the log view over fake rows: the shadow cases run over a fake source and the base case reads spec/views/log.base, and go test and the check close it at tests-green
- the one door, Source, has the fake in shadow_test.go, and the /v1 road stands in registry, whose contract suite already holds it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- log-view-draw-case-missing: no case draws the log view over fake rows, as the ask's second done_when line names; the shadow cases compare and write rows, and TestTheLogBaseFileDeclaresTheLogView reads the file alone. Add a case beside TestTheWorkViewDrawsOverAFakeWorkRows that builds the log view off spec/views/log.base over fake log/rows and asserts the drawn rows
- log-draft-test-path-wrong: the draft lists TestTheLogBaseFileDeclaresTheLogView under src/tui/log/view_test.go, and the case stands in src/tui/tree/base_test.go

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out: the log view, its base file and the layout row
- every door the change reaches has a fake: the tests seed rows through fakeSource
- a comment names the approach: each new function points at the model chapter
- every fact stands in one place: the import row stands in the tui chapter

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/tui

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The log view stands as a declared view in spec/views/log.base, drawn by ViewOver in src/tui/log over log/rows, and the shadow compare writes one shadow row per mismatch. The gate points closed: a draw case over fake rows, and the corrected test path in the Discussion.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out
- every door the change reaches has a fake
- a comment names the approach each function implements
- each fact stands once, and the tui chapter holds the import row

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

The draft's line naming src/tui/log/view_test.go for TestTheLogBaseFileDeclaresTheLogView is wrong: the case stands in src/tui/tree/base_test.go. Read every reach of that name there. [[spec/tickets/log-draft-test-path-wrong]]
