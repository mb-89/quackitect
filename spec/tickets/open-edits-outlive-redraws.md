---
kind: [[ticket]]
state: open
step: design/tests-red-3
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
      - name: draft-2
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "gate rejects 2 times: where every marked row leaves in a redraw, the marks run empty and a fill reaches the whole view: keep a departed mark so the fill reaches none, with a red case that marks one row, redraws without it, fills, and finds nothing written; the marks survive a redraw under a filter only with the filter carry, so the ticket names a-filter-keeps-the-cursor under depends_on"
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
      - name: draft-3
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
      - name: tests-red-3
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-3
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2", "design/draft-3", "design/tests-red-3"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2", "design/draft-3"]
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
        input: ["design/tests-red", "design/tests-red-2", "design/tests-red-3"]
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
process_hash: c671f20a6ae2a4a6
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b0a22705166b · claude-code-remote
    hash_before: 5924ab640915e0753f7b7b75dd0316b51309fa5d
    hash_after: 5924ab640915e0753f7b7b75dd0316b51309fa5d
    inputs:
      - name: ask
        hash: 97110e026beedf1c
        size: 671
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b0a22705166b · claude-code-remote
    hash_before: 703496fe46deba585cd0b438785e08dd64ff7a88
    hash_after: 703496fe46deba585cd0b438785e08dd64ff7a88
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/tree fails
    inputs:
      - name: design/draft
        hash: 8a7d1744a1843e19
        size: 960
    def: 08e16d07b0de477c
  - step: gate
    hand: box b0a22705166b · claude-code-remote · helper-7
    hash_before: a9781ff9f3442abf35b09e937bafd3c668551779
    hash_after: a9781ff9f3442abf35b09e937bafd3c668551779
    returns: 1
    why: "Carry keeps the edit open but leaves the marks and last behind, so a fill after a redraw writes every row the view holds: re-point marks and last by name path as at is, with a red case that marks two rows, redraws with a row above, fills, and finds the two alone written; a departed row loses the typed value in silence: name the departure in the notice, with a case asserting it"
  - step: design/draft-2
    hand: box b0a22705166b · claude-code-remote
    hash_before: 830951312a329d84c15638dc20400a318fc896d4
    hash_after: 830951312a329d84c15638dc20400a318fc896d4
    inputs:
      - name: ask
        hash: 97110e026beedf1c
        size: 671
    def: 05d09c51410ea2a3
  - step: design/tests-red-2
    hand: box b0a22705166b · claude-code-remote
    hash_before: ad22b966484e0fddc824262defc1b07fcd7c7ecd
    hash_after: ad22b966484e0fddc824262defc1b07fcd7c7ecd
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/tree fails
    inputs:
      - name: design/draft-2
        hash: ea644b7b6807c871
        size: 2126
    def: 9c7cd4dd4a2dadb8
  - step: gate
    hand: box b0a22705166b · claude-code-remote · helper-8
    hash_before: b01d522137c7354bb212d9d3bcb40e9d0f1dc3bb
    hash_after: b01d522137c7354bb212d9d3bcb40e9d0f1dc3bb
    returns: 2
    why: "where every marked row leaves in a redraw, the marks run empty and a fill reaches the whole view: keep a departed mark so the fill reaches none, with a red case that marks one row, redraws without it, fills, and finds nothing written; the marks survive a redraw under a filter only with the filter carry, so the ticket names a-filter-keeps-the-cursor under depends_on"
  - step: design/person-1
    hand: box b0a22705166b · claude-code-remote
    hash_before: 56bdd750128abba770ea8ff1f4e88e5986364322
    hash_after: 56bdd750128abba770ea8ff1f4e88e5986364322
    def: c5f02a5133e1e8c2
  - step: design/draft-3
    hand: box b0a22705166b · claude-code-remote
    hash_before: e5d8029496ebcdd7947938421f4d710d536d0342
    hash_after: e5d8029496ebcdd7947938421f4d710d536d0342
    inputs:
      - name: ask
        hash: 97110e026beedf1c
        size: 671
    def: 720f39ea2ba7bd6a
group: the-tui-keeps-its-place
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: an edit a person types into a cell stays open across a work/rows redraw, on the same row by its name path, so every key lands in the edit.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Carry` in `src/tui/tree/tree.go` drops the open edit, so after a redraw the next typed letters fall through to the tab's key map: `u` flips urgent and `P` pulls a ticket, unseen.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/tui/tree/ -run TestARedrawKeepsAnOpenEdit` passes, with a row arriving above the edited one
- `go test ./src/tui/work/ -run TestAKeyInAnEditStaysInItAcrossARedraw` passes: a work/rows change, then `u`, posts nothing and the edit stands open
- `./RUNME.sh check` answers 0 on this box

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
from: none

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

