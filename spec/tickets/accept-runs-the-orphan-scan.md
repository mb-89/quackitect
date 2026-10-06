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
group: retro-and-coordinator
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: da6b82b36b3b0ae9a060f36b88ec16f15d80ad71
    hash_after: da6b82b36b3b0ae9a060f36b88ec16f15d80ad71
    inputs:
      - name: ask
        hash: f75794b80ce4ceff
        size: 330
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: e2d31375c89471556e03a1fb5a02c377ae2b0f52
    hash_after: e2d31375c89471556e03a1fb5a02c377ae2b0f52
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 39c7a5f96138c952
        size: 1706
    def: 08e16d07b0de477c
---

# Ask

Accept names every file the group adds that nothing reaches, so no group leaves dead code behind.

Each port group looks for orphans by hand with a script it throws away, or misses them.

- `go test ./src/branches/` passes a case where accept refuses a group whose diff adds a package nothing imports.
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

The accept step of `spec/processes/group.yaml` reads `./RUNME.sh branch review <name>`, per `spec/guidance/review/reviewing.md`. `gather` in `src/branches/review.go` gains `Unreached`, filled by a new `(*Doors).unreached` in `src/branches/unreached.go`. It lists the Go files `git diff --name-only --no-renames --diff-filter=A <trunk>...<ref>` adds, takes the module off `go.mod`, and per folder counts it reached where a new file says `package main`, the folder holds tests alone or sits under `testdata`, or `git grep` finds the folder's import path in a Go file past the folder. `report` adds an `unreached` row naming each file, and counts it one fix, so the review refuses the group until a hand wires or drops the package. The word is unreached, since `spec/vocabulary/terms.yml` gives orphan to a branch sharing no history with main. `spec/design_output/review.md` gains the row and the count.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/branches/review.go gather
src/branches/review.go report
src/branches/review.go review
src/branches/branch.go init, the review row of the verb table
src/quack/review.go gatheredOf, which decodes the material and ignores the new key
src/bridge/review.js reviewsBranch

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/branches/unreached_test.go TestTheReviewNamesAPackageNothingImports

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/branches/unreached.go
src/branches/unreached_test.go
src/branches/review.go
spec/design_output/review.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

review.go gather, report and material, group.yaml accept and reviewing.md rule 10 stand opened, and terms.yml defines orphan
the callers come from a grep of gather, report and material over src
the one done_when line meets TestTheReviewNamesAPackageNothingImports

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/unreached_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/branches/unreached_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The review answers with the check and retro rows alone, and no unreached row, so the case fails on its holds line. The review exits 0 even with things to fix, as it does over a red check, so the refusal reads as a counted fix in the report.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the one done_when line meets TestTheReviewNamesAPackageNothingImports, red on its assertion
the test reaches git through a real bare origin and clone, as every src/branches test does, and no other door

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
