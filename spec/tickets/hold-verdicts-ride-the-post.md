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
group: hooks-v1-hold-the-line
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box f9a277082525 · claude-code-remote
    hash_before: 0fcdb54e1817f512dfe410f31563fb217ff1c0f5
    hash_after: 0fcdb54e1817f512dfe410f31563fb217ff1c0f5
    inputs:
      - name: ask
        hash: e4a77dd8c818699b
        size: 682
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box f9a277082525 · claude-code-remote
    hash_before: 288591b97a1af0ab7bfe88bf7778ed47efe43d36
    hash_after: 288591b97a1af0ab7bfe88bf7778ed47efe43d36
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 1026d52fe5cbe103
        size: 1528
    def: 08e16d07b0de477c
  - step: gate
    hand: box f9a277082525 · claude-code-remote · helper-4
    hash_before: c7e35ecebbaf0146ffc68b183382f71f4442c22e
    hash_after: c7e35ecebbaf0146ffc68b183382f71f4442c22e
    inputs:
      - name: design/draft
        hash: 1026d52fe5cbe103
        size: 1528
      - name: design/tests-red
        hash: e2a4e5279ba1fd3f
        size: 790
    def: dc4904ab364efa10
  - step: implement/change
    hand: box f9a277082525 · claude-code-remote
    hash_before: 4036222115838f58d1a26a69520ce2c6ee00cdf5
    hash_after: 4036222115838f58d1a26a69520ce2c6ee00cdf5
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box f9a277082525 · claude-code-remote
    hash_before: ab7a3cb34f35539c33dda6132bca71de40199fc1
    hash_after: ab7a3cb34f35539c33dda6132bca71de40199fc1
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   98.6  in all"
    inputs:
      - name: design/tests-red
        hash: e2a4e5279ba1fd3f
        size: 790
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

A hold answers the call it decides. Two posts on one session each read the verdict their own event landed, so the owner's stop hold refuses the call it refuses.

Background helpers share the main session id. A helper's post landing between a call's `writes()` and its `held()` drops the call's refusal or hands it the helper's verdict. See `src/modules/hooks/holds.go:67`, finding 1.

- `./RUNME.sh test src/modules/hooks` passes a case where a helper's post lands between a main call's write and verdict
- in that case the main call keeps the stop refusal
- `writes()` hands each reader the fold state its own event landed, read under `d.mu`
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

`writes` reads the holds fold of its session under `d.mu`, right after it lands the event, and answers it beside the error as a `landed` value: the fold state and whether it stands. `Hook` hands that value to `held` and to `drops`, which read it in place of a second snapshot and the session's current place. A helper's post landing between the main call's write and its verdict then moves the fold and the place, and the main call still answers the verdict its own event landed. The other folds `marks`, `rows`, `repeats`, `answers`, the brief and the stops read the place the same way, and stand outside this ask as a note of their own.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/modules/hooks/hooks.go` `Hook`, which calls `writes`, `drops` and `held`
- `src/modules/hooks/holds_test.go` `TestTheFieldReadersRunBeforeTheDoorsLock`, which calls `writes`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/modules/hooks/holds_test.go` `TestAHelpersPostBetweenACallsWriteAndItsVerdictLeavesTheCallsRefusal`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/hooks/hooks.go`
- `src/modules/hooks/holds.go`
- `src/modules/hooks/holds_test.go`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened: `Hook` and `writes` in `hooks.go`, `held` and `drops` in `holds.go`, each read for the place and the snapshot
- the callers list names every caller of `writes`, `held` and `drops`, off a search of the source
- each done line names `TestAHelpersPostBetweenACallsWriteAndItsVerdictLeavesTheCallsRefusal`, and the check names itself
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/holds_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The test writes the main call's Read and then a helper's Grep on session s1 under the stop hold, and asks `held` for the main call's verdict. It answers no effect at all. The helper's post moved the session's place past the main call's, so the fold's verdict is the helper's. A helper's call passes the stop hold, so the main call's refusal drops. The ask names both a lost refusal and a borrowed verdict, and this run shows the lost one.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets `TestAHelpersPostBetweenACallsWriteAndItsVerdictLeavesTheCallsRefusal`, which fails on its own assertion
- the test reaches the store and the config through the door's fakes in `holdDoor`, and no other door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- verdict-test-takes-landed-value: The red test calls `held` with its present signature. The implement step rewrites that call to hand it the `landed` value `writes` answers.
- hold-verdict-borrowed-case-tested: The red test shows the lost refusal alone. A case where the helper's call is refused and the main call passes would decide the borrowed verdict.
- hook-folds-read-landed-place: The folds `marks`, `rows`, `repeats` and `answers` still read the session's current place. The brief and the stops read it the same way, and the draft names them outside this ask.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint src/modules/hooks/hooks.go src/modules/hooks/holds.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches `hooks.go`, `holds.go` and `holds_test.go` for this ask, and the fold readers under `hook-folds-read-landed-place`
- the change reaches the store and the config through the door's fakes in `holdDoor`
- the comment over `ownLanding` names the approach: the folds its own landing left, read under the lock
- the landed value stands once, as `ownLanding`, and the fix landed in d8d441a98

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/holds_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`writes` reads the holds fold under the door's lock as it lands the event, and answers it as `ownLanding`. `held` and `drops` read that value, in place of a second snapshot and the session's current place. A helper's post between a call's write and its verdict then leaves the call's stop refusal standing. A refused post landing after a passing call hands the call none of its verdict. The red case passes, beside the borrowed case. The fix landed in d8d441a98, and the other fold readers followed in `hook-folds-read-landed-place`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the hook door's files alone: `hooks.go`, `holds.go` and their test
- the change reaches the store and the config through the door's fakes
- the comment over `ownLanding` names the approach
- the landed value stands once, as `ownLanding` in `holds.go`

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
