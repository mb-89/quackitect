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
step: implement/reflect
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
  - step: implement/tests-red
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 92f53b3f760a65fcff4cf0c985f1a1224dc79edb
    hash_after: 92f53b3f760a65fcff4cf0c985f1a1224dc79edb
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: c7f49ef1f157a5332dcd1b9ce31924df2aa3d6e6
    hash_after: c7f49ef1f157a5332dcd1b9ce31924df2aa3d6e6
    answered:
      - name: lint
        exit: 0
        said: 64 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: cf57f2a2f730775edc80f1ddcddb2094dad77549
    hash_after: cf57f2a2f730775edc80f1ddcddb2094dad77549
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: 64 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box 1670436ae0bb · claude-code-remote · helper-17
    hash_before: fd5cb8f86fb2e0ba24d37025b7133fcf3e9efc65
    hash_after: fd5cb8f86fb2e0ba24d37025b7133fcf3e9efc65
    returns: 1
    why: "design: `spec/design_output/tui.md` names `src/tui/mouse.go` under The mouse reaches the window, and the file stands under `src/tui/frame` now.; design: `spec/design_output/tui.md` names `src/tui/door.go`, `openDoor`, `tabMsg` and `tellPort` under A second launch hands over, and the split moved the file and gave each name a capital.; design: `spec/design_output/tree-view.md` names `src/tui/tree.go` and `src/tui/treedraw.go` under Scope, and both stand under `src/tui/tree` now.; craft: `src/tui/sort_test.go`, `src/tui/mouse_test.go` and `src/tui/model_test.go` spell the column widths, the wheel step, the floor width and the no-sort mark as bare numbers, where `stampWide`, `levelWide`, `kindWide`, `wheelStep`, `floorWide` and `sortNone` hold them.; craft: `poll` stands in `src/tui/log/tail.go` and again in `src/tui/work/work.go`, and the one package held it once.; craft: `logTab` in `src/tui/main.go` and `theLog` in `src/tui/window_test.go` read the same tab the same way.; craft: the rename reached the case messages, so `src/tui/frame_test.go` and `src/tui/panes_test.go` say \"frame.Band\" and \"frame.Preset\" to a reader, and `src/tui/log/detail_test.go` writes the filter key as `Text:`.; craft: `SchemaOf` and `TicketRules` in `src/tui/work/workedit.go` answer `ticketSchema`, a type the package keeps to itself.; craft: `src/tui/tree/treeflag_test.go` keeps a blank line where the moved case stood.; The branch does what the ask calls for: `ls src/tui/*.go` names the window's own files, each tab stands under a folder of its own, and every import in the chapter's table runs down.; `go build ./...` and `go test ./...` under `src/tui` answer 0, and `go vet ./...` and `gofmt -l .` answer nothing.; `./RUNME.sh check` answers 0 on the branch, with 64 warnings standing and none of them this ticket's.; `./RUNME.sh branch review` reads check as 1, because its worktree lacks `.claude/skills/level0/.claude-plugin/plugin.json`, which git leaves out, and the tree itself answers 0.; No retro stands in the handback, and the verdict step hands the ticket to one.; The layout case refuses a package importing what its row leaves out: a file under `src/tui/log` importing `src/tui/work` fails it by name.; The stamp case runs the build again on a move under a package, and leaves the binary standing on a moved case file.; Beyond the ask, the diff touches `.vale.ini` alone, and that section reaches a door file under a package."
  - step: implement/reflect
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 6781eb271bb3460317c33e75e513901565ad1c67
    hash_after: 6781eb271bb3460317c33e75e513901565ad1c67
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 61302c5690820f661a0c281024b5bf33ee81174b
    hash_after: 61302c5690820f661a0c281024b5bf33ee81174b
    answered:
      - name: lint
        exit: 0
        said: 81 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 001a0c1f56e6875652e1ffa29ce4f4a5e64e6d3e
    hash_after: 001a0c1f56e6875652e1ffa29ce4f4a5e64e6d3e
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: 81 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box 1670436ae0bb · claude-code-remote · helper-21
    hash_before: c3541d47a18991b705513541cc01a1f4d07dd37c
    hash_after: c3541d47a18991b705513541cc01a1f4d07dd37c
    returns: 2
    why: "design: The help table in `spec/design_output/tui.md` names `act`, `band`, `bands()` and `key()`, and the split gave each a capital.; design: `spec/design_output/tui.md` names `loadColours`, `overPane`, `firstRow` and `listWidth`, and the split gave each a capital.; design: `spec/design_output/tui.md` names `headWide` and `namesWide` under The mouse reaches the window, and the split gave each a capital.; design: The chapter's draw row names `cut`, `pad` and `oneLine`, and the split gave each a capital.; craft: `src/tui/tree/treeflag_test.go` keeps the blank line before the closing brace of `TestAValueFlagWearsATonePerValue`, which the last round named.; craft: `src/tui/frame_test.go` says `frame.HeadWide` and `frame.FootWide` to a reader, the way the last round's finding on that file read.; craft: `src/tui/door_test.go` says `tabMsg` and `tabNamed` to a reader, and the split gave each a capital.; craft: `src/tui/mouse_test.go` says `tabAt` and `src/tui/sort_test.go` says `columnAt`, and the split gave each a capital.; The branch does what the ask calls for: `src/tui/main.go` is the root's one file past the cases, each tab stands under its folder, and every import runs down.; The last round's three design findings have their answer: the two notes point at `src/tui/frame` and `src/tui/tree`, and name `OpenDoor`, `TabMsg` and `TellPort`.; `go build ./...`, `go vet ./...` and `go test ./...` under `src/tui` answer 0, and `gofmt -l .` answers nothing.; `./RUNME.sh check` answers 0 on the branch, with 81 warnings standing, and the ones in this ticket's files stand in the ticket's own record.; `./RUNME.sh branch review` reads check as 1, because its worktree lacks `.claude/skills/level0/.claude-plugin/plugin.json`, and the tree itself answers 0.; No retro stands in the handback, and the verdict step hands the ticket to one.; The layout case refuses a package importing what its row leaves out, and the root case refuses a tab file at the root.; The stamp case runs the build again on a move under a package, and leaves the binary standing on a moved case file.; The widths, the wheel step, the floor width, the no-sort mark, the poll and the ticket schema each stand in one place now, and the cases read them there.; Beyond the ask, the diff touches `.vale.ini` alone, and that section reaches a door file under a package."
  - step: implement/reflect
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 9b07f77b47d0f22daadd9198d1593d96fecafaf5
    hash_after: 9b07f77b47d0f22daadd9198d1593d96fecafaf5
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: d9d78fce6efa8f43f43c5cf9786d1449dcf425be
    hash_after: d9d78fce6efa8f43f43c5cf9786d1449dcf425be
    answered:
      - name: lint
        exit: 0
        said: 84 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: cb685a39af3b39a913cf174873c6e83f36eafc30
    hash_after: cb685a39af3b39a913cf174873c6e83f36eafc30
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: 84 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box 1670436ae0bb · claude-code-remote · helper-25
    hash_before: 78c06bc342372d44e271a03b7fb1584988c95283
    hash_after: 78c06bc342372d44e271a03b7fb1584988c95283
    returns: 3
    why: "design: `spec/design_output/tree-view.md` says the base file marks a preset `Pressed`, and `spec/views/work.base` and `src/tui/tree/base.go` spell the key `pressed`.; craft: `src/tui/mouse_test.go` reads the wheel step under the filter pane as the bare number 3, where `frame.WheelStep` holds it.; craft: `src/tui/panes_test.go` reads the queue's sort key as the bare string \"queue\", where `work.QueueKey` holds it.; craft: The module's imports stand ahead of the standard library in the tree, the log and the work packages and in the root cases, and last in the frame and the draw packages, so one order stands for all.; The branch does what the ask calls for: `src/tui/main.go` is the root's one file past the cases, each tab stands under its folder, and every import runs down.; The last round's findings have their answer: the two notes name `Act`, `Band`, `LoadColours`, `FirstRow`, `HeadWide` and `Cut`, the case messages say the capital names, and the blank line is gone.; `go build ./...`, `go vet ./...` and `go test ./...` under `src/tui` answer 0, and `gofmt -l .` answers nothing.; `./RUNME.sh check` answers 0 on the branch, with 84 warnings standing and none in this ticket's files.; `./RUNME.sh branch review the-notes-point-true` reads check as 1, because its worktree lacks `.claude/skills/level0/.claude-plugin/plugin.json`, and the tree itself answers 0.; No retro stands in the handback, and the verdict step hands the ticket to one.; The layout case refuses a log file importing the work package, and the root case refuses a work file at the root, each fed one in a copy of the source.; The stamp case runs the build again on a move under a package, and leaves the binary standing on a moved case file.; Beyond the ask, the diff touches `.vale.ini` alone, and that section reaches a door file under a package."
  - step: implement/reflect
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: d47d955168f851fa2a7f30a0139d461712045c48
    hash_after: d47d955168f851fa2a7f30a0139d461712045c48
  - step: implement/change
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: 48b7d5eb310975344f1f790a065a5209358cc7ca
    hash_after: 48b7d5eb310975344f1f790a065a5209358cc7ca
    answered:
      - name: lint
        exit: 0
        said: 82 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box 1670436ae0bb · claude-code-remote
    hash_before: e68f5cf8cfef6b84e8138983cb43ee5711fe2a4f
    hash_after: e68f5cf8cfef6b84e8138983cb43ee5711fe2a4f
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: 82 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box 1670436ae0bb · claude-code-remote · helper-29
    hash_before: abb2945380632aadf70620f27e1c1f3205fc5fab
    hash_after: abb2945380632aadf70620f27e1c1f3205fc5fab
    returns: 4
    why: "craft: The root package and the tree package load no palette in their cases, and `src/tui/colour_test.go` loaded it for the one package with `TestMain`, so every colour assertion there passes on bare text.; craft: A probe in a copy of the module fed those cases a palette check, and each failed: the funnel's red in `src/tui/frame_test.go` and `src/tui/model_test.go`, the sorted column's bar in `src/tui/sort_test.go`, the lit column head in `src/tui/workedit_test.go`, and the tone in `src/tui/tree/treeflag_test.go` each assert nothing.; craft: `src/tui/frame_root_test.go` and `src/tui/log/tail_test.go` each spell the three fixture lines and `put`, and `src/tui/model_test.go` and `src/tui/log/detail_test.go` each spell `row`, so one fixture stands in two packages.; The branch does what the ask calls for: `src/tui/main.go` is the root's one file past the cases, each tab stands under its folder, and every import runs down.; The last round's findings have their answer: the note spells `pressed`, the two cases read `frame.WheelStep` and `work.QueueKey`, and one import order stands in every file.; `go build ./...`, `go vet ./...` and `go test ./...` under `src/tui` answer 0, and `gofmt -l .` answers nothing.; `./RUNME.sh check` answers 0 on the branch, with 82 warnings standing, and the ones in this ticket's files stand in the ticket's own record.; `./RUNME.sh branch review the-notes-point-true` reads check as 1, because its worktree lacks `.claude/skills/level0/.claude-plugin/plugin.json`, and the tree itself answers 0.; No retro stands in the handback, and the verdict step hands the ticket to one.; The layout case refuses a log file importing the work package, and the root case refuses a work file at the root, each fed one in a copy of the module.; The stamp case runs the build again on a move under a package, and leaves the binary standing on a moved case file.; Beyond the ask, the diff touches `.vale.ini` alone, and that section reaches a door file under a package."
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

