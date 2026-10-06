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
group: the-fleet-watches-itself
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 064514c799d1f358cc61de98b5946a7f6fe0e74a
    hash_after: 064514c799d1f358cc61de98b5946a7f6fe0e74a
    inputs:
      - name: ask
        hash: d3b64a5b3f02c0c4
        size: 607
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 59f09e0ed28f6bec1617c45dc2a5147440591213
    hash_after: 59f09e0ed28f6bec1617c45dc2a5147440591213
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 160354a317c405d6
        size: 2623
    def: 08e16d07b0de477c
  - step: gate
    hand: box 238560a34a48 · claude-code-remote · helper-4
    hash_before: 1752207dd994322828c03fc417d9c09acfc10a79
    hash_after: 1752207dd994322828c03fc417d9c09acfc10a79
    inputs:
      - name: design/draft
        hash: 160354a317c405d6
        size: 2623
      - name: design/tests-red
        hash: 6e6c55ed28e894ff
        size: 1007
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 238560a34a48 · claude-code-remote
    hash_before: 3f2d309db007e5b083b372420a9d68525c990eaf
    hash_after: 3f2d309db007e5b083b372420a9d68525c990eaf
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/failures-and-the-sentinel.md:298:1: ListItem: A sentence in a list item holds 20 words, and this one holds "
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 238560a34a48 · claude-code-remote
    hash_before: bd6a7361982716236111bc6a6118dc39a44c2569
    hash_after: bd6a7361982716236111bc6a6118dc39a44c2569
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    1.6  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: design/tests-red
        hash: 6e6c55ed28e894ff
        size: 1007
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

One verb prints each box with its branch tip, hold age and pull request. A box that stalls wakes the coordinator at once.

The coordinator builds the fleet table by hand each cycle, and finds an idle, looping or failed box 30 to 80 minutes late.

- The stall wake stands as a sentinel watch on a failure node, once failures-and-the-sentinel lands.
- `go test ./src/branches/` passes a case where the fleet verb lists each branch with tip age, holder and pull request.
- `go test ./src/branches/` passes a case where a box that stops, fails or sits idle 30 minutes raises a wake.
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

`./RUNME.sh cloud fleet` prints one row a work branch, and a wake line for each box that stalls. It exits 1 where a wake stands, so the watch that runs it wakes the coordinator.

- `fleetRows` in `src/branches/fleet.go` gains the tip, the tip's age and the pull request. It stays pure over the stands, the clock's now and the pull request map.
- The pull requests come off one `git ls-remote origin refs/pull/*/head`. A branch whose tip a pull head names carries that number. That needs no token and no new door.
- `wakesOf(rows, idle)` stands pure and answers one wake a stalled box.
  - idle: held, and its tip stands older than the span.
  - stopped: done, with no pull request.
  - failed: free again, with a final line on its last entry, which a release short of done writes.
- The span is the config key `fleet.idleAfter`, `30m` by default, read through `spanOf` as the stale span is.
- `Cloud` in `src/branches/branch.go` runs `fleet` beside `trigger`.
- The sentinel ticket stands open. So the wake stands as the verb's lines and exit code, and a line under that ticket's Discussion names the watch it takes over.

