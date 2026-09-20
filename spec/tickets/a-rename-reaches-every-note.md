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
step: implement/reflect
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
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 5edfc1ebce49bf1c434c6093e9c2da0de9be2c16
    hash_after: 5edfc1ebce49bf1c434c6093e9c2da0de9be2c16
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-15
    hash_before: 2d206e3d1bc8e20604e57c8a383793e88c9b5213
    hash_after: 2d206e3d1bc8e20604e57c8a383793e88c9b5213
    returns: 1
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | no, the folder per tab stands nowhere tracked |; | is what the diff touches beyond the ask trivial | no, a built binary lands under the window's folder |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |; | does every rule the branch adds carry a test | yes, each move of the verb takes a case |; | does a case feed the rule something bad | yes, a name standing nowhere answers a fault |; | what grade do the findings take | craft, because the approach carries each fix already |; TL;DR:; The verb walks an ending list, so the ignore file and an `.html` keep the old name.; That stale ignore row lets the window's built binary into git.; The approach's package table lands nowhere, and a private note git ignores carries it.; The findings, one a line:; `TEXT` in `src/scripts/rename.js` matches a list of endings, so a name outside it stands.; `git grep -n src/viewer` names `.gitignore` and `spec/funnel/a-button-makes-a-vehicle.html`, each keeping the old name.; `git ls-files -s src/tui/viewer` names a tracked binary, which the change commit adds.; `.gitignore` names the window's binary under its old folder, so the move carried it past.; `filesUnder` answers text files alone, and `renaming` removes the source, so a move drops the rest.; No case feeds the verb a file the ending list leaves out, so the hole passes green.; `spec/design_output/vehicle.md` names the stub's folders under a literal `project`, which `stubFolders` makes false.; The ask's first bullet, a folder per tab, stands under `.se/tickets`, which git ignores.; The park's ground, that the split shares nothing with the verb, reads false against the ask.; The design review passed the package table as this ticket's answer to that bullet.; `spec/design_output/tui.md` names the viewer in prose, beside `viewerOf` and `src/scripts/viewer.js`.; `./RUNME.sh links` answers no row naming a renamed thing, and `./RUNME.sh check` exits 0.; `HANDOVER.md` carries no retro, and `./RUNME.sh branch review` names that as its one fix.; The fixes, one a line:; Read a file by what it holds, not by the ending of its name.; Carry every file a folder holds, so a move drops no binary and no image.; Feed the verb a name outside the ending list and a binary, and assert each lands.; Rewrite `.gitignore` and `spec/funnel/a-button-makes-a-vehicle.html` onto the new name.; Drop the window's built binary from git, and ignore it under its new folder.; Point `spec/design_output/vehicle.md` at `stubFolders`, which owns the stub's folder names.; Land the package table the approach draws, or mint a tracked ticket carrying it.; Write the retro into `HANDOVER.md` before the branch hands back."
  - step: implement/reflect
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 2e36b35730efdb21a10fc2433d42ea1adddb984a
    hash_after: 2e36b35730efdb21a10fc2433d42ea1adddb984a
  - step: implement/change
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 652c8d68aa2d4aeeae151950bfc050b29eb88ff7
    hash_after: 652c8d68aa2d4aeeae151950bfc050b29eb88ff7
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 0eb9ad6feedf · claude-code-remote
    hash_before: 14b2a5d35903348148d45a64fb7ba047f641d60f
    hash_after: 14b2a5d35903348148d45a64fb7ba047f641d60f
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 0eb9ad6feedf · claude-code-remote · helper-17
    hash_before: ca07c7fd3a1b9008d9686a1a0063295a1d78d81c
    hash_after: ca07c7fd3a1b9008d9686a1a0063295a1d78d81c
    returns: 2
    why: "| the question reviewing asks | the answer |; |---|---|; | does the branch do what the ask asks | no, the split ticket stands `draft`, and the queue takes `open` |; | is what the diff touches beyond the ask trivial | yes, each file outside the ask takes the new name |; | what does `./RUNME.sh check` answer | 0 on this commit |; | does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |; | does every rule the branch adds carry a test | yes, each move of the verb takes a case |; | does a case feed the rule something bad | yes, a file with no ending, a picture, and a name standing nowhere |; | what grade do the findings take | craft, because one verb run and one field carry the fix |; TL;DR:; This round closes each of the five findings the verdict before it names.; `spec/tickets/the-window-splits-by-tab.md` stands `draft`, and the queue reads `open` alone.; So the ask's first bullet lands in a ticket no pull hands out.; The findings, one a line:; `filesUnder` in `src/scripts/rename.js` answers every file, whatever the ending of its name.; A case feeds the move a file with no ending and a picture, and asserts each lands.; `spec/funnel/a-button-makes-a-vehicle.html` and the ignore file each take the new name.; `git ls-files` names no binary under the window's folder, so this round drops it.; `spec/design_output/vehicle.md` points at `stubFolders`, which owns the stub's folder names.; `spec/tickets/the-window-splits-by-tab.md` stands tracked, and carries the package table.; `placesIn` in `src/scripts/work-answer.js` queues a ticket whose `state` reads `open`.; That ticket reads `draft`, so the queue holds it nowhere and no pull hands it out.; Its Ask passes Vale, so `./RUNME.sh ticket open` takes it as it stands.; It names no `group`, where every sibling on this branch names one.; `BINARY` in `src/scripts/rename.js` reads an ending, so a binary with none rewrites.; The ignore file names `src/tui/viewer`, which the module `quackitect/tui` builds nowhere.; The package table stands in this ticket's approach and in the ticket it mints.; `./RUNME.sh check` exits 0, and `./RUNME.sh links` answers no row holding a renamed name.; `HANDOVER.md` carries no retro, and `./RUNME.sh branch review` names that as its one fix.; The fixes, one a line:; Run `./RUNME.sh ticket open the-window-splits-by-tab`, so the queue reaches it.; Name `group: the-tree-names-its-things` on it, so it lands under this branch.; Read a file by the bytes it holds, so a binary with no ending stands.; Drop the `src/tui/viewer` rows from the ignore file, which name a build standing nowhere.; Point this ticket's approach at the minted ticket, which owns the package table now.; Write the retro into `HANDOVER.md` before the branch hands back."
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