./RUNME.sh branch test src/tui/layout_test.go test/level0/viewer.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

The command answers assertion. Three cases stand, and each reads the tree as
it lies.

| the case | what it holds open |
|---|---|
| each package imports what the chapter says and no more | the frame's folder holds no Go file |
| the root holds the window alone | a colour file stands at the root |
| a move under a package of the window rebuilds the viewer | the stamp reads the root folder alone, so the second build never runs |

The layout case reads the chapter's table as a map, so the table is the one
list and the case follows it. What surprises me is that the root package's
own file names clash with the Go parser's packages, so the case names them
under an alias.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The window's files, the build stamp and its case, the chapter, and this ticket.
- every door the change reaches has a fake. The stamp case drives the build over the fake disk and the fake process, and the layout case reads the tree the tests run in.
- a comment names the approach the change implements. Each case points at the chapter holding the table.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

The fourth round names three classes, each one of the earlier rounds' in
small.

| the class | the finding | the fix |
|---|---|---|
| a rename that reached a data key | the tree-view note said the base file marks a preset with a capital, and the file spells the key small | a search for a renamed name reads what each hit is: a name in code, or a key in a file |
| a value spelled where a name holds it | a wheel step and a sort key stood as a bare number and a bare string in two cases | search the cases for every constant the split exported, and read each one through its name |
| two orders for one thing | the module's own imports stood first in some files and last in others | one order in every file: the standard library, the outside modules, then this module's packages |

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The fixes stay in the window's packages, the cases, and the two notes naming the moved files.
- every door the change reaches has a fake. The fixes reach no door.
- a comment names the approach the change implements. The poll and the exported names each carry a line pointing at their chapter.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The window's files, the build stamp and its case, the chapter, the Vale section naming a door file, and this ticket.
- every door the change reaches has a fake. The stamp case drives the build over the fake disk and the fake process, and the window cases drive the tabs over folders a case writes.
- a comment names the approach the change implements. Each package's files point at the chapter, and the tab interface names what the frame reads beside each method.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test src/tui/layout_test.go test/level0/viewer.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The window's one package becomes the six the chapter names, and every import
runs down. A reader opens one folder to read one tab.

