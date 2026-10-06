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
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: cf68c955a77a9b594e28ce9bdf4cf42a9b3bd61c
    hash_after: cf68c955a77a9b594e28ce9bdf4cf42a9b3bd61c
    inputs:
      - name: ask
        hash: 30d90eb0d7ad46ba
        size: 634
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 56c883b9474b3423f60534fcdc9a671a137af690
    hash_after: 56c883b9474b3423f60534fcdc9a671a137af690
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/owns fails
    inputs:
      - name: design/draft
        hash: cd77d5b1da5f1daf
        size: 2552
    def: 08e16d07b0de477c
  - step: gate
    hand: box add8d8d0dd3d · claude-code-remote · helper-4
    hash_before: 4cd306f70ef2c85eb3ce0e2a63b33d85bf292470
    hash_after: 4cd306f70ef2c85eb3ce0e2a63b33d85bf292470
    inputs:
      - name: design/draft
        hash: cd77d5b1da5f1daf
        size: 2552
      - name: design/tests-red
        hash: 59f0b483526f19bf
        size: 698
    def: dc4904ab364efa10
---

# Ask

The root `src/quack` reaches the disk, a process, the network and the system calls through the doors that own them, so a door stands the one place each reach happens.

Every direct `os`, `os/exec`, `net` and `syscall` call in the root is a reach no fake replaces, and the guard never refuses those packages while it stands.

- `./RUNME.sh doors` lists no walk-around of `os`, `os/exec`, `net`, `net/http` or `syscall` in a file under `src/quack` that is no test
- a root that builds the hand declares the reach it keeps in its own `owns.yaml`, and `./RUNME.sh doors` lists it as a door
- `./RUNME.sh test src/quack` passes

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

The root keeps its reach in a handful of door files, and every verb takes its reach off the hand those build.

1. `src/quack/owns.yaml` declares the root as a door owning `os`, `os/exec`, `net`, `net/http` and `syscall`, with its files: `main.go`, `io.go`, `boxdoors.go`, `checkdoors.go`, `ticket_doors.go` and `writedoor.go`. Several doors may own one name, so the files IO module keeps `os` as well.
2. Each verb file reaching the box takes the reach off a hand those files build: `boxDoors` for a run, a GET, the environment and the streams, `writeDoor` for a write, and the check and ticket doors for theirs. A read or a write the hands lack joins the hand as one member, in its door file, with its fake beside it.
3. `os.Args`, `os.Exit` and the process streams stay in `main.go`, which hands them on.

The change lands in commits by verb family, each green: the `retro_*` verbs, the `verb_*` verbs, then the rest. The walk-arounds of `time` and `context` in the root fall to `quack-waits-on-the-clock`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/boxdoors.go realBoxDoors and boxDoors: gains the members the verbs reach for
src/quack/writedoor.go: the write hand
src/quack/checkdoors.go and src/quack/ticket_doors.go: their hands
src/quack/main.go: builds the hands and hands them on
every verb file `./RUNME.sh doors` lists under src/quack for os, os/exec, net, net/http or syscall, one function each, which the build names once the import leaves

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/owns/tree_test.go TestEveryDoorNamesAPlantedWalk: covers the root's declaration, unchanged
src/quack/box_doors_test.go: each member the hand gains, against its fake
src/quack/quack_doors_tree_test.go TestNoRootFileReachesTheBoxPastItsDoors: no file of src/quack outside the root's door files and tests walks around a door owning os, os/exec, net, net/http or syscall

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/quack/owns.yaml
src/quack/boxdoors.go
src/quack/writedoor.go
src/quack/checkdoors.go
src/quack/ticket_doors.go
src/quack/main.go
src/quack/box_doors_test.go
src/quack/quack_doors_tree_test.go
every verb file the callers list names

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened `src/quack/boxdoors.go`, the door file list under `src/quack`, and the per-file walk-arounds `./RUNME.sh doors` prints, and each claim stands there
the callers list names the hands and every verb file the doors verb lists
the first done_when line falls to TestNoRootFileReachesTheBoxPastItsDoors and `./RUNME.sh doors`, the second to the root's declaration that `./RUNME.sh doors` lists, the third to `./RUNME.sh test src/quack`

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/owns

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/owns/quack_tree_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case names each import of a box package in a file of the root, past a marked line, the same walk-arounds `./RUNME.sh doors` lists there. It stands under `src/owns` beside the script case, not under `src/quack` as the draft says, because `doorsOf` already reads the tree there. Each member a hand gains takes its own case in `src/quack/box_doors_test.go` as the change writes it, red first.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the case names its claim and asserts it per walk-around, naming the file, line and doors
the case reads the tree and writes nothing
the case goes red on each import the change removes, as the run shows

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- quack-door-keeps-contract: the doors verb lists a door only through a contract line or an outside line (src/quack/verb_doors.go), so the root's owns.yaml names src/quack/box_doors_test.go under contract, and a case asserts the verb prints that it keeps the contract of the root door; the draft names no test deciding the second done_when line
- quack-boxfiles-joins-door: src/quack/boxfiles.go reaches os for stands and readText, and the draft's door file list leaves it out; the change moves those reads onto the hand or names the file in the root's declaration
- quack-marks-name-reasons: TestNoRootFileReachesTheBoxPastItsDoors in src/owns/quack_tree_test.go passes a marked walk, so each marker the change adds under src/quack names why no door serves it, and the accept reads every marker the diff adds
- quack-size-names-files: size names every verb file in place of the files; ./RUNME.sh doors lists the root files walking around os, os/exec, net, net/http and syscall, and the implement step names each one it touches

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
