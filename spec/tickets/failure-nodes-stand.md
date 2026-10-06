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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: failures-stand-registered
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 39484e1270aee1ef497f00d4ff06627bf71fd02b
    hash_after: d7d0243a7edc066c5d744048f088395f673d29ca
    inputs:
      - name: ask
        hash: 552f432cc5fd8d2d
        size: 657
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: b8c66b43cb0949f5ebc40232b6da7343252b82a8
    hash_after: b8c66b43cb0949f5ebc40232b6da7343252b82a8
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/failure fails
    inputs:
      - name: design/draft
        hash: 0809f9ab30bc9651
        size: 1954
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-4
    hash_before: 57606fe49c78703fde8d4f44fab80ab1336acfa9
    hash_after: 57606fe49c78703fde8d4f44fab80ab1336acfa9
    inputs:
      - name: design/draft
        hash: 0809f9ab30bc9651
        size: 1954
      - name: design/tests-red
        hash: 3297de04beacbef1
        size: 657
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 44051c13afc5ffb7bb5cb55411b964dd606b62da
    hash_after: 44051c13afc5ffb7bb5cb55411b964dd606b62da
    answered:
      - name: lint
        exit: 0
        said: "    2.3  test/contract/runme-road.test.js ./RUNME.sh hands get to quack, which reads the verbs slice off the index"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: a031d073a9645ffb0eb668cac7d24fa9c834c739
    hash_after: a031d073a9645ffb0eb668cac7d24fa9c834c739
    answered:
      - name: tests
        exit: 0
        said: green, src/failure passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: 3297de04beacbef1
        size: 657
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

Every failure gets one home: a node under spec/failures, with a level and the remedies a reader runs next. Each later slice reads the nodes through one registry, as [[spec/design_output/failures#a-failure-is-a-node]] says.

Without it, every site keeps its own free text, and no door, check or sentinel has a registry to read.

- `go test ./src/failure/` passes a case where Load reads every node under a root into a registry keyed by id
- `go test ./src/failure/` passes a case where the fake registry answers the nodes a case hands in
- `go test ./src/failure/` passes a case where a node naming no remedy meets a schema fault
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

The node shape and the registry stand in [[spec/design_output/failures#a-failure-is-a-node]] and [[spec/design_output/failures#the-registry-reads-the-nodes]].

- `spec/schemas/failure.schema.yaml` governs `spec/failures/**`. Its front takes `kind`, `level` off the ladder, `remedies` with one item at least, and an optional `reaction` and `watch`.
- `src/failure/node.go` holds `Node` and `Watch`, and `NodeOf` reads one note's front into a node.
- `src/failure/registry.go` holds `Registry`, keyed by id, and `Fake`, which answers the nodes a case hands in.
- `src/failure/door.go` holds `Dir`, which reads the folder under a root, and `FakeDir`, a map in memory. `Load` reads every node through either.
- `spec/failures/failure-unregistered.md` stands as the first node, which the door raises for an id with no node.

Weighed: a reader of the failure package's own against `pull.Disk`. The pull imports this package in the last slice, so a shared reader makes a cycle.
Assumed: the file name is the id, as a ticket's is, so two nodes never share one.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

none: the package is new, and the later slices call it

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/failure/registry_test.go: TestLoadKeysEveryNodeById
src/failure/registry_test.go: TestFakeAnswersTheNodesHandedIn
src/failure/schema_test.go: TestANodeNamingNoRemedyMeetsASchemaFault
src/failure/door_contract_test.go: TestDirAndFakeDirAnswerAlike
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

spec/schemas/failure.schema.yaml
spec/failures/failure-unregistered.md
src/failure/node.go
src/failure/registry.go
src/failure/door.go
src/failure/registry_test.go
src/failure/schema_test.go
src/failure/door_contract_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened the rationale schema, the check's CheckNote and SchemasIn, the yaml reader and the pull's disk door, and checked each claim there.
The package is new, so nothing calls it yet.
Each done_when line names its case, and the check decides the last.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/failure/registry_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/failure/registry_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The Load and fake cases fail on their assertion, since the stubs answer an empty registry.
The schema case passes already, because the schema lands in this diff and the checker refuses a required field standing empty. The surprise: the checker names the rule `Schema.remedies`, with its kind's prefix.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The Load and fake lines meet a red case, the schema line meets a case the schema holds, and the check decides the last.
The door's fake, `FakeDir`, holds every case, and one contract case drives both the folder and the fake.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- failure-watch-shape: the schema types watch as a bare object and remedies as a bare array, and the checker reads no nested properties or items, so a node with quiet: thirty or a remedy written as a map passes the check while Load reads Event, Match, Quiet and string remedies; NodeOf should refuse such a node, or the checker should learn items and nested properties

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/failure/registry.go alone, the file the ask names
- Load reads through the Reader door, and FakeDir stands as its fake under door_contract_test.go
- the comment on Load names the approach: NodeOf reads each node, and Load keeps the ones with no fault
- the folder and the note ending stay in node.go's constants, and registry.go reads them from there

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/failure/registry_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Load reads every .md file under spec/failures through the Reader door, reads each one through NodeOf, and keys each node with no fault by the id its file name carries. Fake keys the nodes a case hands in by their ids. registry_test.go turns green.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/failure/registry.go alone, the file the ask names
- Load reads through the Reader door, and FakeDir stands as its fake under door_contract_test.go
- the comment on Load names the approach: NodeOf reads each node, and Load keeps the ones with no fault
- the folder and the note ending stay in node.go's constants, and registry.go reads them from there

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
