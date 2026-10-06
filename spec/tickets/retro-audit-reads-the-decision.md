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
    hash_before: d54a1312578af5a9cd5738cdf9af6bda1d676bb3
    hash_after: d54a1312578af5a9cd5738cdf9af6bda1d676bb3
    inputs:
      - name: ask
        hash: c4cd700ddee2f0f9
        size: 325
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: f39555b0ae8a21e805480919ebd9c12fe74f625f
    hash_after: f39555b0ae8a21e805480919ebd9c12fe74f625f
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 8fdf0e78c29f3b82
        size: 1478
    def: 08e16d07b0de477c
---

# Ask

A trial closes only with its decision or a successor written, so every trial keeps what it found.

A trial closed with an empty decision passes the audit, and nobody reads what it found.

- `go test ./src/quack/` passes a case where `retro audit` names a closed trial whose decision stands empty.
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

`src/quack/retro_audit.go` gains `retroAuditUndecided`. It lists the closed tickets on the experiment process that keep nothing they found. `retroAuditKept` reads a trial as keeping it where the decision field under its decide step holds a row, through `pull.ChapterOf`, or its front names a successor under `successors`. The verb passes only where no trial stands open and none stands closed and silent, and it names each silent trial under its own line. The standing test of the clear case writes a decision on its closed trial, since a closed trial with none now fails. `spec/design_output/work.md` says the audit also names a closed trial with no decision and no successor.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/retro_audit.go init, which registers retro audit
src/quack/retro_audit.go retroAuditVerb
spec/processes/retro.yaml, the audit step, which needs retro audit
src/quack/retro_audit_test.go TestRetroAuditAnswersAWaitOverAnOpenTrialAndPassesOverNone

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/retro_audit_test.go TestRetroAuditNamesAClosedTrialWhoseDecisionStandsEmpty

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/quack/retro_audit.go
src/quack/retro_audit_test.go
spec/design_output/work.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

retro_audit.go, experiment.yaml's decide step, pull.ChapterOf and pull.FrontOf, and the one closed trial in the tree stand opened
the callers come from a grep of retroAuditVerb and retroAuditOpenTrials
the one done_when line meets TestRetroAuditNamesAClosedTrialWhoseDecisionStandsEmpty

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/retro_audit_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/quack/retro_audit_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The audit reads open trials alone, so a closed trial with an empty decision passes it and the verb answers 0. The standing clear case now writes a decision on its closed trial, and it stays green.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the one done_when line meets TestRetroAuditNamesAClosedTrialWhoseDecisionStandsEmpty, red on its assertion
the test reaches a temp folder the case seeds, as every retro audit test does, and no other door

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
