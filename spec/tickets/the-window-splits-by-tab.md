---
kind: [[ticket]]
state: open
group: the-notes-point-true
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
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
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 9b115fd53d002bdb7a2533567dc8b2b132c3885e
    hash_after: 9b115fd53d002bdb7a2533567dc8b2b132c3885e
---

# Ask

A reader opens one folder to read one tab, and the window's parts stand apart.

`src/tui` holds every file the window builds from, and `ls src/tui/*.go | wc -l`
answers how many. A reader wanting the work tab reads them all.

[[spec/tickets/a-rename-reaches-every-note]] carries the folder to its name.
[[spec/design_output/tui#the-packages-the-window-holds]] names each package and
what it imports. Every import there runs down, so no loop stands.

- `ls src/tui/*.go` names the window's own files, and each tab stands under a folder of its own
- `go build ./...` under `src/tui` answers 0, so no import loop stands
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The packages and their imports stand in
[[spec/design_output/tui#the-packages-the-window-holds]], and the split follows
that table. A tab owns its own state, so the frame reads no record and no
ticket tree.

| the piece | what it becomes |
|---|---|
| the model's log fields and the tailer | fields of the log tab, under `src/tui/log` |
| the model's work fields and the places | fields of the work tab, under `src/tui/work` |
| the tab interface | grows an `Init`, an `Update` over the tab's own messages and key modes, a `Narrow` for the filter line, and a `Press` for the mouse |
| `Frame` and `newModel` | stay in the root package, which builds the tab list and hands it to the frame |
| the tests | move with the code they drive, and the window tests stay in the root package |
| the build stamp in `src/scripts/tui-build.js` | reads the tab folders too, so a change under one rebuilds the viewer |

A name a tab package reads takes a capital, and the rename reaches every file
naming it. The footer and the strip draw off what the open tab answers, so the
frame imports the draw and the tree packages alone.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
