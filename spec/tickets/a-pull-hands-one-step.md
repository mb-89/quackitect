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
group: the-engine-holds-the-route
step: implement/change
record:
  - step: design/draft
    hand: box d7d6cb0fb1105 · claude-code-remote
    hash_before: 0ed9f2304ae306816eb89b2a0d01107eaa9ff949
    hash_after: 0ed9f2304ae306816eb89b2a0d01107eaa9ff949
  - step: design/review
    hand: box d7d6cb0fb1105 · claude-code-remote · helper-2
    hash_before: efb1c7dda5c5f9ce54ce3b734e77df85fffe55e8
    hash_after: efb1c7dda5c5f9ce54ce3b734e77df85fffe55e8
  - step: implement/tests-red
    hand: box d7d6cb0fb1105 · claude-code-remote
    hash_before: a25354675be4e8ad9c1f15d89b5bc9ec02084156
    hash_after: a25354675be4e8ad9c1f15d89b5bc9ec02084156
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
---

# Ask

A hand holds one step and its guidance, and tracks no route, so a clear costs it nothing. The engine writes the ticket file, as [[spec/design_input/level-two]] asks in its chapters The loop and The ticket files.

Today the agent reads the whole route on the ticket, writes the file by hand, and breaks its form.

- a pull on a standard ticket prints the step in hand alone, with its fields and its checklist. A case under `test/level0` decides it
- the hand-back takes the answer as the fields payload, and the engine writes it into the ticket file. A case under `test/level0` decides it
- the engine runs the formatter and the mechanical checks before it merges an answer. A case under `test/level0` decides it
- the write door refuses an agent a write to a ticket under `spec/tickets`. A case under `test/level0` decides it
- the work tab draws the progress of a process from its ticket file. A case under `src/tui` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The hand-out and the payload stand today. The change pins them with cases, and adds the formatter, the door and the progress.

| done_when line | what stands | the change |
|---|---|---|
| the step in hand alone | `workAnswer` in `src/scripts/pull-chapter.js` prints the leaf, its fields and its checklist | a case pins that the hand-out names no field of another leaf |
| the payload | `withPayload` merges `--fields` into the ticket in `handBack` | the case in `test/level0/pull-fields.test.js` decides it, and stands |
| the formatter | nothing formats a payload | `formatted` in a new `src/scripts/pull-format.js` trims trailing blanks, writes a bullet as a dash and folds a run of blank lines. `handBack` runs it on the merged text before `checkNote` |
| the door | `engineRestores` in `src/bridge/write.js` guards the engine fields alone | a new `ticketDoor` there refuses an agent write to a ticket under `spec/tickets` whose state reads open, and names `--fields` |
| the progress | the index row carries the step alone | `progressOf` in `src/index/ticket.go` counts the leaves of the route and the record entries, and the row carries `progress`. The work tab lists it among `detailKeys` in `src/tui/work/work.go` |

Weighed: the formatter runs in the engine as text in and text out, so the pull stays cold and reads no Vale. Assumed: a draft and a closed ticket stay writable, since a hand writes a draft's ask, and a closed ticket takes history.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull.js` `handBack`, which runs the formatter
- `src/bridge/write.js` the write door, which runs the ticket door beside the engine fields
- `src/index/ticket.go` `ticketOf`, which fills the progress
- `src/tui/work/workitems.go` `itemOfTicket`, which carries the progress into the keys
- `src/tui/work/work.go` the detail pane, which reads `detailKeys`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/pull-format.test.js` the hand-out names the step in hand and no other leaf
- `test/level0/pull-format.test.js` a payload lands formatted before the checks read it
- `test/level0/write.test.js` the door refuses an agent write to an open ticket, and a draft takes one
- `src/index/ticket_test.go` a ticket row carries the progress of its route
- `src/tui/work_test.go` the detail pane shows the progress

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file and function named stands opened: the hand-out, the payload, the door, the index and the tab
- the callers list follows each changed function to the file calling it
- every done_when line maps to a test row above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass
- `workAnswer` tells the hand to write the file: the builder names `--fields` there instead.
- The ticket door refuses a write under Discussion too: the builder admits that chapter.
- `formatted` runs on the payload fields alone, so it rewrites no line of another leaf.
- The tab case belongs in `src/tui/work`, beside `work.go`, since the package stands there.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-format.test.js test/level0/write.test.js src/index/ticket_test.go src/tui/work/workitems_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

- the hand-out still sends the hand into the file, and names no payload
- the formatter answers its input, so the payload keeps its blanks
- the door lets an agent write an open ticket
- the index row and the tab carry no progress
- what surprises the hand: the engine-field cases wrote over an open ticket, so they take a draft now

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the hand-out, the payload, the door, the index row, the tab and the cases
- the door cases run over the fake disk, and the Go cases over a tree each case writes
- each new file links the chapter it implements
- the formatter stands in one module, and the payload reader calls it
- the review rows stand fixed: the payload in the hand-out, the Discussion admitted, the formatter over the payload alone, the tab case in its package

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
