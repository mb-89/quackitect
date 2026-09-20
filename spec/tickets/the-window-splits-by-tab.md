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
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-2
    hash_before: b10ab9cd1427cee19ebf551044c8b4c502dd6483
    hash_after: b10ab9cd1427cee19ebf551044c8b4c502dd6483
    returns: 1
    why: "design: The filter language in `filter.go` reads a log row and a tree item, so the log and the tree both read it. The chapter gives the tree the draw package alone, so the approach names the package the filter language lands in and what imports it.; design: The link in `link.go` draws in the tree and in the work tab, so the approach names the package it lands in.; design: The footer draws the log's order and floor, which the approach moves into the log tab, so the tab interface grows the method the footer reads them through.; craft: The build stamp reads every folder under `src/tui`, the draw, the tree and the frame among them, and the approach says the tab folders alone.; craft: `Frame` sets the log's rows, filter and floor, so the approach says how the root reaches them once they stand in the log tab.; craft: `saidStyle` in `colour.go` reads a log record, so it parts from the styles before they move to the draw package."
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 3fee8dc860ac12ba54d103f9bce503b2424a3f6f
    hash_after: 3fee8dc860ac12ba54d103f9bce503b2424a3f6f
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-4
    hash_before: 26ff5a9f663ef22eecf1e2bf97200e2bcac0f0f7
    hash_after: 26ff5a9f663ef22eecf1e2bf97200e2bcac0f0f7
    returns: 2
    why: "design: The chapter names what `src/tui/draw` holds, and the approach adds the filter language and the link there, so the chapter's row takes them and the approach points at the chapter alone.; design: The filter pane lights a pressed preset off the work tree's sorts in `presses`, so the tab interface grows the method the pane reads a pressed preset through.; craft: The pane and the help read `part` and `renderParts` in `detail.go`, so those part to the frame before the details move to the log tab.; craft: The build stamp lists the files standing directly under the folders `foldersOf` names, so the approach says the stamp changes to walk the packages.; craft: `gutterWide` in `sort.go` is read by the tree's draw and sort, so it parts to the draw package before the columns move to the log tab."
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 84bdba8a528c2eb061bb48711c943b3436a1b1e8
    hash_after: 84bdba8a528c2eb061bb48711c943b3436a1b1e8
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

| the piece | where it lands |
|---|---|
| `cut`, `pad`, `oneLine`, `Wrap`, `gutterWide`, the palette and the styles | `src/tui/draw`, which imports nothing of this tree's |
| the filter language in `filter.go` and the link in `link.go` | `src/tui/draw`, because the tree and a tab both read them, and the tree imports the draw package alone. The chapter's row for the draw package takes them, so the approach and the chapter say one thing |
| `part` and `renderParts` in `detail.go` | `src/tui/frame`, because the panes and the help read them, and they part before the details move to the log tab |
| `saidStyle` in `colour.go` | the log tab, because it reads a log record, and the styles part from it first |
| the tree, its rows, its edit, its marks, its sorts, its flags and the base file | `src/tui/tree` |
| the place chord's tree reads | the work tab, as functions over a tree, because the tree knows no queue key |
| the model, the tab interface, the keys, the mouse, the strip, the panes, the footer, the help and the window's door | `src/tui/frame` |
| the model's log fields, the tailer, the records, the columns and the details | fields and files of the log tab, under `src/tui/log` |
| the model's work fields, the places, the index calls and the ticket edit | fields and files of the work tab, under `src/tui/work` |
| `main`, `runWindow`, `Frame`, `ParseSize` and the model builder | the root package, which builds the tab list and hands it to the frame |

The tab interface grows what the frame reads through it:

| the method | what the frame does with it |
|---|---|
| `Init` | batches each tab's first command |
| `Update` | hands a tab the messages and key modes it owns, and takes the first tab that answers |
| `Move` and `Jump` | the arrows, the page keys, home and end move the open tab's selection |
| `Press` | a press on the left side reaches the open tab |
| `Narrow` and `Sorted` | the filter line and a preset's sort reach the open tab |
| `Pressed` | the pane lights a preset carrying a sort alone off the tab's own order |
| `Marks` | the footer draws the order and the floor off the first tab, which is the log |

`Frame` in the root package reaches the log tab through its exported fields,
and sets its rows, its filter and its floor there. A name a tab package reads
takes a capital, and the rename reaches every file naming it. The tests move
with the code they drive, and the window tests stay in the root package. The
build stamp in `src/scripts/tui-build.js` lists the files standing in the
folders it names, so it changes to walk every package under `src/tui`, and a
change under any of them rebuilds the viewer.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- design: The chapter names what `src/tui/draw` holds, and the approach adds the filter language and the link there, so the chapter's row takes them and the approach points at the chapter alone.
- design: The filter pane lights a pressed preset off the work tree's sorts in `presses`, so the tab interface grows the method the pane reads a pressed preset through.
- craft: The pane and the help read `part` and `renderParts` in `detail.go`, so those part to the frame before the details move to the log tab.
- craft: The build stamp lists the files standing directly under the folders `foldersOf` names, so the approach says the stamp changes to walk the packages.
- craft: `gutterWide` in `sort.go` is read by the tree's draw and sort, so it parts to the draw package before the columns move to the log tab.

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
