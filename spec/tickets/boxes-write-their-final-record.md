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
group: the-fleet-watches-itself
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 238560a34a48 · claude-code-remote
    hash_before: fe033274c17d7b49b264283634b44016f893accf
    hash_after: fe033274c17d7b49b264283634b44016f893accf
    inputs:
      - name: ask
        hash: 37c72798334cdf21
        size: 480
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 238560a34a48 · claude-code-remote
    hash_before: c82ba6a7785f60562637604292adecf41d6bea19
    hash_after: c82ba6a7785f60562637604292adecf41d6bea19
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: cbd2dd886d303b08
        size: 3072
    def: 08e16d07b0de477c
---

# Ask

Every box, dispatch boxes among them, leaves its model, cost and final line where the coordinator and the retro read them.

Boxes the dispatch fires miss the session list, so a stall or a cost stands unread until a hand digs for it.

- `go test ./src/branches/` passes a case where a box's hand-back writes its cost and its final line to the record.
- `go test ./src/branches/` passes a case where the fleet listing holds the boxes the dispatch fires.
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

The group ticket's record carries every box, since each box takes its branch through `branch take` whoever fires it. The final record rides on the box's own hold entry, and the fleet reads the record, not the session list.

- The take writes `session` on the claim entry, off `CLAUDE_CODE_REMOTE_SESSION_ID`, where the box carries one. `claimGroup` in `src/branches/take.go` adds the row.
- `branch done` and `branch release` read `--model`, `--cost` and `--final`. They write each given one as `model`, `cost` and `final` on the entry they close.
- `front.AfterWith(text, hash, more)` in `src/front/front.go` closes the open take with `hash_after` and the rows past it. `After` calls it with none, so its callers stand unchanged.
- The ticket schema's record entry admits `session`, `model`, `cost` and `final`.
- `fleetRows(stood, standing)` in the new `src/branches/fleet.go` stands pure. It answers one row a work branch, with the last hand its record names and that entry's session, model, cost and final line. The fleet verb ticket prints these rows.
- The work skill's done line and the prompt's rules name the three flags, so every box writes them.

Weighed: the hold entry over a new entry, because `retroOpen` reads the last entry a step names, and a second entry on the retro step reads as unwritten. Assumed: a box knows its model and cost only by its own report, so each flag stays optional and the record writes what the box gives.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/done.go: leaves, which closes the take with the final rows
- src/branches/done.go: finish, which hands the flags to leaves
- src/branches/done.go: release, through letGo, which closes the take with the final rows
- src/branches/take.go: claimGroup, which writes the session
- src/front/front.go: After, which now calls AfterWith
- src/branches/group.go: withHashAfter and withEveryTakeClosed, which reach After unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/record_test.go: TestDoneWritesTheModelCostAndFinalLineToTheRecord
- src/branches/record_test.go: TestReleaseWritesTheFinalLineToTheRecord
- src/branches/record_test.go: TestTakeWritesTheSessionOnTheClaim
- src/branches/fleet_test.go: TestFleetHoldsTheBoxesTheDispatchFires
- src/front/front_test.go: TestAfterWithClosesTheTakeWithTheRowsPastIt

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/done.go
- src/branches/take.go
- src/branches/fleet.go
- src/branches/record_test.go
- src/branches/fleet_test.go
- src/front/front.go
- src/front/front_test.go
- spec/schemas/ticket.schema.yaml
- .claude/skills/work/SKILL.md
- src/branches/prompt.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened `done.go` (finish, leaves, release), `take.go` (claimGroup), `group.go` (heldIn, withHashAfter, entriesOf), `front.go` (After, Entry) and the record schema, and checked each claim there.
- Callers: every caller of After, leaves, letGo and claimGroup stands in the list.
- The first done_when line meets TestDoneWritesTheModelCostAndFinalLineToTheRecord, the second meets TestFleetHoldsTheBoxesTheDispatchFires, and the check line meets the command at tests-green.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/record_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/record_test.go
- src/branches/fleet_test.go
- src/front/front_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The take writes no session, done writes no model, and the fleet rows stand empty. Release reads `--final` as the branch name and answers `work/--final carries no group`. So the branch verb's name word must skip a flag, and the change takes that in. `AfterWith` and `fleetRows` stand as stubs, so the package builds and the cases reach their assertions.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The first done_when line meets TestDoneWritesTheModelCostAndFinalLineToTheRecord and TestReleaseWritesTheFinalLineToTheRecord. The second meets TestFleetHoldsTheBoxesTheDispatchFires, and the check line meets the command at tests-green.
- The record cases reach git and the disk over a temp clone and a bare origin, as the package's other cases do. The fleet case and the front case stand pure.

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
