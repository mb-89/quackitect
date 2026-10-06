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
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 9bbdb2aba8d27d4fdada8f15a31d37fdf3c14e96
    hash_after: 9bbdb2aba8d27d4fdada8f15a31d37fdf3c14e96
    inputs:
      - name: ask
        hash: 3828144eeccd2c6f
        size: 475
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: f49e41063e47113ddb2f9c8208fe3887323635ba
    hash_after: f49e41063e47113ddb2f9c8208fe3887323635ba
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 23739db1144f9d48
        size: 2896
    def: 08e16d07b0de477c
  - step: gate
    hand: box 3341fdcd540f · claude-code-remote · helper-4
    hash_before: 6fdf86d60d056a43c143c1a1933f10d35ed3c775
    hash_after: 6fdf86d60d056a43c143c1a1933f10d35ed3c775
    inputs:
      - name: design/draft
        hash: 23739db1144f9d48
        size: 2896
      - name: design/tests-red
        hash: c21254153cb4aa35
        size: 872
    def: dc4904ab364efa10
---

# Ask

A hold reads whether its box still lives, so a dead box frees its branch at once and a live box keeps it.

A dead box blocks a takeover for up to an hour, and a live box loses its branch to a second box nobody needs.

- `go test ./src/branches/` passes a case where a hold whose session ended moves under `branch take --over` at once.
- `go test ./src/branches/` passes a case where `branch list` names an old hold live while its box still beats.
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

A box beats on its group: a parentless commit over the empty tree, pushed by force to refs/beats/<group> on origin. Its committer date comes off the clock door, d.Now, and its subject names the hand and live or ended. A new verb, branch beat [--end], in src/branches/beat.go writes it. A beat younger than half of work.beatAfter, read off .se/.runtime/beat.json, writes nothing, so a beat per event costs one push per span. The take writes the first beat. A Stop command hook and a SessionEnd command hook in .claude/settings.json run ./RUNME.sh branch beat and ./RUNME.sh branch beat --end, so each turn end beats and a session end ends the hold at once. The fetch takes +refs/beats/*:refs/beats/*. The hold then reads three ways in d.holdOf(one, now), which staleClaim folds in. An ended beat newer than the tip reads dead at once. A live beat younger than work.beatAfter reads live, whatever the tip age says. Otherwise the tip age against work.staleAfter decides, as today. branch list writes live beside the age of a hold that beats, and leaves it out of Yours. branch take --over [name] takes a held branch whose hold reads dead, ahead of a branch at todo. It refuses a live hold, naming its last beat, and claimGroup writes the takeover record as a stale take does today. A container reclaimed with no SessionEnd stops beating, and its hold reads dead once work.beatAfter passes, which stands shorter than staleAfter.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/free.go Doors.freeIn, through staleClaim
- src/branches/free.go Doors.stuckIn, through staleClaim
- src/branches/held.go Doors.pastHold, through staleClaim
- src/branches/list.go Doors.rowOf and list, through staleClaim
- src/branches/take.go take, through readFree and the new --over
- src/branches/doors.go Doors.fetch, every verb that fetches
- src/branches/branch.go the verb table, for beat

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/beat_test.go TestAnEndedHoldMovesUnderTakeOverAtOnce
- src/branches/beat_test.go TestTakeOverRefusesAHoldThatStillBeats
- src/branches/beat_test.go TestListNamesAnOldHoldLiveWhileItsBoxBeats
- src/branches/beat_test.go TestABeatInsideHalfTheSpanWritesNothing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/beat.go
- src/branches/beat_test.go
- src/branches/free.go
- src/branches/take.go
- src/branches/list.go
- src/branches/doors.go
- src/branches/branch.go
- .claude/settings.json
- spec/config/level0.json, for work.beatAfter
- spec/design_output/work.md, a section A hold beats

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened free.go, held.go, hand.go, take.go, list.go, doors.go, branch.go and .claude/settings.json, and checked there that staleClaim decides every hold read and that take ignores its argv today
- the callers list names every caller of staleClaim, readFree and fetch, and the verb table
- the take case decides the first done_when line, the list case the second, and the check on the commit the third

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/beat_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/beat_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The take reads --over as the group name, and finds no work/--over. A take without the flag goes over a stale tip whose box still beats, since nothing reads the beat. The list files the beating hold under Yours, held 3h. The beat verb stands unknown, so branch prints its usage and refuses. It surprised me that the take has no flag at all yet. Its argv reaches it unread, and the name it takes is the word after the verb.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a failing test: the ended hold under take --over, and the old beating hold in the list; the beat verb and the refusal of a beating hold back them
- the tests reach git and the clock through the doors the tree fixture hands in: a real bare origin, which the branch tests use throughout, and d.Now

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- beats-pass-the-push-gate: src/scripts/prepush.js refuses an agent push of refs/beats/<group>, since no green stamp reaches a parentless commit, and its staleBy reads tip age alone, so the door refuses the take --over claim on an ended hold whose tip stands fresh. The size leaves prepush.js and its test out, and the Go tests reach no hook, so they pass while a real box fails. Skip refs/beats/* in the stamp loop, and read the beat in staleBy.
- ended-beat-ties-the-tip: the approach reads an ended beat dead where it stands newer than the tip, and dates carry seconds alone. TestAnEndedHoldMovesUnderTakeOverAtOnce stamps the beat in the same second as the tip, so a strict compare flakes. Read an ended beat dead at or after the tip.
- beat-hook-stays-quiet: the Stop hook runs on every turn end, on a desk and on main too. branch beat answers 0 and writes nothing off a work branch this box holds, and answers 0 on a refused push, since a Stop hook exit of 2 blocks the turn end. Add a test deciding both.
- beat-after-joins-schema: work.beatAfter takes a row in spec/config/level0.schema.json beside staleAfter, which the size leaves out. The approach also reads the span off .se/.runtime/beat.json, which clashes with the config key. Read the span off work.beatAfter, and keep the last beat off origin's ref or name the runtime file as a cache alone.

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
