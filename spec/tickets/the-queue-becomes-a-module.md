---
kind: [[ticket]]
state: open
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
          - name: size
            form: list
            says: every file the approach touches, one a line
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
step: gate
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: open-tasks-shadow-lands
depends_on: [qtest-holds-a-module]
record:
  - step: design/draft
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 99cb02ce58097d02b115a72f671b6c983b64ba3f
    hash_after: 99cb02ce58097d02b115a72f671b6c983b64ba3f
    inputs:
      - name: ask
        hash: c3a643be79067a7a
        size: 626
      - name: [[spec/tickets/the-queue-moves-to-plan]]
        hash: ec8f43b68ad91062
        size: 13436
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 15006cb1660c10060746530d183a91d0913902af
    hash_after: 15006cb1660c10060746530d183a91d0913902af
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/queue fails
    inputs:
      - name: design/draft
        hash: bde2cab92a460de6
        size: 3857
    def: 08e16d07b0de477c
---

# Ask

The queue, its score, its outline and its places, becomes `src/modules/queue`, and its tests run through `q/qtest` alone. Its in-ports take the tickets, the plan file, the cloud marker and the minute, and the wiring binds them. It reads no git ref. The port [[spec/tickets/the-queue-moves-to-plan]] lands is where it starts, with its golden file.

The count reads the queue. Without the move the pilot reads a port the owner's rule of a fake index leaves outside.

- `go test ./...` from the root passes
- the golden file of the queue runs through `qtest`
- `onlyq` passes over `src/modules/queue`
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

A new pure package src/ticket holds the Ticket type, and tickets.Ticket becomes an alias of it, so the wire tickets/all -> queue.rows carries one Go type while onlyq keeps the queue off the tickets package; src/imports adds src/ticket to pureTree. Ticket gains Cloud (the front's cloud: true), Held (a record row with hash_before and no hash_after) and Person (the leaf at step reads by: person), each read once in tickets.Of. The tickets module adds the out-port cloud: the names a marked group holds, itself and every ticket naming it, as cloudsIn in src/scripts/work-answer.js reads them. src/plan's queue.go and outline.go move into src/modules/queue with their tests and golden file, and src/plan leaves. src/modules/queue/places.go registers the derived out-port places, map name to place, off the in-ports rows (tickets/all), plan (the plan projection), cloud (tickets/cloud), stood (path to the second it came in, built-in empty, since the module reads no git), minute (clock/minute) and the config keys blockScore, dayScore and failScore at the built-in values the work block holds. The split ports placesIn: a note-route or closed or cloud row takes no place; a held row or the plan's working ticket stands in hand; a person step or a non-trivial draft waits on a person; an open ticket, or a trivial draft, whose dependencies all stand closed or absent goes to the agents; every other open row and every plan todo goes back. A cloud row that stands open takes the place ∞. spec/wiring.yaml loads the instance queue and wires queue.rows, queue.cloud, queue.minute and queue.stood (built-in); src/quack/main.go adds the queue type to its table. Assumption: the old takeable reads the box's hand rules and verbs, which a pure module cannot; the golden split follows a ticket's own text alone, so the port takes that reading and the shadow rows show any box where it differs.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/main.go: projected, modules, projections
src/quack/golden_test.go: TestTreeGolden reads []tickets.Ticket
src/quack/codec_test.go: reads queue.Plan
src/modules/tickets/tickets.go: Registers, allOf, All, Of
src/index/answers.go: the tickets answer reads tickets.Of
src/imports/imports.go: pureTree
src/modules/queue/golden_test.go, queue_test.go, outline_test.go: move with the code

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/queue/golden_test.go: TestQueueGolden seeds the golden rows through qtest and reads places
src/modules/queue/places_test.go: TestACloudRowStandsAtInfinity
src/modules/queue/places_test.go: TestTheWorkingTicketStandsAtZero
src/modules/queue/places_test.go: TestANoteTakesNoPlace
src/modules/tickets/tickets_test.go: TestTheCloudPortNamesAMarkedGroup
src/modules/tickets/tickets_test.go: TestAFrontReadsHeldPersonAndCloud

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/ticket/ticket.go
src/modules/tickets/tickets.go
src/modules/tickets/tickets_test.go
src/modules/queue/queue.go
src/modules/queue/places.go
src/modules/queue/places_test.go
src/modules/queue/score.go (from src/modules/queue/score.go)
src/modules/queue/outline.go (from src/modules/queue/outline.go)
src/modules/queue/golden_test.go (from src/modules/queue/golden_test.go)
src/modules/queue/testdata/queue.golden.json (moved)
src/imports/imports.go
spec/wiring.yaml
src/quack/main.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened, and each claim checked there: read work-answer.js placesIn, pull-hand.js takeable, plan/*.go, qtest, tickets.go, quack/main.go, wiring.yaml, imports.go and the golden split
the callers list names every caller of what the approach changes: grep over src for tickets.Ticket, queue.Registers, queue.Plan and the plan import
every done_when line names the test that decides it: go test ./... from the root; TestQueueGolden runs through qtest; onlyq runs in ./RUNME.sh check over src/modules/queue; ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/queue/golden_test.go
src/modules/queue/places_test.go
src/modules/tickets/queue_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion. places reads an empty map, Of reads none of held, person, cloud or the todo anchor, and the cloud port reads empty. The catalog refused camel-case config names, so the weights stand as weight/block, weight/day and weight/fail. The golden split follows the text of a ticket. Every back row waits on an open ticket or is a plan todo, so the golden file seeds through the fake index with no box state.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a test that fails: TestQueueGolden runs the golden file through the fake index, and go test and the import rules run in the check, which closes at tests-green
every door the tests reach has a fake: the cases reach no door, only the fake index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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
