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
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: a34e43973d3753d844a3970a3ecf044fb92faf28
    hash_after: a34e43973d3753d844a3970a3ecf044fb92faf28
    inputs:
      - name: ask
        hash: c829c29f5c3d9736
        size: 460
    def: 7883b3d10633c780
---

# Ask

Work a box commits survives its container, because a red commit still reaches origin on a rescue branch.

A hand archives or replaces a box while its commits stand on its disk alone, and that work dies with it.

- `go test ./src/quack/` passes a case where a red cloud commit still lands on a rescue branch on origin.
- `go test ./src/branches/` passes a case where `branch take --over` takes in the rescue branch the old box left.
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

In src/quack/commit.go landingDoors.lands, a red check on a cloud box standing on work/<group> pushes HEAD by force to rescue/<group> on origin. Force fits, since the rescue branch belongs to the box writing it. The verb still answers red. It says the commit stands on origin under rescue/<group> and nowhere on the work branch, so CI and the PR never read a red commit. A desk, and a branch off work/, write no rescue. A green push on work/<group> deletes rescue/<group> on origin where HEAD carries it. In src/branches, the take over a held branch, through claimGroup after the takeover record and its push, reads origin/rescue/<group>. Where the work branch lacks it, the take merges it in with git merge --no-edit, pushes the work branch, and deletes rescue/<group> on origin. A merge that conflicts aborts, leaves the rescue branch standing, and says so with the command to take it in by hand. The fetch with --prune already brings rescue/* in, as a branch under refs/heads.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/commit.go commitVerb, through landingDoors.lands
- src/branches/take.go take, through Doors.claimGroup
- src/branches/take.go Doors.claimGroup, the takeover road a stale or ended hold takes

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/commit_test.go TestCommitVerbRescue: a red cloud commit on a work branch lands on rescue/<group> on origin, and the work branch on origin moves nowhere
- src/quack/commit_test.go TestCommitVerbRescue: a red desk commit writes no rescue branch
- src/branches/rescue_test.go TestTakeOverTakesInTheRescueBranch
- src/branches/rescue_test.go TestTakeOverLeavesAConflictingRescueStanding

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/commit.go
- src/quack/commit_test.go
- src/branches/take.go
- src/branches/rescue.go
- src/branches/rescue_test.go
- spec/design_output/work.md, a section A red commit reaches a rescue branch

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened src/quack/commit.go lands and its tests, and take.go take and claimGroup, and checked there that the red check returns before any push and that the takeover runs through claimGroup
- the callers are commitVerb for lands, and take for claimGroup
- the quack case decides the first done_when line, the branches case the second, and the check on the commit the third

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