Two classes carry the findings.

| the class | the findings in it | the fix for the class |
|---|---|---|
| a walk answers a part, and its caller reads it as the whole | the tracked binary, the two names the rewrite misses, the files a move drops | `filesUnder` answers every file, and each caller names the part it wants |
| a decision lands where git holds nothing | the folder per tab, parked as a note | the split mints as a tracked ticket, which the branch hands on |

The first class is one function read two ways. `filesUnder` filters by ending, and both callers take it as every file. The move copies that list and removes the source, so a file outside the list falls away. The rewrite reads the same list, so a name with no ending and a page of markup stand outside every rename.

The binary under the window's folder is that class standing. The move carried it, the ignore line named the old path, and the rewrite reached neither. The note repeating the stub's folders is the voice rule about one owner, and it lands in the same round.

The second class is the sharper one. A note under the private folder is a thing git ignores, so a line the ask asks for stands in no tracked file. The verdict names that right: either the split lands here, or it mints as a ticket a reader finds. This round mints it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The verb, its cases, the ignore line, the page of markup, the vehicle note, and the ticket this round mints.
- every door the change reaches has a fake. Each case drives the fake disk, and the new case feeds it a file with no ending.
- a comment names the approach the change implements. The walk's comment names what it answers, and each caller names the part it takes.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The verb, its cases, the ignore line, the page of markup, the vehicle note, and the ticket this round mints.
- every door the change reaches has a fake. Each case drives the fake disk, and the new case feeds it a file with no ending and a picture.
- a comment names the approach the change implements. The walk's comment names what it answers, and each caller names the part it takes.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/rename.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The walk answers every file now, and each caller names the part it takes.

