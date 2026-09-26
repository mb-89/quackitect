---
kind: [[ticket]]
state: open
group: each-thing-stands-in-place
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
step: design/review
record:
  - step: design/draft
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: d8d7a14f7b5c7143e1ef95a74740fbfa5a60455e
    hash_after: d8d7a14f7b5c7143e1ef95a74740fbfa5a60455e
---

# Ask

A governed folder holds its own kind alone, so a reader finds a note where its schema says.

The check and the write door read a note alone. A page or a screenshot then lands in a governed folder, and the check stays clean. A funnel note carries the owner's rulings.

- `schemaFaults` in `src/lsp/schema.go` and in `.claude/skills/level0/lib/schema.js` draw a finding at warning over a file past its folder's kind. `src/lsp/schema_test.go` and `test/level0/schema-sweep.test.js` each hold a page under `spec/funnel`
- `schemaDoor` in `src/bridge/write.js` refuses a write past the folder's kind, and a case in `test/level0/write.test.js` holds a screenshot under `spec/tickets`
- each page past its folder's kind draws its warning in the Problems panel, and the owner moves it
- `spec/funnel/the-editor-draws-the-trace.md` holds no ruling, and each of its rulings stands in a design input quoting the owner
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A note schema governs a folder through a `governs` glob, and a data schema
names its own glob. So a file past its folder's kind is a path a note schema
governs that ends off `.md`, and that no data schema governs.

| the piece | the change |
|---|---|
| `schemaFaults` in `src/lsp/schema.go` | a path off `.md` that `governorOf` places under a note schema draws a `Folder` finding at warning, naming the kind the folder holds |
| `schemaFaults` in `.claude/skills/level0/lib/schema.js` | the same finding, where `governorOf(data, path)` answers nothing and `governorOf(schemas, path)` answers a schema |
| `folderFault` in both files | one message: the path, the kind, and where the file belongs off the governed tree |
| `schemaDoor` in `src/bridge/write.js` | a write off `.md` under a note schema's folder comes back refused with the same message, and logs at warn |

The funnel note:

- a design input `spec/design_input/the-editor-draws-the-trace.md` carries each ruling as the funnel table records it, under the owner's words
- the funnel note's rulings chapter becomes a pointer at that design input, and its scope keeps the state of play
- the owner's words stand in the funnel table alone, so the design input quotes that table row by row

The pages standing past their folders draw the warning, and the owner moves them:

- `spec/design_input/harnesssurface_2.html`
- `spec/design_input/the-agent-pulls-tickets.html`
- `spec/funnel/the-bench-reruns-design-inputs.html`

`spec/views/work.base` stands in a folder no schema governs, so it draws nothing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/lsp/check.go`, the sweep calling `schemaFaults`
- `src/scripts/cli-read.js`, the lint calling `schemaFaults`
- `src/bridge/write.js`, the write hook running `schemaDoor` among its checks
- `spec/funnel/the-retro-reads-the-structure.md`, which points at the funnel note

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/lsp/schema_test.go`, `TestAPagePastTheFolderKindWarns`, a page under `spec/funnel`
- `test/level0/schema-sweep.test.js`, "a page under a note folder draws a warning, and a data file under its own schema draws none"
- `test/level0/write.test.js`, "a screenshot written under spec/tickets comes back refused, naming the ticket kind"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] every file, function and verb the approach names stands opened, and each claim checked there: both `schemaFaults`, both `governorOf`, `schemaDoor`, the schemas' `governs` globs and the funnel note stand read
- [x] the callers list names every caller of what the approach changes: a search for `schemaFaults(` and `schemaDoor` backs it
- [x] every done_when line names the test that decides it: the sweep lines map to the Go and JS cases, the door line to the write case, the funnel line to the design input, and the check line to `./RUNME.sh check`

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass

- Go's `Tree.Paths` lists every file, `.md` or not. `diskHolds` walks every file, and the index route answers every tracked row, a binary one with empty text. So the Go sweep meets the pages. An untracked file under `.se/tickets` stands off the index route, and `schemaDoor` holds that folder instead.
- The warnings hold every box. `stamped` in `src/scripts/cli-stamp.js` writes the lint's warnings into the stamp, and `saysGreen` in `.claude/skills/level0/lib/runs.js` reads any warning as red. So `batterySays` in `src/scripts/work.js` refuses `./RUNME.sh branch done`, and `holds` in `src/scripts/prepush.js`, `src/scripts/push-verb.js` and the gate in `src/bridge/bash.js` refuse the push, while the three pages stand. `./RUNME.sh check` still exits zero. The approach names the order: the owner moves the pages before the change lands, or the move lands in the same commit on the owner's word.
- `fault` answers `error` in `src/lsp/finding.go` and in `.claude/skills/level0/lib/schema-fault.js`. The new finding sets warning past it on both sides, or the lint refuses and the check goes red.
- Go's `schemasIn` holds the note schemas alone and reads no data schema, so the Go row drops the clause on a data schema. No harm follows, since `spec/processes/*.yaml` stands under no note glob.
- `onToolWrite` refuses the harness's own write tools inside the tree already, so `schemaDoor` meets a page through `onWrite` alone. The callers list adds `src/bridge/apply.js`, the patch door calling `onWrite`. A page copied in through Bash meets no door, and the sweep's warning catches it.
- The funnel table says the rulings in the tree's voice. The design input names that table as the source of the owner's words, so a reader finds where each quote comes from.

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
