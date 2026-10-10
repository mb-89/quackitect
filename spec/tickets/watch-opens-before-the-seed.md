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
group: edits-and-files-hold
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a5167492d95e · claude-code-remote
    hash_before: bb8cd9fdcd266830de2b1c8b20c8482c710add59
    hash_after: bb8cd9fdcd266830de2b1c8b20c8482c710add59
    inputs:
      - name: ask
        hash: d73aa2d684b2b6ee
        size: 398
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: ab510859e3605c3f265644bb311bdf1afc125249
    hash_after: ab510859e3605c3f265644bb311bdf1afc125249
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/files fails
    inputs:
      - name: design/draft
        hash: 88a105fe68bca8a1
        size: 2010
    def: 08e16d07b0de477c
---

# Ask

A change landing while the seed walks the tree reaches the files family, and it wins over the walk's older read.

The watch opens only after the walk and its commits, so a file deleted in that gap stays as a ghost and a file edited there stays stale.

- `./RUNME.sh branch test src/modules/files` passes a case where a change heard during the seed commits after the seed and stands last

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

seedsIn opens the watch first, through from.Changes, with a hand that holds each change in a list under a mutex while the seed runs. The walk and its commits then run as seed-survives-bad-files leaves them. Once the seed's last commit lands, seedsIn drains the held list in the order the watch heard it, committing each change through the same value Start builds, and flips the hand to commit live. The drain takes the list under the lock and commits outside it, looping until the list stands empty, and sets live inside the lock on that empty read, so no change slips between the drain and the flip. A seed that fails stops the watch before it returns its error. Start and the drain share one helper turning a heard change into its commit, so the value a change takes stands in one place. The Seeds comment drops the line where a change during the walk loses to the walk's older read.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/files/watch.go Seeds, through seedsIn
- src/quack/modules.go the files module wiring, through Seeds
- src/modules/files/files_test.go TestASeedPastItsCapCommitsInBatches and TestARefusedFileLeavesTheSeedAndTheWatchStanding, through seedsIn
- src/modules/files/files_test.go the Start cases, through Start, whose behaviour stays

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/files/files_test.go TestAChangeHeardDuringTheSeedLandsLast: the seed's commit pushes an edit of one seeded file and a delete of another through the FakeWatch, and after seedsIn returns the edit reads its new text and the deleted file reads empty

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/files/watch.go
- src/modules/files/files_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: seedsIn, Seeds, Start, FakeWatch.Changes and FakeWatch.Push stand as the approach reads them
- callers: Seeds has the module wiring in src/quack/modules.go as its one caller outside the tests, and seedsIn has Seeds and the two seed cases
- done_when: the ask's one line meets TestAChangeHeardDuringTheSeedLandsLast
- config: the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/files

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/files/files_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestAChangeHeardDuringTheSeedLandsLast fails on both its assertions: files/a.md reads the seed's said, and files/b.md still reads said after its delete. The FakeWatch holds no hand while the seed commits, so both pushes land nowhere. The same file already stands red for seed-survives-bad-files, and watch_folders_test.go for watch-hands-new-folders.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the ask's one line meets TestAChangeHeardDuringTheSeedLandsLast, which fails on its own assertion
- doors: the case walks a temp root through the real disk and commits to a store in memory over FakeWatch

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
