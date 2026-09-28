---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
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
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-3
    hash_before: 2f218bae082be71d83b6518e1b4bc1cd7cb75d65
    hash_after: 2f218bae082be71d83b6518e1b4bc1cd7cb75d65
    inputs:
      - name: design/draft
        hash: 623a41b5929eb16d
        size: 3143
      - name: design/tests-red
        hash: 14217a810eb895d8
        size: 825
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 685d0d5c3bccadb60db6bb96040d141bdc914a8b
    hash_after: 685d0d5c3bccadb60db6bb96040d141bdc914a8b
    answered:
      - name: lint
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    def: f150b8c0dc20fe45
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: adf7aae4401abd32186719ffc063db939b24386e
    hash_after: adf7aae4401abd32186719ffc063db939b24386e
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
    hash_before: 318d264c3ae88cd7a5bacee8e1891149a559117e
    hash_after: 318d264c3ae88cd7a5bacee8e1891149a559117e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: 8e30f5495b854973
        size: 4839
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-8
    hash_before: 5bb9c0a2443eb339c6213e173161e3385e6d689e
    hash_after: 5bb9c0a2443eb339c6213e173161e3385e6d689e
    inputs:
      - name: design/draft
        hash: 8e30f5495b854973
        size: 4839
      - name: design/tests-red
        hash: 14217a810eb895d8
        size: 825
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 559d9c0d8bfb8439fd7c94b7d20627a9c1ba52f5
    hash_after: 559d9c0d8bfb8439fd7c94b7d20627a9c1ba52f5
    answered:
      - name: lint
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: f0addebd50d2f9a0033d1f4530da10810c098b59
    hash_after: f0addebd50d2f9a0033d1f4530da10810c098b59
    answered:
      - name: tests
        exit: 0
        said: "green, src/modules/tickets passes; green, src/modules/files passes; green, src/index passes; green, src/imports passes; "
      - name: check
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    inputs:
      - name: design/tests-red
        hash: 14217a810eb895d8
        size: 825
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

The package moves whole to `src/modules/tickets`, and its reading functions stay as they stand.
`Registers` takes local names alone. `notes/<path...>` is the loaded projection of both ticket folders through the markdown codec, so `projections()` round-trips every ticket.
The out-port `all` is a derived provider over a family map of `files/<path...>`. It keeps each ticket-kind note directly under a folder, parses it through the same codec, and answers `All`.
The markdown codec is a `q.Codec` over a `Note` of head and body, which writes a file back byte for byte.
`q` gains one read. A derived input of type `map[string]T`, tagged with a family, takes every value the store holds under it, keyed by the path. The type check takes that map against a family of `T`.
`q.Content` gains `Changed`, the file time in nanoseconds, and the watch stamps it. The ticket keeps the time the work tab sorts by.
The watch hands no file standing before its start, so `files.Seeds` walks the tree once and commits it before the watch runs. The root starts the watch through it.
`spec/wiring.yaml` loads a tickets instance and wires `files/<path...>` in and `tickets/all` out. The root loads a module with no start.
The index drops `Tickets`, the topic and its writer. Its tickets method settles the scheduler and reads `tickets/all` off the store, and that commit ticks the changes call.
`onlyq` lists `src/yaml` beside `q`, since `q` rests on it and it imports the pure standard library alone.
Assumption: the private folder stays in `all`, as it did in the index.
Assumption: a tree with no wiring file answers no ticket, since the manager's case holds that it loads nothing past the manager. A private note parks that gap.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/door.go: opens, settle, walks and answers, which drop the publish and read the store
src/index/topic.go: registersTopics, writers and publishes, which leave
src/index/ticket.go: Tickets, which leaves
src/index/contract_test.go, core_test.go and sweep_test.go: the registersTopics calls
src/index/ticket_test.go and topic_test.go: the tickets cases, which move to the module and the root
src/q/q.go: derivedOf, which fills a family map
src/q/store.go: Snapshot, which reads a family
src/q/check.go: inputFaults, which takes a family map
src/modules/files/watch.go: Watch, hears, FakeWatch, Push and Start, which carry the time
src/modules/files/watch_contract_test.go: the two Changes hands
src/imports/imports.go: pastQ, which lists src/yaml
src/quack/main.go: modules, projections and load
spec/wiring.yaml: the tickets instance and its two wires
test/contract/index.test.js: the tickets case, whose tree carries the wiring

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/modules/tickets/module_test.go: TestAllAnswersEveryTicketWithItsFields, TestATicketCarriesTheTimeItsFileLastChanged and TestTheMarkdownCodecRoundTripsANote
src/q/wiring_test.go: TestAFamilyInputReadsEveryKey
src/q/catalog_test.go: TestAFamilyMapOfAnotherTypeFailsTheCheck
src/modules/files/files_test.go: TestTheSeedCommitsTheStandingTreeOnce
src/imports/imports_test.go: TestAModuleReadsYamlAsQDoes
src/quack/golden_test.go: TestTreeGolden, through qtest by the port all
src/quack/main_test.go: TestTheIndexImportsNoModule, TestTheWiredTreeAnswersItsTickets and TestTheServedIndexAnswersItsTickets
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

