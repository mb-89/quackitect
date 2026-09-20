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
step: implement/tests-red
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
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-6
    hash_before: fa22bf73f57952e01f4d3b570c835e33a7da10e1
    hash_after: fa22bf73f57952e01f4d3b570c835e33a7da10e1
    returns: 3
    why: "design: The chapter's draw row reads `cut`, `pad`, `narrow`, the palette and the styles, and the approach's row reads `oneLine`, `Wrap`, `gutterWide`, the filter language and the link beside them, so the two tables say two lists; the chapter's row takes the approach's list, and the approach points at the chapter alone.; craft: The window tests read the model's fields, `sel`, `view`, `all` and `work` among them, and the model moves to the frame, so the approach says what the tests in the root package read them through.; craft: `typing` raises the floor on `alt+l` under the filter pane, so the approach says how a tab's key reaches the tab while the pane takes letters."
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: e9a215e0da951abf189cfa6d6a26eabd83ef9ed5
    hash_after: e9a215e0da951abf189cfa6d6a26eabd83ef9ed5
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-8
    hash_before: f4ea7e56fc39b19e283fdc514c7b4a1f480019ab
    hash_after: f4ea7e56fc39b19e283fdc514c7b4a1f480019ab
    returns: 4
    why: "design: The palette in `colour.go` reads `quackitect/config`, and the base reader in `base.go` reads `quackitect/yaml`, so the draw row and the tree row each name the shared module the package imports.; design: The frame's pane draws the filter pane in `filterpane.go` and the help in `help.go`, so the chapter's frame row takes them.; craft: `startIndex` in `door.go` reads the index binary the work tab names, so it parts from the door to the work tab before the door moves to the frame.; craft: `Placed` in `workplaces.go` is a method of the tree reading the work tab's keys, so it becomes a function of the work tab over a tree, the way the place chord's reads do.; craft: The window tests read the frame's own fields and methods, `pane`, `box`, `input` and `renderMarks` among them, and the approach says what a tab exports alone, so it says what the frame exports to the root's tests.; craft: The approach lists what the draw package, the frame and the log tab take after the chapter's rows take it, so the approach points at the chapter alone."
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 935807cac5a667f7827b7ee1e31480c0634114c4
    hash_after: 08e9649baa3c438e1673ce0ff0267efd322122d2
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-10
    hash_before: 3b09d524f83dcf41323782005d2d1d8a4bee70b0
    hash_after: 3b09d524f83dcf41323782005d2d1d8a4bee70b0
    returns: 5
    why: "design: The log tab reads the draw package's styles and cuts, the work tab reads the tree and the draw package, and the window reads the palette and the filter language, so the log row, the work row and the window row each name every package they import."
  - step: design/draft
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 9c52e77ae070fb00c2457ed080e9b3f0dfa0bcca
    hash_after: 23137b471c2d6c72667d5c9e8c2e5bdf4c67380c
  - step: design/review
    hand: box 1670436ae0bb · claude-code-remote · helper-12
    hash_before: 74b158aa825209a6272060698a2276a3bb5517ad
    hash_after: 74b158aa825209a6272060698a2276a3bb5517ad
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

The packages, what each holds and what each imports stand in
[[spec/design_output/tui#the-packages-the-window-holds]], and the split
follows that table. The chapter's rows take what each round finds standing
between the packages, so the chapter stays the one list.

A tab owns its own state, so the frame reads no record and no ticket tree.
The model's log fields and the tailer become fields of the log tab, the
model's work fields and the places become fields of the work tab, and the
place chord's tree reads and the laying of places over a tree become
functions of the work tab over a tree. The index start parts from the
window's door to the work tab, which names the binary. The
root package builds the tab list, hands it to the frame, and keeps `Frame`,
which reaches the log tab's rows, filter and floor through its exported
fields.

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

A binding in a tab's band carries a mark letting it through while the filter
pane takes letters, and `alt+l` carries it, so the floor rises under the pane
the way it does today.

The tests move with the code they drive, and the window tests stay in the root
package. They reach the log tab's and the work tab's fields through the tabs
the model holds, and each tab exports the fields a case reads. The frame
exports the fields and the methods the window tests read: the pane, the box,
the input, the size, the sources, the marks and the strip among them. A name a tab
package reads takes a capital, and the rename reaches every file naming it. The
build stamp in `src/scripts/tui-build.js` lists the files standing in the
folders it names, so it changes to walk every package under `src/tui`, and a
change under any of them rebuilds the viewer.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

| finding | what stands |
|---|---|
| `./RUNME.sh check` answers 0 on the branch | 56 warnings stand, and none is this ticket's |
| Every import in the chapter's table runs down | the draw package reads no other package, and the tree reads the draw package alone |
| The last round's finding has its answer | the log row, the work row and the window row each name every package they import |
| The window tests read `loadWork` and `placesIn` | the window row names each tab, so the root reaches them |
| The frame reads no record and no tree after the split | the tab interface's methods carry what the keys, the mouse, the pane and the footer read today |

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
