---
kind: [[ticket]]
state: open
group: the-check-runs-beside
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
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 832baf70c4ce2f160c89b17e82ec073a588df7d6
    hash_after: 832baf70c4ce2f160c89b17e82ec073a588df7d6
    inputs:
      - name: ask
        hash: dfee1caff0b0df9a
        size: 1112
      - name: [[spec/tickets/the-probe-starts-with-tests]]
        hash: 2f27903492d3e8aa
        size: 574
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box c46fdbdc0cdf · claude-code-remote
    hash_before: 0dc618a397db47b8f1b90f5a05dc78fd4a3ff6a0
    hash_after: 0dc618a397db47b8f1b90f5a05dc78fd4a3ff6a0
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: e752f098fe7ee9d0
        size: 2092
    def: 08e16d07b0de477c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Every part of the check starts at once, so the check's wall time is its slowest part. Today `partsOf` in `src/quack/check.go` runs the tests first and alone, then level zero beside a row of go, doors, projections, plugin, server and rules. A red part names itself, and every part it ran beside still reports. A part waits on another only where it reads that part's output, and the design names each such wait and why.

- gain: a check costs its slowest part, and not the tests plus the row after them
- breaks: every check pays the tests' span and then the longest of level zero and the row, and the closed ticket [[spec/tickets/the-probe-starts-with-tests]] falls short of its own criterion
- done_when: `./RUNME.sh test src/quack/check_test.go` passes a case over fake parts and the fake clock, where every part starts before any part ends and the battery's span reads as the slowest part
- done_when: `./RUNME.sh test src/quack/check_test.go` passes a case where a red part names itself and every part beside it still runs and reports its time
- done_when: `./RUNME.sh check` exits 0
- view: none
- from: none

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

`batteryRun` in `src/quack/check.go` starts every part in its own goroutine at once, times each through the clock door `now`, and waits for all of them. The run answers the first red code in part order, and it hands back the red parts by name in place of the parts left unrun. `checkVerb` prints one line a red part to the error stream, so a red part names itself under `--errors` too, and every part beside it still reports its time in the table. The `beside` field leaves `part`, since every part now runs beside every other.

No part waits on another, because no part reads another's output. The tests write `tests.jsonl` and the spawn tally, and the rules write the lint's found file. The check verb reads those after the battery ends, and push, commit and done read the stamp after the check. The dry probe clones the working change into a folder of its own. The one shared cost is the box's cores, which the five-checks run under the sibling ticket measures.

The report keeps its `unrun` field empty, because old stamps carry it and the retro reads it. Output from parts running together interleaves on a loud run, line by line, and the table at the end stands whole.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go checkVerb, the one caller of batteryRun and partsOf
- src/quack/check_test.go TestBatteryRun and TestCheckParts, which read part.beside and the unrun answer

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_test.go TestBatteryRun: every part starts before any part ends, and the span reads as the slowest part
- src/quack/check_test.go TestBatteryRun: a red part names itself, and every part beside it runs and reports its time
- src/quack/check_test.go TestCheckVerb: a red part's name reaches the error stream

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/check.go
- src/quack/check_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb opened: check.go batteryRun, partsOf, checkVerb, battery.go batteryOf, and the readers of each runtime file
- the callers list names checkVerb and the two test functions, the only callers
- every done_when line names TestBatteryRun or the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/check_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each of the three cases fails on its own assertion against the serial battery. The overlap case meets the serial run through its guard: a fake part reads the held clock when it starts, and finds fewer reads than one a part plus the battery own. The part then returns without waiting, so the serial run fails fast and hangs on no barrier. The guard asks the battery to read every part start before it runs any part, which the implement step takes. The surprise: the check fake appended to its records with no lock, so it raced once the parts run together, and it takes a lock now.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing test: the overlap case, the red-part case in TestBatteryRun, and the error-stream case in TestCheckVerb; the check line waits for tests-green
- every door the tests reach has a fake: the held clock stands for the clock door, and the check fake for the verb, process, health, git and log doors

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
