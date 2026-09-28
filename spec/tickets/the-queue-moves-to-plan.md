---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
depends_on: [the-tickets-topic-lands]
record:
  - step: design/draft
    hand: box d7d70c069f441 · claude-code-remote
    hash_before: 4ea861630244956d5302df5592328b58086c84a7
    hash_after: 4ea861630244956d5302df5592328b58086c84a7
  - step: design/review
    hand: person
    hash_before: 400c37251348d421c9cd8b85a0aff6bc6fd2e105
    hash_after: 400c37251348d421c9cd8b85a0aff6bc6fd2e105
    inputs:
      - name: design/draft
        hash: 901c79457eef0b11
        size: 2994
      - name: [[spec/tickets/open-tasks-come-from-work]]
        hash: 797f76553282bfa6
        size: 5566
    def: 0f8c340e80e8ece6
  - step: implement/tests-red
    hand: person
    hash_before: 1a00aa0fac92da4157519552de22856b26a983e5
    hash_after: 1a00aa0fac92da4157519552de22856b26a983e5
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    def: 06865600120e8b38
  - step: implement/change
    hand: person
    hash_before: fb94c5004ca077e571a464890fadd26d7e45792d
    hash_after: fb94c5004ca077e571a464890fadd26d7e45792d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: 21d63335f32dfcda
  - step: implement/tests-green
    hand: person
    hash_before: 23dfd253fb4367357f7a17d6925fa9f7e7b69e5f
    hash_after: f547c5011eb41ab94646c3e7660e74e586b857c7
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 1 file(s); green, src/plan passes; green, src/tickets passes
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:240:1: ListItem: A sentence in a list item holds 20 words, and this one holds 25"
    inputs:
      - name: implement/tests-red
        hash: bbc5c60bdd674eca
        size: 1103
    def: a27db29c1d1562f2
reason: done
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

pass

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-answer.test.js src/plan/queue_test.go src/plan/outline_test.go src/plan/golden_test.go src/tickets/tickets_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion over stubs that answer nothing: the queue reads an empty list, the outline an empty map, and every compare reads even. The tickets case reads no waits and no fails, the golden case finds no file, and the capture case hears no run. The approach names a byte compare for a tie. The port folds the case first, because `localeCompare` sorts a capital beside its small letter, and a todo title carries capitals.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the approach names: `src/plan`, `src/tickets`, and `test/level0/work-answer.test.js`
- the tests reach no door: the Go cases read rows a caller hands in, and the capture case runs over the fake doors in `work-doors.js`
- a comment in each new file names the ticket the change implements
- every fact stands once: the row's fields in `src/plan/queue.go`, and the four words in `src/plan/outline.go`
- the design review passes with no row

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint src/plan/queue.go src/plan/outline.go src/plan/queue_test.go src/plan/outline_test.go src/plan/golden_test.go src/tickets/tickets.go src/tickets/tickets_test.go src/scripts/work-answer.js test/level0/work-answer.test.js test/level0/queue-golden.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the approach names, and the golden file it writes under `src/plan/testdata`
- the change reaches no door: the port reads the rows a caller hands in
- the golden script runs the real doors from the command line alone
- a comment in each file names the ticket the change implements
- the weights and the day stand in `src/plan/queue.go`, and the four words in `src/plan/outline.go`
- the design review passes with no row

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/work-answer.test.js src/plan/queue_test.go src/plan/outline_test.go src/plan/golden_test.go src/tickets/tickets_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A new Go package `src/plan` ports the queue's score and its outline from `pull-queue.js` and `pull-outline.js`. It reads the rows a caller hands in, and touches no git, no disk and no index. `tickets.Ticket` reads `depends_on` and the failed hand-backs, so a row comes off the one reading. `placesIn` hands an optional capture hook one run. `test/level0/queue-golden.js` writes that run to `src/plan/testdata/queue.golden.json`, and `TestQueueGolden` answers every place the same. A tie folds the case before it compares bytes, as `localeCompare` reads the tree's names.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the approach names, and the golden file under `src/plan/testdata`
- the port reaches no door, and the golden script runs the real doors from the command line alone
- a comment in each file names the ticket the change implements
- the weights and the day stand in `src/plan/queue.go`, and the four words in `src/plan/outline.go`
- the design review passes with no row

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The sentence naming `it.capture` under the approach runs past the cap, and the full check stops on it. The review sends it back to the draft to split, because the door keeps every other hand out of the approach. [[spec/tickets/rationale-drops-release-row]] waits on that split to pass.
