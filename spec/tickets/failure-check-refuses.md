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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: failures-stand-registered
depends_on: ["failure-nodes-stand, failure-door-raises"]
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 1149de53e89605c65bf25da051bcb40d30f889f2
    hash_after: 1149de53e89605c65bf25da051bcb40d30f889f2
    inputs:
      - name: ask
        hash: 91948bcaf972bb1f
        size: 615
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 4f138fba4b111099bbae7a563f5d7c334b905020
    hash_after: 4f138fba4b111099bbae7a563f5d7c334b905020
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/failure fails
    inputs:
      - name: design/draft
        hash: d49d70f3831b853c
        size: 2429
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 08e16d07b0de477c
---

# Ask

The check holds the registry: no node without a remedy, no raised id without a node, and no refusal past the door in a moved file, as [[spec/design_output/failures#the-check-holds-the-registry]] says.

Without it, a node loses its remedy, or a site raises an id nobody registers, and nothing says so.

- `go test ./src/failure/` passes a case where every node under spec/failures names a remedy
- `go test ./src/failure/` passes a case where every id a Raise or a raise names stands as a node
- `go test ./src/failure/` passes a case where the moved files write no refusal past the door
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

[[spec/design_output/failures#the-check-holds-the-registry]] holds the approach. The tree cases follow src/imports/tree_test.go: pure fault functions, and one case a rule that reads the tree under ../.. through the package's door.

src/failure/check.go adds three fault functions. NodeFaults(reader) answers each fault NodeOf names over every node under spec/failures. RaiseFaults(registry, files) reads each source text it is handed for a literal id inside a Go Raise call or a JavaScript raise call, and answers each id the registry lacks. DoorFaults(moved, files) answers each moved file whose text still holds the refusal call it held before the move.

Moved maps a file to that refusal call, and stands empty until the refusal move fills it.

The door gains Walk(folder), which lists every file under a folder by slashed path. Dir and FakeDir both answer it, and the contract case holds the two to the same answer. The raise scan walks src and .claude/skills/level0, and skips test files and test/, since a case raises made-up ids against a fake.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- none today: the fault functions, Moved and Walk are new
- the check, through go test ./src/..., which runs the tree cases
- the refusal move, which adds each moved file to Moved

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/failure/check_test.go TestNodeFaultsNameANodeWithNoRemedy
- src/failure/check_test.go TestRaiseFaultsNameAnIdWithNoNode
- src/failure/check_test.go TestDoorFaultsNameAMovedFileHoldingItsRefusal
- src/failure/tree_test.go TestEveryNodeNamesARemedy
- src/failure/tree_test.go TestEveryRaisedIdStandsAsANode
- src/failure/tree_test.go TestTheMovedFilesWriteNoRefusalPastTheDoor
- src/failure/door_contract_test.go TestDirAndFakeDirAnswerAlike, extended to Walk

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/failure/check.go
- src/failure/check_test.go
- src/failure/tree_test.go
- src/failure/door.go
- src/failure/door_contract_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened src/failure/node.go, registry.go, door.go, raise.go, src/doors/failure.js and src/imports/tree_test.go, and checked each claim the approach makes against them
- the callers list names the check and the refusal move, since no caller stands today
- each done_when line maps to a tree case: the remedy line to TestEveryNodeNamesARemedy, the raised id line to TestEveryRaisedIdStandsAsANode, the moved files line to TestTheMovedFilesWriteNoRefusalPastTheDoor, and the check to ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/failure/check_test.go src/failure/tree_test.go src/failure/door_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/failure/check_test.go TestNodeFaultsNameANodeWithNoRemedy
- src/failure/check_test.go TestRaiseFaultsNameAnIdWithNoNode
- src/failure/check_test.go TestDoorFaultsNameAMovedFileHoldingItsRefusal
- src/failure/tree_test.go TestEveryNodeNamesARemedy
- src/failure/tree_test.go TestEveryRaisedIdStandsAsANode
- src/failure/tree_test.go TestTheMovedFilesWriteNoRefusalPastTheDoor
- src/failure/door_contract_test.go TestDirAndFakeDirAnswerAlike

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The fault stubs answer no fault, so each fixture case misses the fault it names. The Walk stubs answer no file, so the contract case misses the walk, and each tree case stops on a walk that reads nothing.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the three tree cases decide the three go test lines, the fixture cases pin each fault's wording, and ./RUNME.sh check decides the last
- the fixture cases read through FakeDir and the Fake registry, and the contract case holds Dir and FakeDir to the same Walk

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