`Carry` in `src/tui/tree/tree.go` copies the old tree's open edit, typed text and offer with it. It reads the edited row's name path off the old items by the edit's `at`, and points `at` at the item with that path in the new items, walked in their own order. Where the row left, `at` stands empty, `itemAt` finds nothing, and Enter writes nothing. Keys then stay in the edit until Enter or Escape closes it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/work/work.go Tab.takes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/tree/tree_test.go TestARedrawKeepsAnOpenEdit
- src/tui/work/actions_test.go TestAKeyInAnEditStaysInItAcrossARedraw

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/tui/tree/tree.go
- src/tui/tree/tree_test.go
- src/tui/work/actions_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened Carry, Edit, Open, Take, itemAt, editing and writes, and an `at` naming no item writes nothing
- a grep finds takes the one caller of Carry
- each done_when line names its test
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/tree/tree_test.go
- src/tui/work/actions_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their assertions. After one work/rows change mid-edit, `u` posts tickets/flip-urgent on two-ticket and `P` posts work/pull, as the finding names, and the tree reads no edit.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when test fails on its own assertion, and the check line waits on tests-green
- the work case posts through the registry Fake, which its contract suite holds

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`Carry` in `src/tui/tree/tree.go` copies the open edit, and points its `at` at the item holding the same name path in the new items, walked over `Items` as `itemAt` walks. It re-points every mark and the last mark the same way, so a fill after a redraw reaches the marked rows alone. Where a row left, its mark drops, and the edit keeps an empty `at`. The edit carries its row name, so `Take` on a departed row writes nothing. It returns that name with the reason that the row left, and the tab names it in the notice through `writes`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/work/work.go Tab.takes, the one caller of Carry
- src/tui/work/workedit.go Tab.editing and Tab.writes, through Take and Fill
- src/tui/tree/treedraw.go Tree.edits, which draws the edit cell off edit.key
- src/tui/tree/treemark.go fillWhere, MarkedItems and MarkRun, which read the marks and last

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/tree/tree_test.go TestARedrawKeepsAnOpenEdit
- src/tui/tree/tree_test.go TestARedrawKeepsTheMarksAFillReaches
- src/tui/tree/tree_test.go TestATakeOnARowThatLeftSaysSo
- src/tui/work/actions_test.go TestAKeyInAnEditStaysInItAcrossARedraw

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the marks and last stay behind, so a fill after a redraw writes every row: Carry re-points both by name path, and TestARedrawKeepsTheMarksAFillReaches decides it
- a departed row loses the typed value in silence: Take returns the row name with the reason, and TestATakeOnARowThatLeftSaysSo decides it
- the edit cell draws off edit.key, so a redraw whose columns lack it hides the cell: real redraws read the columns off the base file, so the work case adding a column to the first tree alone is the case edge, and the change leaves it

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/tui/tree/tree.go
- src/tui/tree/treeedit.go
- src/tui/tree/tree_test.go
- src/tui/work/actions_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened Carry, Mark, MarkRun, fillWhere, MarkedItems, Take, write, itemAt, edits, editing and writes
- the callers list names takes, the edit keys, the cell draw and the mark readers
- each done_when line names its test, and the two new cases decide the reject findings
- the approach adds no config key

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/tree

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/tree/tree_test.go
- src/tui/work/actions_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three tree cases fail on their assertions. After a carry the edit stands closed, a fill over two marked rows reaches none of them once the carry drops the marks, and a take on a row that left names nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when test fails on its own assertion, and the check line waits on tests-green
- the work case posts through the registry Fake, which its contract suite holds

## person-1

<!-- gate rejects 2 times: where every marked row leaves in a redraw, the marks run empty and a fill reaches the whole view: keep a departed mark so the fill reaches none, with a red case that marks one row, redraws without it, fills, and finds nothing written; the marks survive a redraw under a filter only with the filter carry, so the ticket names a-filter-keeps-the-cursor under depends_on -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

The cloud box decides this step, as the cloud guidance asks. Both findings hold, and draft-3 answers them. A mark whose row leaves stays as a mark on an address no row holds, so a fill after the redraw reaches none. The ticket names a-filter-keeps-the-cursor under depends_on, whose carry keeps the filter that holds the marks.

## draft-3

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`Carry` in `src/tui/tree/tree.go` copies the open edit, and points its `at` at the item holding the same name path in the new items, walked over `Items` as `itemAt` walks. It points every mark and the last mark at their rows the same way. A mark whose row left stays under an address no row holds, so the marks never run empty and a fill reaches the marked rows that stand, or none. `Marks` counts the rows a mark reaches. The edit carries its row name, so `Take` on a row that left writes nothing and returns that name with `RowLeft`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/work/work.go Tab.takes, the one caller of Carry
- src/tui/work/workedit.go Tab.editing and Tab.writes, through Take and Fill
- src/tui/tree/treedraw.go Tree.edits, which draws the edit cell off edit.key
- src/tui/tree/treemark.go fillWhere, MarkedItems, MarkRun and Marks, which read the marks and last

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/tree/tree_test.go TestARedrawKeepsAnOpenEdit
- src/tui/tree/tree_test.go TestARedrawKeepsTheMarksAFillReaches
- src/tui/tree/tree_test.go TestAFillAfterEveryMarkedRowLeftWritesNothing
- src/tui/tree/tree_test.go TestATakeOnARowThatLeftSaysSo
- src/tui/work/actions_test.go TestAKeyInAnEditStaysInItAcrossARedraw

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- every marked row leaving runs the marks empty, so a fill reaches the whole view: a departed mark stays on an address no row holds, and TestAFillAfterEveryMarkedRowLeftWritesNothing decides it
- the marks survive a filter only with the filter carry: that carry stands in Carry since commit f82cbe2f, so no depends_on is set. Naming one would deadlock the two, since the filter tests-green waits on this change in the same package

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/tui/tree/tree.go
- src/tui/tree/treeedit.go
- src/tui/tree/treemark.go
- src/tui/tree/tree_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened Carry, Mark, MarkRun, Marks, fillWhere, MarkedItems, Take, itemAt and takes
- the callers list names takes, the edit keys, the cell draw and the mark readers
- each done_when line and each finding names its test
- the approach adds no config key

## tests-red-3

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

reject
- where every marked row leaves in a redraw, the marks run empty and a fill reaches the whole view: keep a departed mark so the fill reaches none, with a red case that marks one row, redraws without it, fills, and finds nothing written
- the marks survive a redraw under a filter only with the filter carry, so the ticket names a-filter-keeps-the-cursor under depends_on

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
