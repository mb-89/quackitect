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
group: retro-and-coordinator
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: 5ec0735c317d6537e884eb5a60df6d02c27baa0a
    hash_after: 5ec0735c317d6537e884eb5a60df6d02c27baa0a
    inputs:
      - name: ask
        hash: b38871be887b12e4
        size: 444
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 8c9d6ebe7819 · claude-code-remote
    hash_before: 106ae83307eef0d3d149613207f6a5481702ac41
    hash_after: 106ae83307eef0d3d149613207f6a5481702ac41
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: fae2abb9b10e4632
        size: 2309
    def: 08e16d07b0de477c
  - step: gate
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: cb2f5f096445c92cf8d08b7a5e0233e8c7695bcd
    hash_after: cb2f5f096445c92cf8d08b7a5e0233e8c7695bcd
    inputs:
      - name: design/draft
        hash: fae2abb9b10e4632
        size: 2309
      - name: design/tests-red
        hash: 903a5e28ce3cdf10
        size: 700
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: b17a09908afa9cf9d6a69505d483f35aa37abdfb
    hash_after: b17a09908afa9cf9d6a69505d483f35aa37abdfb
    answered:
      - name: lint
        exit: 0
        said: ".claude/skills/work/SKILL.md:14:1: ListItem: A sentence in a list item holds 20 words, and this one holds 26. Cut it."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: eca24cc712d1790591a500b2e636bcfe3c8b163c
    hash_after: eca24cc712d1790591a500b2e636bcfe3c8b163c
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/branches passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: 903a5e28ce3cdf10
        size: 700
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

The dispatch sees a work pull request turn red at once, and the log names each failing case with its file and line.

A red pull request waits unseen for half an hour, and a hand greps its log to find the case.

- `go test ./src/quack/` passes a case where a red check ends by naming each red case with its file.
- `go test ./src/branches/` passes a case where the dispatch fires a worker at a red work pull request.
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

The check: `redCase` and `caseRow` in `src/quack/battery.go` gain a line. The reporter in `src/scripts/battery-reporter.js` writes the line a failing runner case names. A new `redLine` feeds `errorsSaid` and a new `redSaid`, and `saysParts` in `src/quack/check.go` ends the log on the red cases. Go reds reach the same list: the loud run keeps its standard output too, `goGate` parses it through `goRedIn` into a runtime file, and `checkVerb` adds those cases to the report.

The dispatch: `fire` in `src/branches/dispatch_fire.go` calls a new `redPulls`. It reads the open pull requests through the send door, keeps the ones whose head is a work branch the plan fires nowhere else, and reads each head's check runs. A failure or a timeout marks it red. Each red branch gets a fire whose text names the pull request and asks the worker to fix the cases its log ends on. `.github/workflows/dispatch.yml` also wakes on a completed check run that fails on a work pull request, so the fire comes at once. The work skill gains the step a red fire takes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/check.go checkVerb
src/quack/check.go saysParts
src/quack/check.go errorsSaid
src/quack/check.go goGate, through partsOf
src/quack/checkdoors.go checkDoorsOf, the run door
src/quack/battery.go redIn, through batteryOf and errorsSaid
src/quack/retro_report.go, which reads the stamp's red cases
src/scripts/battery-reporter.js rowOf
src/branches/dispatch.go Dispatch, which calls fire
src/branches/dispatch_fire.go fire and fires

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/check_test.go TestCheckEndsOnTheRedCases
src/branches/dispatch_fire_test.go TestDispatchFiresAWorkerAtARedWorkPullRequest

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/quack/battery.go
src/quack/battery_test.go
src/quack/check.go
src/quack/checkdoors.go
src/quack/check_test.go
src/scripts/battery-reporter.js
test/level0/battery-reporter.test.js
src/branches/dispatch_fire.go
src/branches/dispatch_fire_test.go
.github/workflows/dispatch.yml
.claude/skills/work/SKILL.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

check.go, checkdoors.go, battery.go, the reporter, dispatch_fire.go, its fake hub and dispatch.yml stand opened
the callers come from a grep of each changed function over src
the first done_when line meets TestCheckEndsOnTheRedCases, the second TestDispatchFiresAWorkerAtARedWorkPullRequest

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go src/branches/dispatch_fire_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/quack/check_test.go
src/branches/dispatch_fire_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The red check ends on its timing table, and no red case follows it, for a runner case and a Go test alike. The fire sends the ready group alone, since no road reads the pull requests' check runs. The fake hub gains a check-runs route keyed by the head commit.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets TestCheckEndsOnTheRedCases, the second TestDispatchFiresAWorkerAtARedWorkPullRequest, both red on their assertion
the check test runs over checkFake's doors, and the dispatch test over the fake hub behind the send door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the reporter writes the line field, and a case in test/level0/battery-reporter.test.js proves it, since the Go test builds the reporter row itself
- the loud run door in src/quack/checkdoors.go keeps standard output, and a case proves the Go red reaches the report through it
- the fire skips a red pull whose branch stands anywhere but done, so a worker that takes it moves it off done and no second worker follows
- dispatch.yml wakes on workflow_run of the check workflow, completed with a failure, since a check_run raised by an Actions run starts no workflow
- the read of check runs uses the token dispatch already sends with, and the says field names the right it needs

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/quack/battery.go src/quack/battery_test.go src/quack/check.go src/quack/check_test.go src/quack/checkdoors.go src/quack/checkdoors_test.go src/scripts/battery-reporter.js test/level0/battery-reporter.test.js src/branches/dispatch.go src/branches/dispatch_fire.go src/branches/dispatch_fire_test.go .github/workflows/dispatch.yml .claude/skills/work/SKILL.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, plus one line in src/branches/dispatch.go recording the branches at done, which the fire guard reads
- the check runs over checkFake doors, the dispatch over the fake hub behind the send door, and the loud run door over a helper process
- the workflow and the skill point at this ticket
- the red row format stands once, in saysParts

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go src/branches/dispatch_fire_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A red check now ends on its red cases, each as file, line, name and what it said, for a runner case and a Go test alike. The reporter writes the line, and the loud Go run keeps its output so the check reads the FAIL lines. The dispatch reads the open pull requests and their check runs, and fires one worker at each red work pull request whose branch stands at done, within the fire cap. dispatch.yml wakes when the check workflow fails on a work branch, so the fire comes at once. The read of check runs rides PULL_TOKEN, which needs read access to checks and pull requests. A worker that switches onto a done branch leaves it at done, so an hourly run can fire twice during a long fix, and a note carries that to the retro.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, plus one line in src/branches/dispatch.go the fire guard reads
- every door the change reaches runs over its fake: checkFake, the fake hub, and a helper process for the loud run
- the workflow and the skill point at this ticket
- the red row format stands once, in saysParts

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
