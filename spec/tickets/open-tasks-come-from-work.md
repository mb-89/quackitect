---
kind: [[ticket]]
state: closed
step: implement/tests-green
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
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
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: open-tasks-shadow-lands
depends_on: ["the-queue-becomes-a-module"]
record:
  - step: design/draft
    hand: box d81c1a402acf · claude-code-remote
    hash_before: fc92e8ab8af638964ad4dd22f14a4232e3488b8f
    hash_after: fc92e8ab8af638964ad4dd22f14a4232e3488b8f
    inputs:
      - name: ask
        hash: 7c0201f8ee4678b7
        size: 502
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 28fd8494c6b6fe6c16543dc01aded1168a4611d9
    hash_after: 28fd8494c6b6fe6c16543dc01aded1168a4611d9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/work fails
    inputs:
      - name: design/draft
        hash: a240cf98586639c5
        size: 2338
    def: 08e16d07b0de477c
  - step: gate
    hand: box d81c1a402acf · claude-code-remote · helper-3
    hash_before: 3539e268ecc4dd956e5daa759d944fa01d1fba82
    hash_after: 3539e268ecc4dd956e5daa759d944fa01d1fba82
    inputs:
      - name: design/draft
        hash: a240cf98586639c5
        size: 2338
      - name: design/tests-red
        hash: 6e37467f93b35ec7
        size: 676
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 9dca999d767034effd0103946057197b1865f956
    hash_after: 9dca999d767034effd0103946057197b1865f956
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d81c1a402acf · claude-code-remote
    hash_before: e8fb0f5840caed496aabed6c764cadcc528f2384
    hash_after: e8fb0f5840caed496aabed6c764cadcc528f2384
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/work passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/replayed-red-leaf-reads-green.md:18:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 6e37467f93b35ec7
        size: 676
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

The out-ports `rows` and `open-tasks` stand in `src/modules/work`, ported from `work-answer.js`. Its in-ports take the queue's places and the cloud marker, and the wiring binds them, with no git. The tests run through `q/qtest` alone, by the local port names.

The badge and the header then read one name, `work/open-tasks`. Without it they keep counting two ways.

- `go test ./...` from the root passes
- a case reads the out-port `open-tasks` over a fake tree of tickets
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

A topic package src/modules/work holds two modules, one file each. rows.go registers the derived out-port rows over the in-ports tickets (tickets/all), places (queue/places) and cloud (tickets/cloud): one row a ticket, in the shape rowOfTicket in src/scripts/work-answer.js answers, with name, kind (group where the route reads group, ticket otherwise), state (held where the place reads 0), step, progress, group, urgent, person, held, waits (a dependency still open), todo, says, queue and cloud, and one row of kind todo for every placed name no ticket carries, which is a plan todo or the plan work with no file. open_tasks.go registers the derived out-port open-tasks over places alone: the count of places that read anything but the cloud place, the count countTakeable in src/tui/work/workplaces.go answers today off the verb. The wiring loads the instance work and binds work.tickets, work.places and work.cloud, and src/quack/main.go adds the work type. The module imports q and src/ticket alone, and reads no git. Assumption: the old answer adds a row for each ephemeral hold, which the holds module answers apart. The rows port leaves those out, and the shadow names any count they move.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/main.go: modules, the table the wiring loads types from
spec/wiring.yaml: the instances and wires
no reader of work/rows or work/open-tasks stands yet: open-tasks-run-in-shadow adds the first

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/work/open_tasks_test.go: TestOpenTasksCountsEveryPlaceOffTheCloud
src/modules/work/open_tasks_test.go: TestOpenTasksReadsAFakeTreeOfTickets
src/modules/work/rows_test.go: TestARowCarriesItsPlaceAndItsFlags
src/modules/work/rows_test.go: TestAPlacedTodoStandsAsARow
src/quack/main_test.go: TestTheWiredTreeAnswersItsOpenTasks

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened, and each claim checked there: read rowOfTicket, placesIn and answerOf in work-answer.js, countTakeable and PlacesIn in src/tui/work/workplaces.go, and the queue places port
the callers list names every caller of what the approach changes: the root table and the wiring, and no reader of the new names stands yet
every done_when line names the test that decides it: go test from the root, TestOpenTasksReadsAFakeTreeOfTickets for the fake tree, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/work/open_tasks_test.go
src/modules/work/rows_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion: open-tasks reads 0, and rows reads an empty list. The count needs the places alone, since the queue already writes the cloud place for a marked row, so the cloud port feeds the rows alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides: TestOpenTasksReadsAFakeTreeOfTickets reads the out-port over a fake tree, and go test and the check close at tests-green
every door the tests reach has a fake: the cases reach no door, only the fake index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- open-tasks-wired-case-stands: the draft names TestTheWiredTreeAnswersItsOpenTasks in src/quack/main_test.go, and no such case stands, so no red test decides that the wiring binds work.tickets, work.places and work.cloud; the builder writes it at implement
- fake-tree-runs-the-queue: TestOpenTasksReadsAFakeTreeOfTickets seeds the places by hand, and open-tasks reads the places alone, so its tickets reach no port the count reads; the wired case over a fake tree of tickets decides the done_when line, not the unit case

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/work src/quack spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the work package, the wiring, the root table and its wired case, and the question ticket name the check refused
every door the change reaches has a fake: the module reaches no door, and its cases run on the fake index
a comment names the approach the change implements: every file and function links the ticket or the note section it ports
every fact the change adds stands in one place: the cloud place and the row words are spelled once in the work package, each naming the file that owns it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work module stands in src/modules/work with two out-ports. rows answers one row a ticket, in the shape the work tab reads today, with its place, its flags and the cloud mark, and one row a placed todo no ticket carries. open-tasks counts every placed row off the cloud, the count the tab header and the sidebar button read off the verb today. The wiring loads the work instance over tickets/all, the queue places and tickets/cloud, with no git. The wired case in src/quack/main_test.go runs a fake tree of tickets through tickets, the queue and work, and reads work/open-tasks, which answers both gate points. The question ticket takes a five-word name the check demands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: the work package, the wiring, the root table and its wired case
every door the change reaches has a fake: the module reaches no door, and its cases run on the fake index
a comment names the approach the change implements: every file and function links the ticket or the note section it ports
every fact the change adds stands in one place: the cloud place and the row words are spelled once in the work package, each naming the file that owns it

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