| what changes | how |
|---|---|
| `filesUnder` | answers every file under a folder, whatever its ending |
| `writtenFiles` | answers the ones a reader reads as text, which the rewrite takes |
| the move | takes the whole list, so a file of any ending carries |
| the ignore line | names the window's folder under its new name |
| the page of markup and the vehicle note | each takes the name the code now owns |
| `spec/tickets/the-window-splits-by-tab.md` | the folder per tab, minted where a reader finds it |

The round before this walked by a list of endings, and both callers read that as every file. So the move dropped what the list left out, and the rewrite reached neither a file without an ending nor a page of markup. A binary rode the folder move past the ignore line, and this round drops it.

The park does not hold, and the verdict names that right. A note under the private folder is a thing git ignores, so a line the ask asks for stood in no tracked file. The split now stands as a ticket carrying the package table the design settled, and the branch hands it on.

What this leaves for the owner at the merge. The bare word naming the older shape stands in the window's own files, in `viewerOf`, in the binary's name and in the vocabulary. The three renames this ticket ran moved a folder, a note and a module, and each left that word alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out. The verb, its cases, the ignore line, the page of markup, the vehicle note, and the ticket this round mints.
- every door the change reaches has a fake. Each case drives the fake disk, and the new case feeds it a file with no ending and a picture.
- a comment names the approach the change implements. The walk's comment names what it answers, and each caller names the part it takes.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- .claude/skills/level0/lib/vale.js
- .claude/skills/level0/lib/vehicle.js
- .github/workflows/check.yml
    - .gitignore
- HANDOVER.md
- spec/config/styles/colours.json
- spec/design_input/the-tree-view-editor.md
- spec/design_output/config.md
- spec/design_output/extension.md
- spec/design_output/index.md
- spec/design_output/level0.md
- spec/design_output/log.md
- spec/design_output/tree-view.md
- spec/design_output/tui.md
- spec/design_output/vehicle.md
- spec/funnel/a-button-makes-a-vehicle.html
- spec/tickets/a-base-file-says-it.md
- spec/tickets/a-cell-takes-an-edit.md
- spec/tickets/a-pointer-names-its-heading.md
- spec/tickets/a-preset-carries-its-sort.md
- spec/tickets/a-rename-reaches-every-note.md
- spec/tickets/the-cell-fill-takes-marks.md
- spec/tickets/the-colours-stand-in-config.md
- spec/tickets/the-flags-draw-as-letters.md
- spec/tickets/the-help-reads-the-cursor.md
- spec/tickets/the-mouse-reaches-the-window.md
- spec/tickets/the-runtime-files-stand-apart.md
- spec/tickets/the-tree-draws-its-columns.md
- spec/tickets/the-tree-sorts-several-keys.md
- spec/tickets/the-tree-takes-a-filter.md
- spec/tickets/the-viewer-draws-the-note.md
- spec/tickets/the-viewer-filters-the-talk.md
- spec/tickets/the-window-grows-a-frame.md
- spec/tickets/the-window-splits-by-tab.md
- spec/tickets/the-work-editor-draws.md
- spec/tickets/the-work-tab-draws.md
- spec/tickets/verbs-read-two-roots.md
- spec/vocabulary/terms.yml
- src/bridge/window.js
- src/config/config_test.go
- src/lsp/panel_test.go
- src/scripts/ask-lint.js
- src/scripts/cli.js
- src/scripts/pull.js
- src/scripts/rename.js
- src/scripts/stub.js
- src/scripts/ticket.js
- src/scripts/tui.js
- src/scripts/viewer.js
- src/scripts/work-answer.js
- src/scripts/work-list.js
- src/scripts/work.js
- src/tui/base.go
- src/tui/base_test.go
- src/tui/colour.go
- src/tui/colour_test.go
- src/tui/detail.go
- src/tui/detail_test.go
- src/tui/door.go
- src/tui/door_test.go
- src/tui/filter.go
- src/tui/footer.go
- src/tui/frame_test.go
- src/tui/go.mod
- src/tui/go.sum
- src/tui/help.go
- src/tui/keys.go
- src/tui/main.go
- src/tui/model_test.go
- src/tui/mouse.go
- src/tui/mouse_test.go
- src/tui/preset.go
- src/tui/preset_test.go
- src/tui/record.go
- src/tui/sort.go
- src/tui/sort_test.go
- src/tui/tabs.go
- src/tui/tail.go
- src/tui/tail_test.go
- src/tui/tree.go
- src/tui/tree_test.go
- src/tui/treedraw.go
- src/tui/treeedit.go
- src/tui/treeedit_test.go
- src/tui/treefilter.go
- src/tui/treeflag.go
- src/tui/treeflag_test.go
- src/tui/treemark.go
- src/tui/treemark_test.go
- src/tui/treesort.go
- src/tui/treesort_test.go
- src/tui/ui.go
- src/tui/viewer
- src/tui/work.go
- src/tui/work_test.go
- src/tui/workitems.go
- src/tui/wrap.go
- test/level0/go-tests.test.js
- test/level0/pull-leaves.test.js
- test/level0/rename.test.js
- test/level0/stub.test.js
- test/level0/viewer.test.js

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