| the change | why |
|---|---|
| `src/tui/draw`, `src/tui/tree`, `src/tui/frame`, `src/tui/log` and `src/tui/work` | each holds what the chapter's row says, and imports what its row says |
| the `Tab` interface grows | the frame reads no record and no ticket tree, so the keys, the mouse, the pane and the footer reach a tab through it |
| the log tab and the work tab own their state | the model's log fields and work fields move into the tabs, and each tab exports what the window tests read |
| the root package builds the tab list | `newModel` hands the log tab and the work tab to the frame, and `Frame` reaches the log tab's rows through its fields |
| the build stamp walks every package | a move under a tab's folder rebuilds the viewer |
| the Vale section for a door file reaches a package | the work tab's door runs the verbs, and the rule reads it as a door |
| the tree gains `Append` and `CursorTo` | the work tab adds the plan's rows beside the ones the index hands over, and a case opens an edit on one column |

The tests move with the code they drive. The tree's, the draw package's and
the log's cases stand in their packages, and the window's cases stay at the
root and reach a tab through the model. The second round repoints the notes
at the moved files, exports the widths, the wheel step, the floor width, the
no-sort mark and the ticket schema the cases read, and puts the poll in the
frame, which both tabs import.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The window's files, the build stamp and its case, the chapter, the Vale section naming a door file, and this ticket.
- every door the change reaches has a fake. The stamp case drives the build over the fake disk and the fake process, and the window cases drive the tabs over folders a case writes.
- a comment names the approach the change implements. Each package's files point at the chapter, and the tab interface names what the frame reads beside each method.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

