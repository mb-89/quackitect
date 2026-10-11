---
kind: [[ticket]]
state: open
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
    gate: does the approach break a rule of the ask, and does a red test decide every done_when line
    does: reads the design phase for the rules of the ask it breaks, fixes what it finds within its own diff, names the rest as points, and leaves the rest of the ask alone
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
        does: makes the change the ask names, with the red tests as its floor, so a rule of the ask lands where no red test names it
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
process_hash: 3fd2a7591c5044cf
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 8339730da099 · claude-code-remote
    hash_before: 423b3e221ae4d1d65aa1749e3a4d669cd93eb0e5
    hash_after: 423b3e221ae4d1d65aa1749e3a4d669cd93eb0e5
    inputs:
      - name: ask
        hash: 72558ea6e15ed54d
        size: 552
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 8339730da099 · claude-code-remote
    hash_before: 43422fcda3a8dd7166138e38dfd6c1b5489bc601
    hash_after: 43422fcda3a8dd7166138e38dfd6c1b5489bc601
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 1afb7bffaada5615
        size: 1291
    def: 08e16d07b0de477c
    frozen:
      - path: src/branches/port_f_testverb_test.go
        hash: a3ded3187aa2d933
  - step: gate
    hand: box 8339730da099 · claude-code-remote · helper-4
    hash_before: 0361b36a8fd884622a916b73af8f3317efb9d95d
    hash_after: 0361b36a8fd884622a916b73af8f3317efb9d95d
    inputs:
      - name: design/draft
        hash: 1afb7bffaada5615
        size: 1291
      - name: design/tests-red
        hash: 0c9c9ee5f01d6b9e
        size: 564
    def: 7cea74295027d571
  - step: implement/change
    hand: box 8339730da099 · claude-code-remote
    hash_before: 17b0c8899fd2db5b1f2a78234dba7b29db643baf
    hash_after: 16e4877d415ca47c2e3a7b13ad1f77b032f5f1fc
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
group: branches-and-pull-report-truly
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a Go test package that fails to build reads build, so the tests-red gate takes only a test that fails on its own assertion.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `goSays` in `src/branches/test.go` reads `goFail` before any build fault. A real build failure prints `FAIL <pkg> [build failed]`, so it reads assertion, and a test calling a missing function passes the tests-red gate.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestPFGoSaysItsWord` passes over the stdout and stderr a real build failure prints
- `./RUNME.sh check` answers 0 on this box

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
from: none

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

`goSays` in `src/branches/test.go` reads the build fault first. A package that fails to build prints `FAIL <pkg> [build failed]` on stdout, or `[setup failed]` where its imports fail, and the compiler's line on stderr. A new pattern `goBuildFail` matches those two marks, and a run matching it reads build, naming the first line `goError` finds. A run with no build mark and a `FAIL` line reads assertion as before. In a run over many packages, one package that builds not makes the run read build, so the tests-red gate takes a run whose every failure is an assertion.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/test.go: `branchTest`, the one call of `goSays` over each Go module the change names

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/port_f_testverb_test.go: `TestPFGoSaysItsWord` takes the stdout and stderr a real build failure prints, and a run mixing an assertion with a build failure

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/test.go
- src/branches/port_f_testverb_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `goSays`, `goFail` and `goError` stand opened in `src/branches/test.go`, and a scratch module showed what `go test` prints on a build failure
- the callers list holds the one call at `src/branches/test.go`
- the done_when line names `TestPFGoSaysItsWord`
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/port_f_testverb_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/port_f_testverb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on the second run: the stdout and stderr a real build failure prints read assertion, as the ask says. A scratch module showed the shape: stdout carries `FAIL <pkg> [build failed]`, and stderr carries the compiler's line under a `#` head.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the done_when line on `TestPFGoSaysItsWord` meets a test that fails on its own assertion
- the case reaches no door, since `goSays` reads a run's text alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint --changed --strict

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/branches/test.go alone, which the ask names
- the change reaches no door, so it needs no fake
- the goSays header names the approach: a build mark reads build before any FAIL line
- the build mark stands in the goBuild pattern alone

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

The draft's callers line names `branchTest`. The one caller of `goSays` is `testVerb` in `src/branches/test.go`.
