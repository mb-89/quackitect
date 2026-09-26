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
step: implement/tests-green
record:
  - step: design/draft
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: d8d7a14f7b5c7143e1ef95a74740fbfa5a60455e
    hash_after: d8d7a14f7b5c7143e1ef95a74740fbfa5a60455e
  - step: design/review
    hand: box b8ae1b45d463 · claude-code-remote · helper-2
    hash_before: a97d277889be7fc53bf771e768a9db5ba35c2343
    hash_after: a97d277889be7fc53bf771e768a9db5ba35c2343
  - step: implement/tests-red
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: cf5d895274c18c601385d439aebeeae36cecc7a0
    hash_after: cf5d895274c18c601385d439aebeeae36cecc7a0
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/change
    hand: box b8ae1b45d463 · claude-code-remote
    hash_before: 78ffc558d9d47f8d9fe76a2997371d81a673e088
    hash_after: 727eef5c69dfbccfe964f650fcdb0cf1ec44bf40
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-small-faults-land.md:184:5: Characters: The character ] stands outside the set a paragraph admits: lett"
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

The approach meets every `done_when` line. The implement step fixes these rows in place:

- The three pages draw the warning, and `saysGreen` in `.claude/skills/level0/lib/runs.js` reads any warning as red. So the push and `./RUNME.sh branch done` refuse while the pages stand, and `./RUNME.sh check` still exits 0. The implement step lands the warning as the ask writes it and moves no page itself: the owner moves them. It adds no ignore list, no lower severity and no exemption to turn the stamp green. It closes `tests-green` on the check, then stops before the push with the three pages named to the owner. The push waits for the owner's move, as [[spec/guidance/working]] rule 10 says.
- `fault` answers `error` in `src/lsp/finding.go` and in `.claude/skills/level0/lib/schema-fault.js`. `folderFault` sets `warning` on both sides, or the check goes red.
- Go's `schemasIn` holds the note schemas alone, so the Go row drops the clause on a data schema. `spec/processes/*.yaml` stands under no note glob, so the two sides agree.
- The callers list adds `src/bridge/apply.js` and `src/bridge/tools.js`, which call `onWrite` and so reach `schemaDoor`. `onToolWrite` refuses the harness's own write tools inside the tree already.
- The funnel table says the rulings in the tree's voice, and a design input holds the owner's own words. The design input names that table as the source of each quote, and the implement step asks the owner where a row needs the owner's exact words.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/write.test.js test/level0/schema-sweep.test.js src/lsp

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the sweep case fails: `schemaFaults` passes over a path off `.md` in both Go and JavaScript
- the door case fails: `schemaDoor` returns at once for a path off `.md`
- what surprises the hand: `fault` answers error on both sides, so the new finding sets warning itself

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: the sweep on both sides, the door, the funnel note and a design input
- [x] every door the change reaches has a fake: the sweep reads a fixture tree, and the door case a fake disk
- [x] a comment names the approach the change implements: each case points at this ticket
- [x] every fact the change adds stands in one place: one message builder a side, and the Go side reads the JavaScript wording
- [x] every row the design review passes with stands fixed in the change: severity, callers, the Go clause and the source of the rulings

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- [x] the change touches no file the ask leaves out: both sweeps, the door, the funnel note and the design input the ask names
- [x] every door the change reaches has a fake: the door case runs over a fake disk and a fake log
- [x] a comment names the approach the change implements: `folderFault` on both sides and `strangerFile` point at this ticket
- [x] every fact the change adds stands in one place: the Go message names the JavaScript `folderFault` as the wording it keeps
- [x] every row the design review passes with stands fixed in the change: warning on both sides, the Go side reads note schemas alone, the design input names its source

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