fail

| the question reviewing asks | the answer |
|---|---|
| does the branch do what the ask asks | no, the split ticket stands `draft`, and the queue takes `open` |
| is what the diff touches beyond the ask trivial | yes, each file outside the ask takes the new name |
| what does `./RUNME.sh check` answer | 0 on this commit |
| does a retro stand in the handback | no, `./RUNME.sh branch review` reads it absent |
| does every rule the branch adds carry a test | yes, each move of the verb takes a case |
| does a case feed the rule something bad | yes, a file with no ending, a picture, and a name standing nowhere |
| what grade do the findings take | craft, because one verb run and one field carry the fix |

TL;DR:

- This round closes each of the five findings the verdict before it names.
- `spec/tickets/the-window-splits-by-tab.md` stands `draft`, and the queue reads `open` alone.
- So the ask's first bullet lands in a ticket no pull hands out.

The findings, one a line:

- `filesUnder` in `src/scripts/rename.js` answers every file, whatever the ending of its name.
- A case feeds the move a file with no ending and a picture, and asserts each lands.
- `spec/funnel/a-button-makes-a-vehicle.html` and the ignore file each take the new name.
- `git ls-files` names no binary under the window's folder, so this round drops it.
- `spec/design_output/vehicle.md` points at `stubFolders`, which owns the stub's folder names.
- `spec/tickets/the-window-splits-by-tab.md` stands tracked, and carries the package table.
- `placesIn` in `src/scripts/work-answer.js` queues a ticket whose `state` reads `open`.
- That ticket reads `draft`, so the queue holds it nowhere and no pull hands it out.
- Its Ask passes Vale, so `./RUNME.sh ticket open` takes it as it stands.
- It names no `group`, where every sibling on this branch names one.
- `BINARY` in `src/scripts/rename.js` reads an ending, so a binary with none rewrites.
- The ignore file names `src/tui/viewer`, which the module `quackitect/tui` builds nowhere.
- The package table stands in this ticket's approach and in the ticket it mints.
- `./RUNME.sh check` exits 0, and `./RUNME.sh links` answers no row holding a renamed name.
- `HANDOVER.md` carries no retro, and `./RUNME.sh branch review` names that as its one fix.

The fixes, one a line:

- Run `./RUNME.sh ticket open the-window-splits-by-tab`, so the queue reaches it.
- Name `group: the-tree-names-its-things` on it, so it lands under this branch.
- Read a file by the bytes it holds, so a binary with no ending stands.
- Drop the `src/tui/viewer` rows from the ignore file, which name a build standing nowhere.
- Point this ticket's approach at the minted ticket, which owns the package table now.
- Write the retro into `HANDOVER.md` before the branch hands back.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every fact the change adds stands in one place, and a note points at the file. `spec/design_output/index` owns the verb's chapter, and each function in `src/scripts/rename.js` points at it. `spec/design_output/vehicle.md` points at `stubFolders` where it listed the stub's folders. The package table stands twice, in this ticket's approach and in the ticket it mints, which a finding names.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
