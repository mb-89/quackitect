---
kind: [[ticket]]
state: open
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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 564e3972dc6f22df3e7e66a00bc755f63d2342f7
    hash_after: 564e3972dc6f22df3e7e66a00bc755f63d2342f7
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-2
    hash_before: c9fae140c4344a7f632bcef7824225fcd9f99743
    hash_after: c9fae140c4344a7f632bcef7824225fcd9f99743
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, the read move and the prove move miss a path reach |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit, with the server standing |; | does the verb the approach adds carry a proof | no, the prove move rests on `links` alone |; | does every claim carry a proof | no, three rows read false against the code |; TL;DR:; The index link table holds a note link alone, so a path reach stands outside it.; `./RUNME.sh links` answers the note links resolving to nothing, so a stale import passes green.; The literal `project` stands in the vehicle library, which the approach's table leaves out.; `spec/design_output/tree` owns the rules weighing two files, so the verb wants another owner.; The findings, one a line:; `linksIn` in `src/index/front.go` records a note link, and the link table holds those alone.; So the read move asks `grep` beside `links`, and the approach names the two.; `./RUNME.sh links` answers `dangling`, which names a note link resolving to nothing.; So the prove move runs `./RUNME.sh check` too, as the ask's last bullet asks.; `STUB_FOLDERS` holds the literal `project` in `.claude/skills/level0/lib/vehicle.js`.; `stubInto` reads that constant, so the rename reaches a file the table leaves out.; `spec/design_output/index` owns the questions the index answers, and the verb asks one.; `spec/design_output/tui` carries the old name, and every note link naming it rides along.; The folder table matches the two tabs `src/tui/ui.go` builds, the log and the work."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: f040bbc750f7329f8e73dffa9d88432da60abf0c
    hash_after: f040bbc750f7329f8e73dffa9d88432da60abf0c
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-4
    hash_before: f3164a73dff9ad0b71e3b0cc4267f8b1525d576a
    hash_after: f3164a73dff9ad0b71e3b0cc4267f8b1525d576a
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, the folder table meets an import loop Go refuses |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |; | does the verb the approach adds carry a proof | no, the prove move reads an exit that stays 0 |; | does every claim carry a proof | yes, each row reads true against the code |; | what grade do the findings take | design, because each one moves the approach |; TL;DR:; A tab method takes `*model`, so a tab package and the frame reach each other.; `./RUNME.sh links` exits 0 over the rows it answers, so a stale pointer rides along.; `spec/design_output/tui` carries the old name, and the two renames leave it standing.; The findings, one a line:; `tab` in `src/tui/tabs.go` passes `*model` into every method but `Name`.; `src/tui/ui.go` holds `model`, so a tab package reaches back into the frame.; `newModel` builds `[]tab{logTab{}, workTab{}}`, so the frame reaches each tab package.; Both reaches standing shuts an import loop, and the Go build refuses it.; So the approach says where `model` lands, and the folder table stands on that.; `./RUNME.sh links` calls `dangling`, and exits 0 over every row it answers.; So the prove move reads the rows naming the old name, and asserts none stands.; The ask asks a name to say what the thing is, and that note names the viewer.; So the rename list holds `spec/design_output/tui` beside the folder and the stub.; The read move, the write move and the stub rows each read true against the code."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 1a6533e8e864e028acdb8c1d18762b5d0a1e6d00
    hash_after: 1a6533e8e864e028acdb8c1d18762b5d0a1e6d00
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-6
    hash_before: 712681471b328341be22add5d1aca0cd9971ce4f
    hash_after: 712681471b328341be22add5d1aca0cd9971ce4f
    returns: 3
    why: "| the question reviewing asks | the answer |; |---|---|; | does the approach answer the ask | no, the frame and the tree package reach each other |; | is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |; | does the verb the approach adds carry a proof | yes, the prove move reads rows, then the check |; | does every claim carry a proof | no, the tree row's import direction reads false |; | what grade do the findings take | design, because the package table moves |; TL;DR:; `model` holds a `*Tree`, so the frame package imports the tree package.; The tree draws through `cut` and `dimStyle`, which the frame holds.; Both reaches standing shuts an import loop, and the Go build refuses it.; The findings, one a line:; `src/tui/ui.go` holds `work *Tree` on `model`, so the frame reaches the tree.; `Tree.Rows` in `src/tui/treedraw.go` calls `cut` and `dimStyle` to draw a row.; `cut` stands in `src/tui/ui.go`, and `dimStyle` in `src/tui/colour.go`.; So the tree reaches back, against the one-way arrow the package table draws.; So the approach says where the width helper and the styles land, and the table stands on that.; The tab rows, the read move, the write move, the prove move and the stub rows read true.; The draft closes every finding the two rounds before this one name."
  - step: design/draft
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 2c3653b24a853fdf9a725df1ec3f4dbf144b04f7
    hash_after: 2c3653b24a853fdf9a725df1ec3f4dbf144b04f7
  - step: design/review
    hand: box 0eb9ad6feedf · claude-code-remote · helper-8
    hash_before: 0643feab029aa69a514a65475935acd8cfeb18e0
    hash_after: 0643feab029aa69a514a65475935acd8cfeb18e0
  - step: implement/tests-red
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: d6ffbc036ca58aea7fe97ec5e6ddc5e72c2409a4
    hash_after: d6ffbc036ca58aea7fe97ec5e6ddc5e72c2409a4
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: f264223a7ae6875b9f62889da3ed87999ad07f8d
    hash_after: f264223a7ae6875b9f62889da3ed87999ad07f8d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

A name says what the thing is now, and one verb carries the rename through the tree.

The viewer, the stub and the tree keep names from an older shape, and each rename costs a sweep.