spec/guidance/review/reviewing.md
spec/tickets/the-window-splits-by-tab.md
spec/design_output/tui.md
spec/design_output/tree-view.md
spec/vocabulary/terms.yml
src/tui/go.mod
.vale.ini
src/scripts/tui-build.js
test/level0/viewer.test.js
src/tui/colour_test.go
src/tui/door_test.go
src/tui/draw/colour.go
src/tui/draw/colour_test.go
src/tui/draw/filter.go
src/tui/draw/link.go
src/tui/draw/text.go
src/tui/draw/wrap.go
src/tui/footer.go
src/tui/frame/door.go
src/tui/frame/filterpane.go
src/tui/frame/footer.go
src/tui/frame/help.go
src/tui/frame/keys.go
src/tui/frame/model.go
src/tui/frame/mouse.go
src/tui/frame/part.go
src/tui/frame/tabs.go
src/tui/frame_root_test.go
src/tui/frame_test.go
src/tui/keys.go
src/tui/layout_test.go
src/tui/log/detail.go
src/tui/log/detail_test.go
src/tui/log/record.go
src/tui/log/said.go
src/tui/log/sort.go
src/tui/log/tab.go
src/tui/log/tail.go
src/tui/log/tail_test.go
src/tui/main.go
src/tui/model_test.go
src/tui/mouse.go
src/tui/mouse_test.go
src/tui/panes_test.go
src/tui/shipped_test.go
src/tui/sort_test.go
src/tui/tabs.go
src/tui/tree/base.go
src/tui/tree/base_test.go
src/tui/tree/preset.go
src/tui/tree/preset_test.go
src/tui/tree/tree.go
src/tui/tree/tree_test.go
src/tui/tree/treedraw.go
src/tui/tree/treeedit.go
src/tui/tree/treeedit_test.go
src/tui/tree/treefilter.go
src/tui/tree/treeflag.go
src/tui/tree/treeflag_test.go
src/tui/tree/treemark.go
src/tui/tree/treemark_test.go
src/tui/tree/treesort.go
src/tui/tree/treesort_test.go
src/tui/ui.go
src/tui/window_test.go
src/tui/work.go
src/tui/work/door.go
src/tui/work/work.go
src/tui/work/workedit.go
src/tui/work/workindex.go
src/tui/work/workitems.go
src/tui/work/workplace.go
src/tui/work/workplaces.go
src/tui/work_test.go
src/tui/workdetail_test.go
src/tui/workedit_test.go
src/tui/workplace_test.go
src/tui/workplaces_test.go

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