Weighed: the pull refs over the GitHub API, since a desk and a box both hold git and neither holds a token. Assumed: a box that holds a branch pushes as it works, so the tip's age reads its idle time.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/branches/branch.go: Cloud, which gains the fleet word
- src/branches/routine.go: pullRouteOf, which reads fleetRows
- src/quack/cloud.go: cloudVerb, which hands every word to Cloud and changes nothing

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/branches/fleet_test.go: TestFleetListsEachBranchWithTipAgeHolderAndPullRequest
- src/branches/fleet_test.go: TestAnIdleBoxRaisesAWake
- src/branches/fleet_test.go: TestAStoppedBoxRaisesAWake
- src/branches/fleet_test.go: TestAFailedBoxRaisesAWake
- src/branches/fleet_test.go: TestABusyBoxRaisesNoWake
- src/branches/fleet_test.go: TestFleetExitsRedOnAWake

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/fleet.go
- src/branches/fleet_test.go
- src/branches/branch.go
- spec/tickets/failures-and-the-sentinel.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened `free.go` (tipAge, staleSpan, spanOf), `list.go` (rowOf), `read.go` (ref), `stands.go` (standings) and `branch.go` (Cloud), and checked each claim there.
- Callers: Cloud and pullRouteOf stand in the list, and `src/quack/cloud.go` reaches Cloud unchanged.
- The second done_when line meets TestFleetListsEachBranchWithTipAgeHolderAndPullRequest. The third meets the idle, stopped and failed cases, and the check line meets the command at tests-green. The sentinel line rides the Discussion of that ticket.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/fleet_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/fleet_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The idle, stopped and failed cases fail on their own assertion, since the stub wakes nothing. The two verb cases fail where the cloud verb answers its usage for the fleet word. The busy case passes against the stub, and it stands as the guard that a fresh or merged box wakes nothing. The tree cases date the tip through the committer date and read the clock the doors carry, so no case waits.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The listing line meets TestFleetListsEachBranchWithTipAgeHolderAndPullRequest. The wake line meets TestAnIdleBoxRaisesAWake, TestAStoppedBoxRaisesAWake, TestAFailedBoxRaisesAWake and TestFleetExitsRedOnAWake. The check line meets the command at tests-green, and the sentinel line is a checkpoint on that ticket's Discussion.
- The wake cases stand pure. The verb cases reach git over a temp clone and a bare origin carrying a pull ref, and the clock is the function the doors carry.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- The approach answers the ask: one verb row a work branch with tip, age, holder and pull request, and a wake with exit 1 for an idle, stopped or failed box. `go test ./src/branches/` stands red on the four wake and verb cases on their own assertion, the busy case guards the quiet path, and the check line meets the command at tests-green.
- The sentinel done_when line rides a checkpoint on the Discussion of failures-and-the-sentinel, which stands open. Weighed: the ask says once that ticket lands, so a checkpoint answers it.
- In place at implement: `fleetRows` gains the clock and the pull map, so its callers in `src/branches/routine_test.go` (two calls) and `TestFleetHoldsTheBoxesTheDispatchFires` in `src/branches/fleet_test.go` take the new arguments. The callers list misses them, and names `pullRouteOf` as a reader of `fleetRows`, where it takes `[]boxRow` alone.
- In place at implement: `refs/pull/*/head` outlives a closed pull request, so a done branch matching a closed head reads as carrying one. Checked: `git ls-remote origin refs/pull/*/head` answers through this box's proxy.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/branches/fleet.go src/branches/fleet_test.go src/branches/branch.go spec/tickets/failures-and-the-sentinel.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches fleet.go, fleet_test.go, branch.go and the sentinel ticket, all on the size list. The gate asked fleetRows to gain arguments. withTips adds the tip, age and pull request beside it instead, so no caller changes.
- The verb reaches git through the standing quiet door, and the cases drive it over a temp clone with a bare origin.
- Each new function carries a link to this ticket, where the approach stands.
- The span reads through spanOf and the age through aged, as the stale span does, so no reader stands twice.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/fleet_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A new verb, ./RUNME.sh cloud fleet, prints one row a work branch: its standing, tip, the tip's age, the hand and session its record names, and its pull request. The pull requests come off one git ls-remote of refs/pull/*/head, so no token is needed. A held box idle past fleet.idleAfter, a done box with no pull request, and a freed box with a final line each print a wake line, and the verb exits 1 where one stands. A watch that runs it wakes the coordinator at once. A pull ref outlives its pull request, so a done branch whose pull request closed unmerged reads as carrying one and raises no wake. The sentinel ticket's Discussion names the watch it takes over.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Every file touched stands on the size list. withTips takes the gate's added arguments, so fleetRows and its callers stand unchanged.
- The verb reaches git through the quiet door, and the cases drive it over a temp clone with a bare origin.
- Each new function carries a link to this ticket.
- The span reads through spanOf and the age through aged, so no reader stands twice.

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
