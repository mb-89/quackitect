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
process_hash: c671f20a6ae2a4a6
group: tickets-keep-their-chapters
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: e89f530a7b39e5c7a987e684d5222c7fa137b2d1
    hash_after: e89f530a7b39e5c7a987e684d5222c7fa137b2d1
    inputs:
      - name: ask
        hash: d80404492aa4c870
        size: 765
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: dc3d13b7ad1af1f011717da29a5828b948e3879b
    hash_after: dc3d13b7ad1af1f011717da29a5828b948e3879b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/plans fails
    inputs:
      - name: design/draft
        hash: 7cfe6ceb9a7dcf57
        size: 1446
    def: 08e16d07b0de477c
---

# Ask

The plan file keeps every todo across parallel plan calls and across a file that reads as no JSON object, because the plan action runs serialised and a bad read refuses instead of writing.

Two plan calls sent at once both read the same file, and the second write drops the first one's todos. A plan file with a trailing comma reads as empty, and the next call writes over every todo, working and places.

- go test ./src/modules/plans passes a case where a plan file holding no JSON object refuses and stands unchanged
- go test ./src/modules/plans passes a case where a read error other than not-exist refuses
- go test ./src/modules/plans passes a case where the plan action registers as a write, so the book serialises it
- ./RUNME.sh check is green

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

Three changes in `src/modules/plans/plans.go`. `Registers` adds `q.Writes()` to the plan action, so every call takes a record and a wait and the book runs two calls one after the other. `plans` refuses a read error other than not-exist, checked through `errors.Is` against `fs.ErrNotExist`, and writes nothing. `planOf` answers a fault where the text holds more than white space and reads as no JSON object, and `plans` refuses on that fault and writes nothing. A missing or blank file still reads as an empty plan.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/modules.go` registers `plans.Registers`
- `src/quack/accepts.go` calls `plans.Accept` over `plansOutside`
- `src/modules/plans/plans.go` `plans` calls `planOf`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/plans/plans_test.go` `TestAPlanFileReadingAsNoObjectRefusesAndStands`
- `src/modules/plans/plans_test.go` `TestAReadErrorPastNotExistRefuses`
- `src/modules/plans/plans_test.go` `TestTheModuleRegistersThePlanTool`, which also asserts the action declares its writes

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/plans/plans.go`
- `src/modules/plans/plans_test.go`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `plans.go`, `plans_test.go`, `src/quack/plans.go`, `src/quack/accepts.go` and `q.Writes` in `src/q/q.go` stand opened, and each claim checked there
- the callers list names the registration, the accept and the one reader of `planOf`
- each done_when line names its case under tests
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/plans

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/plans/plans_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three cases fail on their own assertion: the action declares no write, a text reading as no object gets overwritten with a fresh plan, and a denied read writes a fresh plan. The case for a missing or blank file passes already, and it guards the empty plan through the change.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets its failing case in `plans_test.go`
- the tests reach the plan file through the fake read and write the module takes, and the store through `q.NewStore`

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
