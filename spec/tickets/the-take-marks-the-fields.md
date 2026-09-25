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
step: implement/tests-red
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 838d350b32ef84ab8c18c291d0972ef6423401e5
    hash_after: 838d350b32ef84ab8c18c291d0972ef6423401e5
  - step: design/review
    hand: person
    hash_before: e162d3de5052bf1d0c8ed8dd215c87d20abef62e
    hash_after: e162d3de5052bf1d0c8ed8dd215c87d20abef62e
---

# Ask

A person taking a ticket in the editor sees which fields the step in hand still wants. Each field says what it asks, with no read of the route.

A person hunts the frontmatter for the fields to write, and a hand-back fails on a field the person misses.

- a take underlines every field the step still wants, at information level. `node --test test/level0/fields-to-fill.test.js` decides it
- the take puts the cursor on the next field to fill, and the same file decides it
- a put-back takes every underline away, and the same file decides it
- a hover shows the step's does, and the field's form and says. The same file decides it
- the underlines block no commit and no push, and ./RUNME.sh check answers zero with them standing

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A person's hold on a ticket marks every field its leaf still wants, as a wavy underline in the editor's information colour, and a hover over the mark names what the field asks. The change adds `## A take marks the fields` under `# A ticket carries its buttons` in [[spec/design_output/extension]], and the code comments point there.

| the part | where it stands | what it does |
|---|---|---|
| the choices | `src/extension/lib/fields.js`, `fieldMarksOf(door)` | reads the holds through `holdsIn` of `lib/lens.js`, and answers the marks of a ticket a person holds |
| the editor calls | `src/extension/editor-fields.js`, `fieldDoor(context, folder)` | draws the marks as a decoration, and answers the hover |
| the wiring | `activate` in `src/extension/extension.js` | hands the host the ticket text from `onEditors` and `onChange`, and the hold watch |

The rules the host reads, each from its owner through `door.imports`, as `lib/route-host.js` reads `schema.js`:

- the leaf a hold names: `leafOf` in `src/scripts/pull-route.js`, with its `does`, its `evidence` and the `checklist` it inherits
- a field still wanted: its entry in `chapterOf` of `src/scripts/pull-chapter.js` holds no line, so a heading carrying comments alone still wants its text
- the line of a heading: `readNote` and `sectionAt` of `.claude/skills/level0/lib/schema.js`

The marks follow the hold, and no take or put-back needs a hook of its own:

- a hold whose hand reads person names the ticket: every field the leaf still wants takes a mark, the evidence in route order and `checked` last, as the pull prints them. A field missing its heading marks the leaf's heading
- a hold the person newly takes puts the cursor on the first mark through `door.jumps`, the call the drawing's jump takes. A hold standing at activation moves no cursor
- no person's hold names the ticket, after a drop or a hand-back: the ticket carries no mark
- an edit filling a field takes its mark away on the next change

The hover over a mark shows the leaf's path and `does`, then the field's name, `form` and `says`. On `checked`, it lists the checklist items.

The marks stay out of the Problems panel, as the owner settles under Discussion. VS Code lists every entry of a `DiagnosticCollection` there, so the door draws them through `createTextEditorDecorationType`, with `underline wavy` in `editorInfo.foreground`, and answers the hover through `registerHoverProvider`. No check, commit or push reads a decoration, so the marks block nothing.

The tree holds no design input on the blue line of the earlier versions. A search of `spec/design_input` for blue, underline and decoration finds nothing, so this design stands on the ask alone.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/extension/extension.js`, `activate`: wires `fieldMarksOf` where the door carries `marksFields`
- `src/extension/editor.js`, `editorDoor`: spreads `fieldDoor` beside the other doors
- `test/level0/sidebar.test.js`, the `activate` cases: a fake door carrying no `marksFields` skips the wiring, so they stand unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/fields-to-fill.test.js`, "a take marks every field the step still wants, and the door draws them in the information colour"
- `test/level0/fields-to-fill.test.js`, "the take puts the cursor on the next field to fill"
- `test/level0/fields-to-fill.test.js`, "a put-back takes every mark away"
- `test/level0/fields-to-fill.test.js`, "a hover shows the step's does, and the field's form and says"
- `test/level0/fields-to-fill.test.js`, "a field filled in loses its mark"
- `test/level0/fields-to-fill.test.js`, "the door lists nothing in the Problems panel"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: `lib/lens.js`, `lib/route-host.js`, `editor-inset.js` for `jumps`, `editor-files.js` for `imports` and `watch`, `pull-route.js` for `leafOf`, `pull-chapter.js` for `chapterOf`, and `schema-read.js` for `readNote` and `sectionAt`
- the callers list names `activate` and `editorDoor`, the two places the change reaches, and the sidebar cases driving `activate`
- every done_when line names its test in `test/level0/fields-to-fill.test.js`, and the last one names `./RUNME.sh check`, which the tests-green `check` field answers

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass

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

- The owner settles it: the underlines stand in the ticket text alone, and the Problems panel lists none of them. They block nothing: no commit, no push and no check.
- The owner-walk ticket [[spec/tickets/the-owner-walks-the-editor]] names this fault under `answer`.
