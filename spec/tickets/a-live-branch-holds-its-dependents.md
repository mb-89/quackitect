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
group: doors-declare-what-they-own
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: d7cc0fdfde7d1c93583f93d34f18c0ff459c6f1d
    hash_after: d7cc0fdfde7d1c93583f93d34f18c0ff459c6f1d
    inputs:
      - name: ask
        hash: ba3dbab3893b01c8
        size: 706
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: d7aca686818382d9ce6a6c361b020b685e7d525c
    hash_after: d7aca686818382d9ce6a6c361b020b685e7d525c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 09c93060e1e21929
        size: 1706
    def: 08e16d07b0de477c
  - step: gate
    hand: box add8d8d0dd3d · claude-code-remote · helper-4
    hash_before: 236f41a1ee7ca1ac2337cafc0e6d0bb66534512f
    hash_after: 236f41a1ee7ca1ac2337cafc0e6d0bb66534512f
    inputs:
      - name: design/draft
        hash: 09c93060e1e21929
        size: 1706
      - name: design/tests-red
        hash: 89a9877eb7823356
        size: 785
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

A ticket naming a group that stands open on its own work branch waits for that merge. So the pull hands out the work that stands ready, and one group at a time moves a file.

The pull hands `go-tests-meet-the-doors` at once, because `closedHere` in `src/pull/pull_hand.go` reads a dependency absent from `main` as met. Its sibling gates wait behind it, and its second part moves tests another group moves too.

- `go test ./src/pull` passes a case where a dependency absent here and on `main`, with `origin/work/<dep>` standing, reads as unmet
- `./RUNME.sh ticket pull` hands no leaf of `go-tests-meet-the-doors` while `origin/work/tests-meet-the-doors-once` stands
- `./RUNME.sh check` passes

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

closedHere answers false where a dependency stands neither here nor on main while origin/work/<dep> stands as a branch: a group still at work owns that name, and its merge brings the ticket to main. A dependency standing nowhere at all still reads as met, so a ticket naming a gone ticket waits on nothing. The pull in src/pull/pull_hand.go and its twin in src/branches/route.go both take the rule, each asking git for refs/remotes/origin/work/<dep> through the git door it holds. The second done_when line names go-tests-meet-the-doors, which closed became test-walks-move-onto-fakes, so the successor carries the check: the pull hands no leaf of it while origin/work/tests-meet-the-doors-once stands.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/pull/pull_hand.go It.takeable: reads closedHere per dependency
src/pull/pull_hand.go It.offer: names the open dependencies as the wait
src/branches/take.go Doors.waitsAt: names what a child waits for
src/branches/route.go: the route walk reads closedHere per dependency

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/pull/pull_test.go TestPull: a dependency on a live work branch waits
src/branches/take_test.go TestADependencyOnALiveBranchWaits

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/pull/pull_hand.go
src/pull/pull_test.go
src/branches/route.go
src/branches/take_test.go
spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened closedHere in both packages, the four callers, cloudPull in src/pull/pull_test.go and the branch fixtures in src/branches/free_test.go, and each claim stands there
the callers list names every reader of closedHere the search finds
the first done_when line falls to the pull case, the second to ./RUNME.sh ticket pull over test-walks-move-onto-fakes, the third to ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/pull src/branches

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/pull/pull_test.go
src/branches/take_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion. The pull answers wait with no reason for alpha, since closedHere reads the absent dependency other as met and hands alpha out. The branch case reads work/other as closed. The case for a dependency standing nowhere passes today, and pins that the change keeps it met.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets the pull case, the second is a checkpoint the hand answers with ./RUNME.sh ticket pull over test-walks-move-onto-fakes, the third falls to ./RUNME.sh check
both cases drive a real git repository in a temporary folder, as every case beside them in src/pull and src/branches does, and git keeps its contract there

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

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
