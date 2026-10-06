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
group: doors-declare-what-they-own
depends_on: [tests-meet-the-doors-once, a-live-branch-holds-its-dependents]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 6cc2739de0713d9bf86ead9952ddff6ca0f08ced
    hash_after: 6cc2739de0713d9bf86ead9952ddff6ca0f08ced
    inputs:
      - name: ask
        hash: c2cd0430e723236e
        size: 495
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 5a2f2f5deeb857b1cb27e04f9cf73865b1bf99fd
    hash_after: 5a2f2f5deeb857b1cb27e04f9cf73865b1bf99fd
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: 9b7ce7f57fcdf21c
        size: 2406
    def: 08e16d07b0de477c
  - step: gate
    hand: box add8d8d0dd3d · claude-code-remote · helper-4
    hash_before: 548aab348bc2467f3c6072904a6e1099e84f64bf
    hash_after: 548aab348bc2467f3c6072904a6e1099e84f64bf
    inputs:
      - name: design/draft
        hash: 9b7ce7f57fcdf21c
        size: 2406
      - name: design/tests-red
        hash: 55348f9e242faeab
        size: 815
    def: dc4904ab364efa10
  - step: implement/change
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 37a2e9e22b208692d2389cb78210a56ee97f1b16
    hash_after: 5dbf75bb35efe8f1205005f4615431cb757537f6
    returns: 1
    why: Part one landed in 5dbf75bb3 with the check green. Part two moves the test walks onto fakes, and the draft holds it until tests-meet-the-doors-once merges into main, because that group moves the same tests on its open branch. The leaf waits for that merge and a branch sync.
    answered:
      - name: lint
        exit: 0
        said: "    1.9  test/contract/paragraph.test.js a character outside the set is refused, and a code span passes"
---

# Ask

Every Go and JavaScript test meets a door through its fake, or stands as the door's own contract test, so a test reaches the outside in one place a door.

A test reaching the box outside its door's contract takes the box into its run, and the walk-around list never reaches zero.

- `./RUNME.sh doors` lists no walk-around in a test file
- a door's contract test counts as the door's file in its `owns.yaml`, and `./RUNME.sh doors` lists it under the door
- `./RUNME.sh check` passes

none

none

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

Two parts, in this order.

First, a door names its contract tests. `owns.yaml` takes a `contract` key: paths from the root, under `test/contract/` or ending in `_contract_test.go`, which the parse in `src/owns/owns.go` checks exist. `Door.Holds` answers true for them, so a contract test uses the names its own door owns, and still walks around every other door. A contract test standing in its door's folder needs no key, since the folder already holds it.

Second, after `tests-meet-the-doors-once` merges into main and `./RUNME.sh branch sync` takes it in, every walk-around `./RUNME.sh doors` still lists in a test file moves onto its door's fake. A Go module test takes `q/qtest` and the fake beside the door. A JavaScript test takes `src/doors/fake`. A wait on the wall becomes a wait on the fake clock or on readiness. A helper that builds a real fixture for a contract, such as `src/watcher/watchertest`, keeps the marker with its reason, and the guard lists it.

The second part waits on the other group, because its audit moves most of these tests, and two hands moving one test collide at the merge.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/owns/owns.go Read: parses the new key
src/owns/owns.go Door.Holds: answers for a contract path
src/owns/owns.go claims: reads Holds per door, unchanged
src/modules/check/doors.go heldByOne: reads Holds, unchanged
src/quack/verb_doors.go doorsVerb: lists a door's contract tests

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/owns/owns_test.go TestAContractTestUsesItsOwnDoorsNames
src/owns/owns_test.go TestAContractTestWalksAroundAnotherDoor
src/owns/owns_test.go TestAContractPathStandingNowhereIsAFault
src/owns/tree_test.go TestEveryContractTestNamesItsDoor
src/quack/verb_doors_test.go TestTheDoorsVerbListsTheContractTests

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/owns/owns.go
src/owns/owns_test.go
src/owns/tree_test.go
src/quack/verb_doors.go
src/quack/verb_doors_test.go
owns.yaml beside each door with a contract test outside its folder
every test file `./RUNME.sh doors` lists after the sync
spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened `src/owns/owns.go` Read, Holds, claims and Walks, and `src/modules/check/doors.go` heldByOne, and each claim stands there
the callers list names every reader of Holds the search finds
the first done_when line falls to `./RUNME.sh doors`, the second to TestEveryContractTestNamesItsDoor and the doors verb test, the third to `./RUNME.sh check`

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/owns src/quack

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/owns/owns_test.go
src/quack/verb_doors_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All four cases fail on the same line: a declaration holding `contract` reads as a fault, since the parse takes go, js, files and report alone. The doors verb test first passed, because a faulted declaration yields no door and so no walk. It now also asks for the walk in a file outside the contract test, which pins that the declaration reads.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every case names its claim and asserts each word: the contract test uses its door's names, walks around another door, and a contract path standing nowhere or naming no contract test is a fault
each case plants its own declarations and touches no shared fixture
each case goes red for the reason the change answers, and the run shows it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- doors-lists-contract-tests: the ask's second done_when line says `./RUNME.sh doors` lists a door's contract test under the door, but TestDoorsPassesAContractTestItsDoorNames in src/quack/verb_doors_test.go asserts the output names no contract test, and doorsVerb in src/quack/verb_doors.go prints walks and a count alone; add a red case asserting the listing, and have doorsVerb print each door's contract tests
- contract-names-its-door: the draft names TestEveryContractTestNamesItsDoor in src/owns/tree_test.go, which tests-red never wrote, and the red list leaves tree_test.go out; write it red so every file under test/contract and every _contract_test.go stands in one door's contract key
- contract-beside-files-key: the draft says a contract test in its door's folder needs no key, but Door.Holds in src/owns/owns.go checks Files alone where a door names files; Holds answers true for a contract path whatever files says, and a case pins it

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

the change touches the files the draft sizes for part one, plus src/vehicle/owns.yaml, since the vehicle shim test is a contract test and its door stood undeclared
every door the change reaches keeps its fake, and the vehicle door is its disk.go and its dry twin
owns.go points each new name at spec/design_output/doors#a-door-names-its-contract-tests
the contract key stands once in the doors note, and the key table points at its chapter

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
