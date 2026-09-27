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
step: design/review
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: open-tasks-land-in-shadow
depends_on: [the-tickets-topic-lands]
record:
  - step: design/draft
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 4ea861630244956d5302df5592328b58086c84a7
    hash_after: 4ea861630244956d5302df5592328b58086c84a7
---

# Ask

The `plan/` module and the queue stand, ported from `pull-outline.js` and `pull-queue.js`.

The count reads the queue. Without the port the pilot reads JavaScript it means to replace.

- - `go test ./...` from the root passes
- a golden file holds the queue order `./RUNME.sh branch list --queue` answers today
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A new package `src/plan` ports the two pure halves of the queue, as functions over rows a caller hands in. It reads no git and no file, so the work module feeds it next.

| the Go function | the JavaScript it ports |
|---|---|
| `Queued(list, all, at)` | `queued`, with `waitsUnder`, `chainUnder`, `failsOn` and `daysStood` in `src/scripts/pull-queue.js` |
| `Outline(persons, held, rest, all, places)` | `outlineIn`, with `kidsOf`, `bestUnder`, `anchored`, `levelOf` and `numberUnder` in `src/scripts/pull-outline.js` |
| `Compare(left, right)` | `compareOutline` and `segmentsOf` |
| `First`, `Last`, `End`, `CloudPlace` | the four words the outline file exports |

A row carries what the two read off a ticket: the name, the path, the group, the todo, the mark, `depends_on`, the failed hand-backs and the plan's order. `tickets.Ticket` takes `DependsOn` and `Fails`, so a row comes off the one reading. The day a ticket came in stays an input, a map by path, because git is live input nowhere. The work module names its source.

The golden file `src/plan/testdata/queue.golden.json` holds one real run of the queue. `placesIn` in `src/scripts/work-answer.js` takes an optional `it.capture`, and hands it the free lists before the sort, the rows in hand, every row, the overrides, the add days, the weights, the clock and the answer. `test/level0/queue-golden.js` runs `placesIn` over this tree with that hook and writes the file. The Go test replays the inputs and compares every place to the answer.

One difference stands in the port: a tie in JavaScript reads the name through `localeCompare`, and Go compares bytes. The golden file shows whether any tie in this tree meets it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/work-answer.js`, `placesIn`, which takes the capture hook
- `src/tickets/tickets.go`, `Of`, which reads `depends_on` and the failed hand-backs
- the Go port has no caller yet, and [[spec/tickets/open-tasks-come-from-work]] calls it

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `src/plan/queue_test.go`, `TestTheMarkStandsOverTheScore`
- `src/plan/queue_test.go`, `TestABlockerOfABlockerCounts`
- `src/plan/queue_test.go`, `TestATieKeepsThePlansOrder`
- `src/plan/outline_test.go`, `TestAPersonsRowCountsDown`
- `src/plan/outline_test.go`, `TestATodoStandsBeforeTheRowItNames`
- `src/plan/outline_test.go`, `TestPlacesCompareAsNumbers`
- `src/plan/golden_test.go`, `TestQueueGolden`, which decides the golden line of the ask
- `src/tickets/tickets_test.go`, `TestOfReadsTheWaitsAndTheFails`

The done lines and the test deciding each:

- `go test ./...` passes: `go test ./...` from the root
- the golden file: `TestQueueGolden`
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every function the approach names stands opened in `pull-queue.js`, `pull-outline.js` and `placesIn` in `work-answer.js`
- the callers come off a search for `queued`, `outlineIn` and `compareOutline` over the tree
- each done line names its test, and the golden line names `TestQueueGolden`

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

The sentence naming `it.capture` under the approach runs past the cap, and the full check stops on it. The review sends it back to the draft to split, because the door keeps every other hand out of the approach. [[spec/tickets/rationale-drops-release-row]] waits on that split to pass.
