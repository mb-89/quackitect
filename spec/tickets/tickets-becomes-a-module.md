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
group: the-foundation-closes-its-gaps
depends_on: [qtest-holds-a-module, the-scheduler-runs-providers, projections-read-the-mirror, the-wiring-file-binds-ports]
record:
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 075980b4c6d4b843b54035b226e951e363a06e50
    hash_after: 075980b4c6d4b843b54035b226e951e363a06e50
    inputs:
      - name: ask
        hash: 42d340698d441fd1
        size: 648
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 11b3f8366db5c7ec97f28a145958eb3408a892ac
    hash_after: 11b3f8366db5c7ec97f28a145958eb3408a892ac
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: 623a41b5929eb16d
        size: 3143
    def: 08e16d07b0de477c
---

# Ask

`src/tickets` moves to `src/modules/tickets`, as the loaded projection of `spec/tickets/*.md` with the markdown codec, per [[spec/design_output/model#everything-on-disk-mirrors]]. Its in-port takes `files/<path...>`, and its out-port `all` answers every ticket. The wiring binds both, and its tests run through `q/qtest` by the local port names.

The index then holds no module's logic, and the tickets module tests like every other.

- `go test ./...` from the root passes
- the index imports no package under `src/modules`, which `go list -deps ./src/index` shows
- the golden file of the tickets runs through `qtest`
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

The package moves whole to src/modules/tickets, and its reading functions stay as they stand.
Registers takes the local names alone: an in-port files/<path...> and an out-port all, a derived provider over every file.
The run of all parses each file under spec/tickets/*.md and .se/tickets/*.md through the markdown codec, keeps the ticket kind, and answers tickets.All over them.
The markdown codec is a q.Codec over a Note of front and body, which writes a file back byte for byte, per the mirrors chapter of the model.
q gains one read: a derived input of type map[string]T, tagged with a family, takes every value the store holds under it, keyed by the path. The type check takes that map against a family of T.
The watch stamps q.Content with Changed, the file's mtime, so a ticket keeps the time a view sorts by.
spec/wiring.yaml loads a tickets instance, and wires files/<path...> in and tickets/all out. The root takes a module with no start.
The index drops Tickets, the tickets topic and its writer, and the tickets method reads tickets/all off the store.
The index cases on tickets move to the root, since an index test imports no module.
Assumption: the private folder stays in all, as tickets/all reads it today, although the ask names spec/tickets alone.
Assumption: Changed joins Content, since the ask is silent on the sort a view reads.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/door.go: answers, whose tickets method reads the store
src/index/topic.go: registersTopics and publishes, which drop the tickets topic
src/index/ticket.go: Tickets, which leaves
src/index/topic_test.go: TestTheTopicsCommitThroughTheirOwnWriters, which names the ops writer alone
src/index/ticket_test.go and src/index/door_test.go: the tickets cases, which move to src/quack
src/q/q.go: derivedOf, which fills a family map
src/q/check.go: the type check of an input
src/modules/files/watch.go: hears and ContentOf, which stamp Changed
src/quack/main.go: modules and load, which take a module with no start
spec/wiring.yaml: the tickets instance and its two wires

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/modules/tickets/golden_test.go: TestTreeGolden, through qtest by the port all
src/q/wiring_test.go: TestAFamilyInputReadsEveryKey
src/quack/main_test.go: TestTheIndexImportsNoModule, over go list -deps ./src/index
src/quack/main_test.go: TestTheWiredTreeAnswersItsTickets
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/tickets moves to src/modules/tickets, with markdown.go added
src/q/q.go
src/q/check.go
src/q/wiring_test.go
src/modules/files/watch.go
src/index/door.go
src/index/topic.go
src/index/ticket.go
src/index/topic_test.go
src/index/ticket_test.go
src/index/door_test.go
src/quack/main.go
src/quack/main_test.go
spec/wiring.yaml

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened tickets.go, its golden case, the index topic, Tickets, the tickets method, Load and bind in the wiring, derivedOf and the type check, and checked each claim there
I grepped every importer of src/tickets and every test naming tickets under src/index, and the callers list names each
each done_when line names its case, or the command go test or the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q/wiring_test.go src/quack/main_test.go src/quack/golden_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/wiring_test.go
src/quack/main_test.go
src/quack/golden_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The family map fails the type check, the index still imports src/tickets, the root loads no tickets module, and the stub module answers all as a given. The surprise: the golden case reads the tree, and a module test reads no disk, so it stands in the root and reads the golden file at its old path until the build moves it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each done_when line meets a red case: the golden file in src/quack/golden_test.go, the import rule in TestTheIndexImportsNoModule, with go test and the check deciding the rest
the family case runs over a catalog in memory, and the golden case seeds the fake index, so no door stands unfaked

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

- The manager lands first and takes the ops half out of `TestTheTopicsCommitThroughTheirOwnWriters` in `src/index/topic_test.go`. Where this change moves the tickets topic out, the case keeps no half, so the implement step drops it or points it at a topic that stands.
- The implement step takes the `src/index/topic.go` and `src/quack/main.go` the manager leaves as its base.
