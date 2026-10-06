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
group: level-zero-smoke
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a694567529c5 · claude-code-remote
    hash_before: 8ae855272ceabd77a8bfdccab7f6837957115402
    hash_after: 8ae855272ceabd77a8bfdccab7f6837957115402
    inputs:
      - name: ask
        hash: 21bf3069c0e18f63
        size: 421
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a694567529c5 · claude-code-remote
    hash_before: 15e0bf87db259864a76f8493ab14b7e959fc4c7f
    hash_after: 15e0bf87db259864a76f8493ab14b7e959fc4c7f
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: b9d2935fa7d8472b
        size: 1701
    def: 08e16d07b0de477c
  - step: gate
    hand: box a694567529c5 · claude-code-remote · helper-4
    hash_before: 93df06a489659ca7429058d85497f88a6510d2ec
    hash_after: 93df06a489659ca7429058d85497f88a6510d2ec
    inputs:
      - name: design/draft
        hash: b9d2935fa7d8472b
        size: 1701
      - name: design/tests-red
        hash: d7c071c1f34ecffe
        size: 596
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a694567529c5 · claude-code-remote
    hash_before: c171785c1e1187b951856bf9a989a4ef382d43b0
    hash_after: c171785c1e1187b951856bf9a989a4ef382d43b0
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box a694567529c5 · claude-code-remote
    hash_before: 7da8e25908c9de7bf15e57bec150b88fddc9a96b
    hash_after: 66d158e08200207a75771fea3ad52e9e37c57d2d
reason: became
successors: [the-index-outlives-the-check]
---

# Ask

When the check gives up on a child process, Vale's timeout among them, it ends that process and every process under it, so no orphan stays running.

An orphan holds a pipe, a port or a lock, so the next check hangs or a box runs out of processes.

- `go test ./src/quack/` passes a case where a child the Vale call gives up on, and a process it starts, both stand ended once the call returns.
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

One helper, endsWhole in src/quack/ending.go, readies a command so the end of its context ends the child and every process the child started. On Linux and macOS, ending_unix.go stands the child in a process group of its own and its Cancel kills the whole group. On Windows, ending_windows.go has Cancel run taskkill /T /F over the child's tree. The Vale call in heardIn, gitRead, the review gathering and realRun where a run carries a span and inherits no terminal all take it, since each gives up on a child at a span. A run inheriting the terminal keeps the terminal's group, so a Ctrl-C there still reaches the child. The test proves the end through an event and no timer: the child starts a grandchild holding the child's stdout, and that pipe reads to its end only once every process holding it has ended.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/command.go heardIn, the Vale call
- src/quack/command.go gitRead
- src/quack/review.go reviewOver
- src/quack/boxdoors.go realRun

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/ending_test.go TestAChildTheCheckGivesUpOnEndsWithEveryProcessItStarted

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/ending.go
- src/quack/ending_unix.go
- src/quack/ending_windows.go
- src/quack/ending_test.go
- src/quack/command.go
- src/quack/review.go
- src/quack/boxdoors.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- command.go heardIn and gitRead, review.go reviewOver and boxdoors.go realRun stand opened, each building its child through exec.CommandContext with a span
- grep finds exec.CommandContext in those four places in src/quack, and lsp and index own their own children outside the check
- the Vale line meets ending_test, which drives the road the Vale call takes, and the check line its own command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/ending_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its assertion: the stub leaves the child in the test's own group with no cancel of its own. Past that assertion the old road would hang on the pipe the grandchild holds, which is the hang the ask names, so the group check stands first and decides the red.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the Vale line meets the case driving the road the Vale call takes, and the check line waits for tests-green
- the case drives real processes, as the one test of the ending road, and every other case keeps its fake runner

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- ending-windows-tree-tested: ending_test.go builds under !windows, so the taskkill /T /F road in ending_windows.go meets no test while check.yml runs windows-latest; add a Windows case where a child and the process it starts both stand ended once the span ends, waiting on the pipe as the unix case does
- vale-call-takes-endswhole: the case drives endsWhole over sh and never the Vale road, so no test decides that heardIn, gitRead, reviewOver and realRun wrap their child in endsWhole; the implementer wraps all four in place and names in the says field that a missed caller leaves that call's children orphaned

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

cd src && CGO_ENABLED=0 go vet ./quack/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches ending.go, ending_unix.go, ending_windows.go and the four callers the approach names, landed through ending-windows-tree-tested and vale-call-takes-endswhole
the change reaches processes through exec.Cmd, which the ending cases drive against the real thing, since the process is the door under test
endsWhole, whole and the realRun rule link this ticket
the inherit rule stands once, over realRun

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