- `src/tui` reads as the TUI, with a folder per tab.
- The stub reads as the project it names.
- One verb renames a thing and reaches every note, path and test using it.
- `./RUNME.sh check` exits 0, and `./RUNME.sh links` names no stale pointer.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

One verb renames, and the standing names ride it. So the verb carries its own proof, and the next rename costs one command.

| what changes | how |
|---|---|
| `./RUNME.sh rename <from> <to>` | moves a path, and rewrites every reach it finds |
| `src/tui` | becomes `src/tui`, with a package per tab under it |
| `spec/design_output/tui` | becomes `spec/design_output/tui`, and every pointer naming it rides the verb |
| `STUB_FOLDERS` in `.claude/skills/level0/lib/vehicle.js` | holds the stub's own name where it holds `project` today |
| [[spec/design_output/index]] | says what the verb asks the index, because that note owns the questions the index answers |

The verb works in three moves:

| the move | what it asks | what it catches |
|---|---|---|
| read | the index's `links`, then `grep` over the tracked files | a note link, then an import, a path and a name in prose |
| write | the move, then a rewrite of each reach the read answers | the pointers the read found |
| prove | the rows `./RUNME.sh links` answers, then `./RUNME.sh check` | a row naming the old name, then every other rule |

The read move asks two readers, because each answers half. `linksIn` in `src/index/front.go` records a note link, so the link table holds those alone. A Go import, a shell path and a name in prose stand outside it, and `grep` over the tracked files answers those.

The prove move reads rows, because `./RUNME.sh links` calls `dangling` and exits 0 over every row it answers. So the verb asserts no row names the old name, then runs the check, which is the last line the ask asks for.

**The packages.** A tab method takes `*model`, `model` holds the tree, and the tree draws through the frame's own helpers. So a folder per tab shuts an import loop, which the Go build refuses. What two sides share lands below both of them:

| the package | what it holds | what it imports |
|---|---|---|
| `src/tui/draw` | `cut`, the palette, the styles, and the parts a detail holds | nothing of this tree's |
| `src/tui/tree` | the tree and the rows it draws | `src/tui/draw` |
| `src/tui/frame` | `model`, the `tab` interface, and the rendering a tab calls | the draw and the tree packages |
| `src/tui/log` | the log tab | `src/tui/frame` |
| `src/tui/work` | the work tab | `src/tui/frame` |
| `src/tui` | the window, which builds the tab list | the frame and each tab |

So every arrow runs down: the window to each tab, each tab to the frame, the frame to the tree and the drawing. That costs a capital on each name a package hands out, and it buys a reader who opens one tab.

**The stub.** `STUB_FOLDERS` holds its paths under a literal `project`, and `stubInto` reads that constant. Each takes the stub folder's own name instead, so a reader opening a stub reads the project it names.

The verb lands first, and the renames run through it. A rename a hand makes by sweep proves nothing about the verb.

## review

<!-- reads the approach against the ask -->

### verdict

pass

| the question reviewing asks | the answer |
|---|---|
| does the approach answer the ask | yes, each of the four bullets meets a move |
| is what the draft touches beyond the ask trivial | yes, the draft writes this ticket alone |
| what does `./RUNME.sh check` answer | 0 on this commit |
| does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |
| does the verb the approach adds carry a proof | yes, the prove move reads rows, then the check |
| does every claim carry a proof | yes, each row reads true against the code |
| what grade do the findings take | none, the draft closes every finding before it |

TL;DR:

- The draw package takes `cut` and the styles, so the tree stops reaching the frame.
- The window builds the tab list, so the frame stops reaching a tab package.
- Every arrow the package table draws runs down, and the Go build takes it.

The findings, one a line:

- `cut` and `pad` stand in `src/tui/ui.go`, and the draw package takes both.
- `Tree.Rows` in `src/tui/treedraw.go` draws through `cut` and `dimStyle`.
- The tree's own files reach `model` nowhere, so the tree stands under the frame.
- `newModel` in `src/tui/ui.go` builds the tab list, and the window takes that line.
- `linksIn` in `src/index/front.go` records a note link, and `grep` answers the rest.
- `./RUNME.sh links` calls `dangling`, which exits 0, so the prove move reads its rows.
- `STUB_FOLDERS` in `.claude/skills/level0/lib/vehicle.js` holds the literal `project`.
- `stubInto` in `src/scripts/stub.js` reads that constant, so one edit reaches the stub.
- `spec/design_output/index` owns the questions the index answers, and the verb asks one.
- The rename list holds `spec/design_output/tui`, which the ask's first bullet reaches.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/rename.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The command answers assertion, and each case fails on its own assertion.

| the case | what it holds open |
|---|---|
| a reach is a line naming the old name | `reachesIn` stands nowhere |
| a rewrite leaves a longer word alone | `renamedText` stands nowhere |
| the move carries the folder and rewrites each reach | `renaming` stands nowhere |
| a name standing nowhere answers a fault | the same |

The module has to stand before the cases read as assertions. A named import of a name nobody wrote breaks the whole file, and the door reads build over that. So the module ships with its header alone, and each case asks its name is a function first.

The second case carries the part that surprises me. A rewrite over the bare word `viewer` reaches a word holding it, and a tree full of prose holds many. So the case feeds `view` against a text naming `viewer`, and asserts the text stands. The word edge is the rule the verb turns on.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. One case file, the module's header, and this ticket.
- every door the change reaches has a fake. Each case drives the fake disk, and the move case hands its own git door.
- a comment names the approach the change implements. The module's header names what a reach is, and each case points at this ticket.

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

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The verb and its case file, the stub's folders, and every file the three renames reach.
- every door the change reaches has a fake. Each case drives the fake disk, and the git door rides as an option the case leaves out.
- a comment names the approach the change implements. The verb's chapter stands under the index note, and each case points at this ticket.

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
