---
kind: [[ticket]]
state: open
group: the-servers-and-views-hold
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
    hand: box 63693613eded · claude-code-remote
    hash_before: 3062638584d4132b1819045f9190e198799a1d2d
    hash_after: 3062638584d4132b1819045f9190e198799a1d2d
---

# Ask

The sidebar badge shows the number in the work tab's brackets, under a briefcase, and follows the queue with no window reload. The tab and the branch list draw a ticket once, with what it waits on.

The badge counts the rows the tab draws, and the sidebar redraws on a config change alone. So the badge and the brackets show two numbers for one queue. The tab draws a plan todo nested under its group again at the top.

- the `editor` entry in `spec/config/level0.schema.json` counts through a verb printing `Places.Takeable`, the number in the work tab's brackets
- `src/tui/workcount_test.go` holds the printed count equal to the brackets
- the `editor` entry carries a briefcase icon, and its help names the bracket number
- the sidebar redraws once after a burst of writes to a ticket folder, the plan file or the hold folder
- that redraw stands in `src/extension/sidebar.js`, and a case in `test/level0/sidebar.test.js` holds a ticket write changing the badge
- `Placed` in `src/tui/work/workplaces.go` reads every nested row before it adds a plan todo
- a case in `src/tui/workplaces_test.go` holds a todo under its group drawn once
- `childRows` in `src/scripts/work-list.js` names the tickets a child waits on
- the group row names a group branch behind main
- cases in `test/level0/work-group.test.js` hold both the child row and the group row
- `lensesOf` in `src/extension/lib/lens.js` draws no lens over a ticket standing on a cloud branch. A case under `test/level0` holds it
- a person step: the owner compares the sidebar badge with the work tab's brackets in the editor. The compare runs before and after a ticket moves, with no window reload
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Four roads draw the queue, and each one takes a small change. The table names the part, the file and what changes.

| part | file | what changes |
|---|---|---|
| the count | `src/tui/work/workcount.go`, `Drawn` | becomes `Takeable(path)`, which runs `runPlaces` and answers `PlacesIn(said).Takeable`, the number `Label` in `src/tui/work/work.go` draws in the brackets. It reads no index and no base file |
| the flag | `src/tui/main.go`, `main` | `--count` prints `{"count":N}` off `work.Takeable`, and its flag help names the brackets |
| the button | `spec/config/level0.schema.json`, `work.editor` | the icon turns to a briefcase, `💼`. The help says the number is the one in the work tab's brackets. `counts` keeps `./RUNME.sh tui work --count`, so `src/scripts/tui.js` and `test/contract/work-buttons.test.js` stand as they are |
| the note | `spec/design_output/tui.md`, the paragraph on `--count` under the work tab | says the count is `Takeable`, and points at `Label` in place of `Drawn` |
| the redraw | `src/extension/sidebar.js` | the sidebar answers `redraws`, the ticket folders `spec/tickets/*.md` and `.se/tickets/*.md`, the plan file `.se/.runtime/plan.json`, and `HOLD_WATCHES` out of `lens.js`. `settled(run, wait)` holds a timer and starts it again on each event, so a burst runs `run` once after `SETTLES` quiet milliseconds |
| the wire | `src/extension/extension.js`, `activate` | the view watches `sidebar.redraws` through `settled(draw)`, beside its watch on `sidebar.watches`. The status bar keeps its watch on the config alone |
| the todo | `src/tui/work/workplaces.go`, `Placed` | `standing` walks every item and its kids, so a todo the index nests under its group lands no second row at the left |
| the child row | `src/scripts/work-list.js`, `childRows` | reads `dependsOn` off the child, and names each ticket on the same tip standing open, as `waits for a, b` in place of the step |
| the behind read | `src/scripts/work-stands.js`, `refsHere` | reads `rev-parse origin/main` once, and marks a ref `behind` where `baseOnTrunk` shares a base and that base is no trunk tip |
| the group row | `src/scripts/work-list.js`, `rowOf` | the why column names `behind main` for a ref marked `behind`, after what it waits for and before the mark |
| the note | `spec/design_output/work.md`, the reads of the listing | the table gains the one `rev-parse` row |
| the cloud read | `src/extension/lib/work.js`, `cloudIn(ran)` | reads the `branch list --json` answer, and answers the set of names on a branch standing unmerged: the group and each ticket on it |
| the lens | `src/extension/lib/lens.js`, `lensesOf` | takes `cloud`, a set of names, and answers no lens for a ticket in it |
| the lens door | `src/extension/lib/lens.js`, `ticketLensOf` | asks `door.asksVerb(["branch", "list", "--json"])` once, keeps the set, and forgets it on each watch event, so a lens draw spawns no git read |