- craft: The root package and the tree package load no palette in their cases, and `src/tui/colour_test.go` loaded it for the one package with `TestMain`, so every colour assertion there passes on bare text.
- craft: A probe in a copy of the module fed those cases a palette check, and each failed: the funnel's red in `src/tui/frame_test.go` and `src/tui/model_test.go`, the sorted column's bar in `src/tui/sort_test.go`, the lit column head in `src/tui/workedit_test.go`, and the tone in `src/tui/tree/treeflag_test.go` each assert nothing.
- craft: `src/tui/frame_root_test.go` and `src/tui/log/tail_test.go` each spell the three fixture lines and `put`, and `src/tui/model_test.go` and `src/tui/log/detail_test.go` each spell `row`, so one fixture stands in two packages.
- The branch does what the ask calls for: `src/tui/main.go` is the root's one file past the cases, each tab stands under its folder, and every import runs down.
- The last round's findings have their answer: the note spells `pressed`, the two cases read `frame.WheelStep` and `work.QueueKey`, and one import order stands in every file.
- `go build ./...`, `go vet ./...` and `go test ./...` under `src/tui` answer 0, and `gofmt -l .` answers nothing.
- `./RUNME.sh check` answers 0 on the branch, with 82 warnings standing, and the ones in this ticket's files stand in the ticket's own record.
- `./RUNME.sh branch review the-notes-point-true` reads check as 1, because its worktree lacks `.claude/skills/level0/.claude-plugin/plugin.json`, and the tree itself answers 0.
- No retro stands in the handback, and the verdict step hands the ticket to one.
- The layout case refuses a log file importing the work package, and the root case refuses a work file at the root, each fed one in a copy of the module.
- The stamp case runs the build again on a move under a package, and leaves the binary standing on a moved case file.
- Beyond the ask, the diff touches `.vale.ini` alone, and that section reaches a door file under a package.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place, and a note points at the file instead of repeating it. The chapter's table is the one list and the layout case reads it, and the fixtures standing in two packages are in the findings.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
