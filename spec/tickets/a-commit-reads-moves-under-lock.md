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
group: the-tui-keeps-its-place
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b0a22705166b · claude-code-remote
    hash_before: f321c8bf47da33cc52a3f49148d822bda1278e4e
    hash_after: f321c8bf47da33cc52a3f49148d822bda1278e4e
    inputs:
      - name: ask
        hash: 74ce9d77bb2ed949
        size: 568
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b0a22705166b · claude-code-remote
    hash_before: 4a49664eadaecabf3596748a54c80c1182bcea0d
    hash_after: 4a49664eadaecabf3596748a54c80c1182bcea0d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: a4e3f6e6ac30b957
        size: 1074
    def: 08e16d07b0de477c
  - step: gate
    hand: box b0a22705166b · claude-code-remote · helper-4
    hash_before: df0bbcd65bc939a65684c4f2ad5751463b64a204
    hash_after: df0bbcd65bc939a65684c4f2ad5751463b64a204
    inputs:
      - name: design/draft
        hash: a4e3f6e6ac30b957
        size: 1074
      - name: design/tests-red
        hash: 1df1c2ab9a2c23a3
        size: 476
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a commit decides which names move against the value it replaces, under the store's lock, so two commits to one name never skip the wave that settles its readers.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Commit` in `src/q/store.go` compares against a snapshot taken before the lock. A commit landing between that snapshot and the write can restore the old value and start no wave, and the readers keep the value derived off the middle one.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/q/ -run TestACommitMovesAgainstTheValueItReplaces` passes
- `./RUNME.sh check` answers 0 on this box

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
from: none

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

`commit()` in `src/q/store.go` builds a snapshot of the cells it replaces while it holds `s.mu`, runs `movedIn` over it, and returns the moved names beside the heard hands. `Commit` drops its own `Snapshot()` taken before the lock and hands the returned names to the move hands. `settle` takes the new return and ignores it, as it ignores the revision. The race needs a goroutine landing inside the gap no hook reaches, so the red case pins the contract that closes the gap: `commit` names what it moves against the value it replaces, and an equal value moves nothing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/q/store.go Commit
- src/q/store.go settle

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/q/store_test.go TestACommitMovesAgainstTheValueItReplaces

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/q/store.go
- src/q/store_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened Commit, commit, movedIn, settle and Snapshot.Read in src/q/store.go, and Read takes no lock
- a grep finds commit called from Commit and settle alone
- the done_when line names TestACommitMovesAgainstTheValueItReplaces
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/q/store_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestACommitMovesAgainstTheValueItReplaces fails on its assertion: the stubbed commit names no move for A over B. It pins the contract that closes the gap, and it replays no race, since no hook runs between the snapshot and the lock.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the done_when test fails on its own assertion, and the check line waits on tests-green
- the case reaches no door, since the store lives in memory

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
