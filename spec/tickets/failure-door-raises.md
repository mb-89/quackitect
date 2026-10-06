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
depends_on: ["failure-nodes-stand"]
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 73ccc0cd3edfaa35112e6f7addeeb671cbb107d9
    hash_after: 73ccc0cd3edfaa35112e6f7addeeb671cbb107d9
    inputs:
      - name: ask
        hash: f29f14d43748a335
        size: 682
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 7883b3d10633c780
---

# Ask

A module raises a failure through one door, in Go and in its JavaScript twin. The door prints the id, the message and each remedy, and writes a log row carrying the id, as [[spec/design_output/failures#one-door-raises-a-failure]] says.

Without it, a refusal names no fix, and the retro counts no failure by id.

- `go test ./src/failure/` passes a case where Raise answers the lines with the id, the level, the message and each remedy
- `go test ./src/failure/` passes a case where the row Raise answers carries the failure id
- the JavaScript door's case under test/level0 prints the same lines off the fake, and its contract case reads the real nodes
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

[[spec/design_output/failures#one-door-raises-a-failure]] holds the approach. In Go, src/failure/raise.go adds Raise(registry, id, said...), which answers a Raised holding the id, level, message, remedies and whether the id is registered. Raised.Lines prints the message, then `failure <id> at <level>`, then one `remedy:` line per remedy, and for an unregistered id it prints the message and a line naming that id. Raised.Row(at) answers the log row: at, level, kind failure, said, and a failure field holding the id. The caller stamps `at` through its clock door, so the package reads no clock. In JavaScript, src/doors/failure.js exports failure(disk, log). It reads spec/failures/*.md through the disk door and .claude/skills/level0/lib/schema.js readNote, and answers raise(id, said), which prints the same lines and writes the same row through log.say. src/doors/fake/failure.js answers off nodes a case hands in, keeps every raised id, and writes to a fake log.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- none today: Raise and the JavaScript door are new
- src/quack, through failure-verbs-raise-and-register, which raises through Raise
- the pull, take and mint refusals, through the refusal move, which raise through Raise

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/failure/raise_test.go TestRaiseAnswersTheMessageTheIdAtItsLevelAndEachRemedy
- src/failure/raise_test.go TestRaiseNamesAnUnregisteredId
- src/failure/raise_test.go TestTheRowCarriesTheFailureId
- test/level0/failure-door.test.js raise prints the message, the id at its level and each remedy off the fake, and logs a row carrying the id
- test/contract/failure-door.test.js the door reads the real nodes under spec/failures

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/failure/raise.go
- src/failure/raise_test.go
- src/doors/failure.js
- src/doors/fake/failure.js
- test/level0/failure-door.test.js
- test/contract/failure-door.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened src/failure/registry.go, node.go and door.go, src/doors/log.js, src/doors/fake/log.js, lib/log.js rowOf, and src/engine/group.js readNote, and checked each claim the approach makes against them
- the callers list names the slices that call the door, since no caller stands today
- each done_when line maps to a test: the lines go to TestRaiseAnswersTheMessageTheIdAtItsLevelAndEachRemedy, the row id to TestTheRowCarriesTheFailureId, the JavaScript lines to the failure-door case under test/level0 and its contract case, and the check to ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
