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
    hash_before: 0c2433d538594cf7099e5a0c5eba3743c7e5f9cb
    hash_after: 0c2433d538594cf7099e5a0c5eba3743c7e5f9cb
    inputs:
      - name: ask
        hash: ba3b442f05fd963f
        size: 456
    def: 71651f49796eeda4
---

# Ask

`spec/views/work.base` gains the name it reads, its badge `work/open-tasks`, and the actions its keys call. The window draws it off the index, with each label, doc and look off the registrations, and the file writes none.

The work view stops computing what it shows.

- `go test ./...` from the root passes
- a case draws the work view over a fake `work/rows`
- a case draws the badge with the label and look the port declares
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

The work view becomes a declared view, in shadow: the tab keeps drawing off the verb and the tickets answer, and the rows and the badge the index holds stand beside them.

| the part | where | what it does |
|---|---|---|
| the declaration | spec/views/work.base | gains the top-level keys reads work/rows, badge work/open-tasks, and the four actions of the views chapter, in block style. The file writes no label, doc or look |
| the port | src/modules/work/open_tasks.go and rows.go Registers | work/open-tasks declares q.Label work and q.Looks q.Count, and work/rows declares q.Looks q.Rows, so the registration owns what the badge wears |
| the catalog | src/modules/index/catalog.go NameRow | gains label, icon and looks off the presentation, so a renderer reads them off index/names |
| the badge | src/tui/work/shadow.go BadgeOf | draws the label and the count off the index/names rows, the way the strip draws work (N) |
| the rows | src/tui/work/shadow.go ViewOver | builds the tree off a work/rows answer and the base file, so a case draws the view over fake rows |
| the compare | src/tui/work/shadow.go Apart and Check | names each row the tab and work/rows read apart on name, state and queue, and the badge the strip and the index read apart, then writes one shadow row a pair |
| the write | src/tui/frame/shadow.go WriteShadow | appends one shadow row to the session log. The log tab and the work tab share it, so the file call stands once in the frame's door |
| the window | src/tui/main.go newModelOver | hands the work tab the catalog and the mode off migration.window |

Assumptions for the hand at the merge: the model note names work/place, tickets/flip-urgent and tickets/set-field, and the catalog holds none of them today, so the file declares them as the note says and the actions shadow lands them. The tab keeps its own keys under shadow. The log ticket's approach named its write in log/door.go, and this ticket moves it into the frame, which both tabs reach.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/work/work.go Load: reads work.base through tree.ReadBase
- src/tui/work/work.go Label: draws the strip's count
- src/tui/main.go newModelOver: builds the work tab
- src/modules/index/catalog.go catalogOf: builds every NameRow
- src/tui/log/shadow.go Check: the write moves to frame.WriteShadow

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/work/shadow_test.go TestTheWorkViewDrawsOverAFakeWorkRows
- src/tui/work/shadow_test.go TestTheBadgeDrawsTheLabelAndLookThePortDeclares
- src/tui/work/shadow_test.go TestTheShadowNamesEachWorkRowTheTabAndTheIndexReadApart
- src/tui/work/shadow_test.go TestTheShadowNamesABadgeTheTwoPathsDrawApart
- src/tui/work/shadow_test.go TestTheWorkShadowWritesNoRowUnderOld
- src/tui/frame/shadow_test.go TestAShadowRowStandsInTheLogWithItsSlice
- src/tui/tree/base_test.go TestTheWorkBaseFileDeclaresItsRowsBadgeAndActions
- src/modules/work/open_tasks_test.go TestTheOpenTasksPortDeclaresItsLabelAndLook
- src/modules/index/catalog_test.go TestANameRowCarriesItsLabelAndLook

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first, on a first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: work.base, work/work.go, workplaces.go, modules/work/rows.go and open_tasks.go, index/catalog.go, q/looks.go, wiring.yaml and the views chapter of the model note
- the callers list names each reader of the base file, the strip's label, the constructor and the row builder
- the ask's fake work/rows case is TestTheWorkViewDrawsOverAFakeWorkRows and its badge case is TestTheBadgeDrawsTheLabelAndLookThePortDeclares, and go test with the check close it

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
