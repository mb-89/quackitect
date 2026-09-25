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
step: design/draft
---

# Ask

The count beside the work editor's button in the sidebar equals the rows the work editor draws as it opens. A person reads the number, opens the tab, and finds that many rows.

The sidebar's count and the rows the work editor draws disagree, and a person trusts neither. The count in the tab's name answers a third question, so matching it leaves the button wrong.

- a test lays the button's count beside the rows the tab draws on the same tree, and they match. `go -C src/tui test ./...` decides it
- the count follows the preset the base file presses, so a change of that preset moves both. The same test decides it
- `./RUNME.sh check` answers zero

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`./RUNME.sh tui work --count` answers the rows the work tab draws as it opens, and the sidebar button shows its answer.

| file | change |
|---|---|
| `src/tui/work/workcount.go` | a new `Drawn(path)` builds the tab's tree through the tab's own functions, and returns `tree.Len()` |
| `src/tui/main.go` | a `--count` flag prints `{"count":N}` from `Drawn`, and exits |
| `src/scripts/tui.js` | `tui work --count` runs the viewer with `--count`, and prints its answer |
| `src/scripts/tui.js` | a tree lacking the viewer prints `{"count":null}` |
| `spec/config/level0.schema.json` | the button's `counts` line runs `./RUNME.sh tui work --count` |
| `src/scripts/ticket-yours.js` | `--count` goes, and `--next` stays for pull for me |
| `src/scripts/ticket.js` | the help line drops `--count` |
| `test/level0/sidebar-work.test.js` | the count case reads the new line |
| `spec/design_output/tui.md` | a line names `./RUNME.sh tui work --count` as the button's source |
| `spec/design_input/the-editor-draws-the-ticket.md` | names `ticket yours --count`, and the owner edits it |

The viewer answers the count because it holds every rule the tab draws by. A second copy in the scripts drifts from it. The cost is a viewer start on each sidebar draw.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/tui/main.go`: `main`, whose `--count` road calls `work.Drawn`
- `src/tui/work/work.go`: `Load`, which `work.Drawn` calls
- `src/tui/work/workplaces.go`: `runPlaces`, which `work.Drawn` calls
- `src/tui/work/workplaces.go`: `PlacesIn`, which `work.Drawn` calls
- `src/tui/work/workplaces.go`: `Placed`, which `work.Drawn` calls
- `src/tui/tree/preset.go`: `Tree.Opening`, which `work.Drawn` calls
- `src/tui/tree/preset.go`: `Tree.Filtering`, which `work.Drawn` calls
- `src/scripts/cli.js`: the `tui` entry, which calls `openTui`
- `src/extension/sidebar.js`: `counted`, which runs the `counts` line
- `src/extension/sidebar.js`: `pullsNext`, which runs `ticket yours --next`
- `src/scripts/ticket.js`: the `yours` entry, which calls `yours`
- `test/level0/sidebar-work.test.js`: the button's count case, which reads the `counts` line
- `test/level0/ticket-yours.test.js`: `yours --count answers the number the work tab's name carries`, which the change deletes
- `test/level0/ticket-yours.test.js`: `a note waiting for its retro at a person's step stays out of the count`, which the change deletes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/tui/workcount_test.go`: `TestTheButtonsCountIsTheRowsTheTabDrawsAsItOpens`
  - the case tree: a group with its child on the cloud
  - the case tree: a placed loose ticket
  - the case tree: a closed ticket
  - the case tree: a todo
  - a fake `src/scripts/cli.js` prints the queue places
  - `work.Drawn` answers what `theWork(m).Tree.Len()` answers
  - the base file then presses `open` in place of `queue`, and the answers still match
- `test/level0/tui-count.test.js`: `tui work --count prints the viewer's count and leaves a standing viewer its tab`, over `fakeProc`, asserting the viewer's arguments hold `--count` and the session path.
- `test/level0/tui-count.test.js`: `tui work --count on a tree lacking the viewer prints a null count`.

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file, function and verb the approach's table names stands opened, and each claim checked there
- the callers list names every caller of what the approach changes, from a search for each name the approach changes
- every done_when line names its test: the Go test decides the match and the preset move
- `./RUNME.sh check` decides the check line

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

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

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

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