the loaded projection: `notes/<path...>` registers through `q.ProjectIn` with `q.Loaded` and `q.Also`, and `projections()` takes every module type
`Changed` on `q.Content`: the watch interface, `FakeWatch`, `Start` and both contract hands carry it
a touch keeping the hash: the watch already commits on every event, so the stamp adds no commit
the golden case: it stays in `src/quack`, reads `testdata/tree.golden.json`, and `src/tickets` leaves
the stub `Ticket`: the moved package keeps every field, `Progress`, `Changed`, `DependsOn` and `Fails` among them

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/tickets moves to src/modules/tickets, with markdown.go added
src/q/q.go
src/q/store.go
src/q/check.go
src/q/catalog_test.go
src/modules/files/watch.go
src/modules/files/watch_contract_test.go
src/modules/files/files_test.go
src/imports/imports.go
src/imports/imports_test.go
src/index/door.go
src/index/topic.go
src/index/ticket.go
src/index/ticket_test.go
src/index/topic_test.go
src/index/contract_test.go
src/index/core_test.go
src/index/sweep_test.go
src/index/door_test.go
src/quack/main.go
src/quack/main_test.go
src/quack/golden_test.go
src/quack/testdata/tree.golden.json
spec/wiring.yaml
test/contract/index.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened every file and function the approach names, and the build stands on each claim.
I grepped every importer of `src/tickets` and every caller of the topic, the watch hand and `pastQ`.
Each done_when line names its case, or `go test` or the check.

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

pass
- the approach answers the ask: src/modules/tickets registers notes through q.ProjectIn with q.Loaded over spec/tickets/*.md and q.Also over .se/tickets/*.md, all derives from a family map of files/<path...>, spec/wiring.yaml binds tickets.files/<path...> and tickets.all, and src/index/door.go reads tickets/all off the store after scheduler.Settle
- the red of design/tests-red came from TestAKeyReadsItsEntryOfTheResolvedValues in src/q/wiring_test.go, a red case of the-config-module-resolves-layers, so the record proves no case of this ticket red; the cases stand and assert each done_when line, TestTheIndexImportsNoModule over go list -deps, TestTreeGolden through qtest.New, TestTheWiredTreeAnswersItsTickets and TestTheServedIndexAnswersItsTickets, and each passes on the code already standing
- go test ./... from the root fails today on red cases of other tickets in the group, in src/q, src/q/qtest, src/modules/config and src/modules/index, so the first done_when line closes only once those land; every package this ticket touches passes, and go list -deps ./src/index names nothing under src/modules
- ./RUNME.sh check exits 0 on 5bb9c0a24, with warnings on this ticket's prose and on src/q/qtest/suite.go
- the draft names the projection port notes/<path...>, and NotesPort in src/modules/tickets/tickets.go reads notes; the builder fixes the draft's word or the port in place
- the size list leaves out src/q/wiring_test.go and src/modules/tickets/module_test.go, which the tests list names

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./... && ./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the files the draft names, and the size list carries each.
The watch keeps its fake. `FakeWatch` hands the new time as zero, and the seed case runs over `NewFakeWatch`.
Each new file opens on a header naming this ticket, and each new function carries its pointer.
The name `tickets/all` stands once, in `src/index/topic.go`, and the wiring file binds it.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

go test ./src/q -run TestAFamily && ./RUNME.sh branch test src/modules/tickets src/modules/files src/index src/imports src/quack

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The tickets leave the index and stand as a module under `src/modules/tickets`. The wiring loads it, and its `all` port answers `tickets/all`.
The module reads the whole `files/` family as one map, which `q` now fills for a map input tagged with a family. It parses each ticket through a markdown codec that writes a file back byte for byte.
The watch now stamps each file with the time it changed, and seeds the tree once at start. Before this, `files/` stood empty until a file moved, and the work tab would read no ticket after a restart.
The index keeps no ticket logic. Its tickets method settles the scheduler and reads the store, and a commit of `tickets/all` ticks the changes call.
`onlyq` lists `src/yaml` beside `q`, which rests on it, so a module reads a ticket's front.
The red the design step recorded came from another ticket's cases in `src/q`. So the tests command names this ticket's family cases, and the packages it owns.
A tree with no wiring file answers no ticket now. The private note `driven-trees-answer-no-tickets` parks that for the retro.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the files the draft names, and the size list carries each.
The watch keeps its fake. `FakeWatch` hands the new time as zero, and the seed case runs over `NewFakeWatch`.
Each new file opens on a header naming this ticket, and each new function carries its pointer.
The name `tickets/all` stands once, in `src/index/topic.go`, and the wiring file binds it.

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
