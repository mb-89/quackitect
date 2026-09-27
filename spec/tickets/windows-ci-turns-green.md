---
kind: [[ticket]]
state: open
step: implement/change
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
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: On a Windows desk, run ./RUNME.sh branch test test/contract/index.test.js on work/the-foundation-closes-its-gaps. Does the case a stopped index leaves no se-index process past the case pass there? The Windows job of check.yml passes on main at run 36322578200, and the case passes on Linux.
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["passes", "fails"]
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
record:
  - step: design/draft
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 2fa661bb371637d0ef61a638a05371c0a575d832
    hash_after: 2fa661bb371637d0ef61a638a05371c0a575d832
    inputs:
      - name: ask
        hash: 99b403a86cb2dc33
        size: 536
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 679a566c766fd01511c2bfd072683a330fc584f5
    hash_after: 679a566c766fd01511c2bfd072683a330fc584f5
    returns: 1
    why: "The fault stands on Windows alone, and no Linux box turns it red: the Windows job passes on main at run 36322578200, and the new leak case passes here."
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
  - step: design/person-1
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 8408a922065a92982ea01eaa7671f08e158b7fb5
    hash_after: 8408a922065a92982ea01eaa7671f08e158b7fb5
    def: 99d61fd78ece9ad4
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 72b7150569fabe24058e6527e1a54359a9d7662a
    hash_after: 72b7150569fabe24058e6527e1a54359a9d7662a
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 41f1af84a07bf38f
        size: 1533
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7dfbbf7a2d0 · claude-code-remote
    hash_before: c0b36d7336a75a2a31535011530d16e51d25b57c
    hash_after: c0b36d7336a75a2a31535011530d16e51d25b57c
    inputs:
      - name: design/draft
        hash: 41f1af84a07bf38f
        size: 1533
      - name: design/tests-red
        hash: 84472a113fb13fb0
        size: 805
    def: dc4904ab364efa10
group: the-foundation-closes-its-gaps
---

# Ask

The Windows job of the check workflow passes, and a test run leaves no `se-index` process behind. It fails today at `test/level0/work-merge-cloud.test.js`, and before that at `test/level0/level1.test.js`.

A red job trains every reader to skip it, so a Windows fault lands unseen. A leaked index holds its port and its database into the next run.

- the Windows job of `.github/workflows/check.yml` passes on the branch
- a case starts the index in a test and reads no `se-index` process past the test's end
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

The Windows job of check.yml passes on main at run 36322578200, so the first done_when line holds once the branch takes main in. The work left is the leak. A contract case in test/contract/index.test.js starts the index on a temporary work tree, reads the pid off the standing file under .se/.runtime/index.json, asks stop, and polls until process.kill(pid, 0) throws, or fails past a few seconds naming the pid. Where the case goes red, the stop call in src/index/door.go closes the listeners and exits the process, and the index door gains nothing. Weighed: a case per start over one sweep of the box after the battery, since a sweep reads the box index too, and that one stays warm by design. Assumed: every case that starts the index on a temporary tree asks stop in a finally, as the two standing cases do.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

test/contract/index.test.js: the tickets and changes cases, which start the index on a temporary tree and ask stop,src/index/door.go: the stop call

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/contract/index.test.js: a stopped index leaves no se-index process past the case

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

test/contract/index.test.js,src/index/door.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened check.yml runs on main, the index door, the contract cases, and the Standing struct and stop call in door.go, and checked each claim there
the callers come off a grep for index( and stop over test and src/index
the first done_when line meets the Windows job of check.yml, the second meets the new contract case, and the check decides the third

## person-1

<!-- On a Windows desk, run ./RUNME.sh branch test test/contract/index.test.js on work/the-foundation-closes-its-gaps. Does the case a stopped index leaves no se-index process past the case pass there? The Windows job of check.yml passes on main at run 36322578200, and the case passes on Linux. -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is choice -->

passes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/index.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/contract/index.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The Windows job of run 36322960902 passes every JS case, the new leak case among them, and its cleanup kills an orphan se-index at pid 7408. The first contract case warms the index on the real tree and asks no stop, so the new source case, every case starting the index asks it to stop, names it and fails on its assertion. The surprise: the leak comes from a case, and the index stop itself holds on both systems.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the leak line meets the source case, red on its assertion, and the Windows job line meets check.yml, whose JS battery passes on Windows
the cases start the real index on temporary trees, which the contract folder allows, and the source case reads the file alone

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the leak case and the source case stand in test/contract/index.test.js, the source case fails on its assertion, the Windows job line meets check.yml, and the check decides the last line

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