The redraw test drives `activate` over the fake door `doorOf`, with `mock.timers` from `node:test`. The door's `asksVerb` answers the count, and a ticket write fires the watch the view registers.

The owner's compare in the editor stays a person step, and no test decides it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/tui/main.go`, `main`, the one caller of `work.Drawn`
- `src/tui/workcount_test.go`, `TestTheButtonsCountIsTheRowsTheTabDrawsAsItOpens` and `TestTheCountAnswersWhyWhereNoBranchVerbStands`, which call `work.Drawn`
- `src/tui/work/workcount_test.go`, `TestTheCountAnswersWhyWhereNoBaseFileStands`, which calls `Drawn`
- `src/scripts/tui.js`, `counted`, which runs the viewer's `--count`
- `src/extension/sidebar.js`, `counted`, which runs the `counts` line of `work.editor`
- `test/contract/work-buttons.test.js`, which reads the `work.editor` entry
- `src/tui/work/work.go`, `Tab.Update`, the two calls of `Placed`
- `src/tui/workplace_test.go`, which calls `work.Placed`
- `src/scripts/work-list.js`, `list`, the one caller of `rowOf` and `childRows`
- `src/scripts/work-stands.js`, `readWork`, the one caller of `refsHere`
- `src/scripts/work-answer.js`, `answerOf`, which reads the refs through `readWork`
- `src/scripts/work-stands.js`, `standOf`, which reads the refs through `readWork`
- `test/level0/work-doors.js`, `remoteSaying`, the fake git the listing cases run over
- `src/extension/extension.js`, `activate`, which reads `sidebar.watches` and `ticketLensOf`
- `src/extension/lib/lens.js`, `ticketLensOf().lenses`, the one caller of `lensesOf` in `src`
- `src/extension/editor-lens.js`, `lenses`, which calls `lens.lenses` and watches `lens.watches`
- `test/level0/lens.test.js`, which calls `lensesOf` and `ticketLensOf`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/tui/workcount_test.go`, `TestThePrintedCountIsTheNumberInTheTabsBrackets`, in place of the case on the rows the tab draws
- `src/tui/workcount_test.go`, `TestTheCountAnswersWhyWhereNoBranchVerbStands`, kept over `work.Takeable`
- `src/tui/workplaces_test.go`, `TestATodoUnderItsGroupDrawsOnce`
- `test/level0/sidebar.test.js`, `a burst of ticket writes redraws the sidebar once, and the badge follows the queue`
- `test/level0/sidebar.test.js`, `the sidebar watches the ticket folders, the plan file and the hold folder`
- `test/level0/work-group.test.js`, `a child row names the tickets it waits on`
- `test/level0/work-group.test.js`, `a group row names a branch behind main`
- `test/level0/lens.test.js`, `a ticket standing on a cloud branch draws no lens`
- `test/level0/lens.test.js`, `the lens door reads the cloud once, and reads it again after a watch event`
- `test/contract/work-buttons.test.js`, `the work editor wears a briefcase, and its help names the brackets`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file and function the table names stands opened, and each one reads as the table says
- the callers list names each caller a search finds for every name the table changes
- each done_when line names its test in the tests list, and the owner's compare stays a person step

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
