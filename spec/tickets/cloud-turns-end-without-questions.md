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
group: boxes-hold-and-hand-back
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 568546eb4e62e78e5c8b425214588d1f44bada68
    hash_after: 568546eb4e62e78e5c8b425214588d1f44bada68
    inputs:
      - name: ask
        hash: fdf45284927fd4e5
        size: 500
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: e62846d07a424c74f2da8386a5412543af08120d
    hash_after: e62846d07a424c74f2da8386a5412543af08120d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks/stop fails
    inputs:
      - name: design/draft
        hash: 1bda716d7939779c
        size: 2025
    def: 08e16d07b0de477c
---

# Ask

A cloud box that would end its turn on a question decides instead, so its group keeps moving with no person polling it.

A box asks a person nobody is, stands idle, and waits for a takeover that costs half an hour or more.

- `go test ./src/modules/hooks/stop/` passes a case where a cloud turn ending on a question meets a refusal that says decide.
- `go test ./src/modules/hooks/stop/` passes a case where a desk turn ending on the same question stops as it does today.
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

A new mechanical check, ends-on-a-question, answers true where the box is a cloud box and the last prose paragraph of the answer ends on a question mark. EndsOnQuestion in src/modules/hooks/stop/vote.go reads the paragraphs the way NamesNext does: it skips a table, a heading, the stop line and the holds line, strips a trailing emphasis, code or bracket mark, and reads the last character. A new continue rule, a-cloud-box-decides, at priority 83 in spec/config/stop/level0.yml, runs the check. Its says tells the box to decide the question itself, say what it weighs, and carry on. Priority 83 stands below the owner holds at 85 and 84, so an owner hold still ends the turn, and above the-work-stands-complete at 45, which yields to it anyway. The check reads the answer text, so it joins ReadsText, and the stop call, which carries no text, skips it at claim time. On a desk the check answers false, so the vote stands as it does today. The design note spec/design_output/stop.md takes a row in the mechanical checks table and a section, A cloud box decides.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/stops.go Stops.stops, through stop.Decide and stop.Ran
- src/modules/hooks/stops.go Stops.claims, through stop.ReadsText

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/stop/stop_test.go TestACloudTurnEndingOnAQuestionHearsDecide
- src/modules/hooks/stop/stop_test.go TestADeskTurnEndingOnAQuestionStopsAsToday
- src/modules/hooks/stop/stop_test.go TestEndsOnQuestionReadsTheLastProse

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/stop/checks.go
- src/modules/hooks/stop/vote.go
- src/modules/hooks/stop/stop_test.go
- spec/config/stop/level0.yml
- spec/design_output/stop.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened checks.go, vote.go, rules.go, stops.go and level0.yml, and checked the priorities and the ReadsText skip there
- the callers are Stops.stops and Stops.claims, the only callers of Decide, Ran and ReadsText outside tests
- each done_when line meets a named test: the cloud case, the desk case, and the check for the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/stop/stop_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/stop/stop_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cloud case ends today: the claim the-work-stands-complete stands on an empty plan and no continue fires, so the box stops on its question. The check ends-on-a-question stands unknown, so every case of it reads false and it stands outside ReadsText. The desk case passes already, which is what it pins: the desk keeps today's stop.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a test: the cloud case fails on its assertion, the desk case pins today, and the check runs green on the commit
- the tests reach no door, since the stop package reads facts and rules alone

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
