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
group: lint-without-vale
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 6265b0d86105ce987dc0cfbe8ff758c6a4166720
    hash_after: b6581ad8ca70dd01a36e5d503b7293547fb714ca
    inputs:
      - name: ask
        hash: ba4e2087a8e0b8a1
        size: 494
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 93ea938056f9cdc02c0009e8cc9deced9dc2c789
    hash_after: 93ea938056f9cdc02c0009e8cc9deced9dc2c789
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 9bf1118afce8b735
        size: 1640
    def: 08e16d07b0de477c
  - step: gate
    hand: box 09cf21ad3c5d · claude-code-remote · helper-4
    hash_before: 04a830297d694745f5acb0ecc26b1974caf3a43a
    hash_after: 04a830297d694745f5acb0ecc26b1974caf3a43a
    inputs:
      - name: design/draft
        hash: 9bf1118afce8b735
        size: 1640
      - name: design/tests-red
        hash: 9d657bfa5c2a59d2
        size: 739
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 78e3bfa386b47202f5b06458d5fdc0631c1a0426
    hash_after: e158d2509d9c42e0c86f4ec18ea94d77d6ed1368
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 4536dba06df95bb336522576d63996297978cd66
    hash_after: 4536dba06df95bb336522576d63996297978cd66
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   76.5  in all"
    inputs:
      - name: design/tests-red
        hash: 9d657bfa5c2a59d2
        size: 739
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

Vale and the rules run over the changed files at commit and mint, so a finding shows in seconds and no warning rides to main.

A finding stands unseen until a check of one to four minutes, or a warning lands on main and every later check repeats it.

- `go test ./src/quack/` passes a case where a commit refuses a staged file the rules refuse, before the check.
- `go test ./src/quack/` passes a case where the check refuses a warning in a file the branch changes.
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

The lint verb takes --strict, under which a warning exits 1 as an error does, and --changed, which reads the files changed since the merge base with origin/main and the working tree, past spec/tickets, spec/retros and .se, whose files the engine writes. The check gains a part changed running lint --changed --strict, so a warning in a file the branch changes turns the check red. The commit verb reads the files its staging reaches through git add --dry-run before the tests, runs lint --strict over them, and refuses before anything stages where the rules refuse. The mint stays as it stands: ticket open already reads the ask's form.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go partsOf
- src/quack/commit.go lands
- src/quack/verb_lint.go lintVerb, lintHere

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/commit_test.go TestCommitVerbGates: a staged file the rules refuse stops the commit before the tests and the check
- src/quack/verb_lint_test.go TestLintVerb: a warning under --strict exits 1
- src/quack/verb_lint_test.go TestLintVerb: --changed reads the changed files past the tickets
- src/quack/check_test.go: the check runs lint --changed --strict as a part

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verb_lint.go
- src/quack/verb_lint_test.go
- src/quack/commit.go
- src/quack/commit_test.go
- src/quack/check.go
- src/quack/check_test.go
- spec/design_output/lsp.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened: verb_lint.go, commit.go lands, check.go partsOf
- the callers list names partsOf, lands and lintHere
- each done_when line meets a test: the commit case, the strict and changed lint cases, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go src/quack/verb_lint_test.go src/quack/commit_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_test.go
- src/quack/verb_lint_test.go
- src/quack/commit_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The check runs no changed part, a warning under the strict flag exits 0, the changed flag reads the whole tree, and the commit runs the tests before any rule. The cold probe case asserts that the tests run first, so it moves with the change.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the commit case, the strict and changed lint cases, and the check part
- every door the cases reach has its fake: the landing fake for the verbs, and the lint fake gains the changed door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- changed-lint-without-merge-base: CI's check.yml checks out at depth one with no origin/main ref, so the changed door's merge base with origin/main finds nothing there; the approach names no fallback, and the implement step gives the door one (the files of HEAD's own commit, or an empty list with a line saying so) and a case for it
- working-rule-strict-commit: guidance working rule 10 says a line at warning stands and only the push waits, and the commit's strict lint now refuses a staged file at warning; the rule and its table row name the commit as the gate

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

- the change touches the lint verb, the check's parts, the commit verb and the changed door the ask names. The warnings it clears sit in files the branch changes, which the new changed part reads whole, and the moved pointers follow the one heading that cut.
- every door has a fake: the lint's changed door has `lintFake.changed` and the git fake in `lint_changed_test.go`, and the commit's lint runs through the landing fake's verb
- each new comment points at this ticket, which carries the approach
- one place: `engineWrites` in `src/quack/lint_changed.go` names the folders the engine writes, and the lint and the commit both read it through `handWritten`

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go src/quack/commit_test.go src/quack/lint_changed_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The lint takes `--strict`, under which a warning exits 1, and `--changed`, which reads the files the branch changes past the folders the engine writes. The check runs `lint --changed --strict` as its first part, so a warning in a changed file turns it red in seconds. The commit runs the strict lint over the files its staging reaches, and refuses before the tests and before anything stages. The lint's own strict and changed cases pass under `go test ./src/quack/ -run 'TestLintVerb/(.*strict.*|.*changed.*)'`. They share `TestLintVerb` with one case `the-check-lint-runs-in-go` holds red until its change lands, so the tests line names the files whose tests stand whole. The first strict run refused the warnings this branch carried in the files it changes, and this change clears them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the ask reaches, and the warnings it clears sit in files the branch changes
- every door has a fake: the changed door, the lint verb through the landing fake, and the check's verb road
- each new comment points at this ticket, which carries the approach
- one place: `engineWrites` in `src/quack/lint_changed.go` names the folders the engine writes, and both the lint and the commit read it

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
