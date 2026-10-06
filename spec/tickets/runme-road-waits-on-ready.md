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
group: level-zero-smoke
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a694567529c5 · claude-code-remote
    hash_before: 3a96bb98609b7a6438067a336655ba3d4bb45fdc
    hash_after: 3a96bb98609b7a6438067a336655ba3d4bb45fdc
    inputs:
      - name: ask
        hash: 4db3bc82c38588d5
        size: 401
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a694567529c5 · claude-code-remote
    hash_before: 97372e9c2fdb9429fcd97c00ae3e8e9e96096885
    hash_after: 97372e9c2fdb9429fcd97c00ae3e8e9e96096885
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: b8bcc39ac74d8475
        size: 1578
    def: 08e16d07b0de477c
  - step: gate
    hand: box a694567529c5 · claude-code-remote · helper-4
    hash_before: e9878292e920630d4b8247ab7aebb224b72c4b4a
    hash_after: e9878292e920630d4b8247ab7aebb224b72c4b4a
    inputs:
      - name: design/draft
        hash: b8bcc39ac74d8475
        size: 1578
      - name: design/tests-red
        hash: 64b0da3c99b2f4a9
        size: 687
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a694567529c5 · claude-code-remote
    hash_before: d52661943b099f0cc8345636086e9ff53210a254
    hash_after: c33f4f33876b30fc6b53e8103936800e5608cf90
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box a694567529c5 · claude-code-remote
    hash_before: 2dd39abb6ea9a1d683bf009d0c6cdbe8bd937ec7
    hash_after: 2dd39abb6ea9a1d683bf009d0c6cdbe8bd937ec7
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "   89.3  in all"
    inputs:
      - name: design/tests-red
        hash: 64b0da3c99b2f4a9
        size: 687
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

The runme-road contract test waits on the index's ready event, so it passes on a slow box and fails only where the road breaks.

A timer in a test passes or fails on the box's speed, and a slow runner turns the check red on a sound tree.

- `node --test test/contract/runme-road.test.js` passes, and the file names no timer or timeout and waits on the index's ready event.
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

The index door gains ready(): it runs se-index standing with no timeout, which returns once the door over the root stands, and answers whether it stands and why not. The fake index answers ready the way it answers warm. test/contract/runme-road.test.js waits on index(...).ready() in a before hook, and runs both RUNME.sh calls with no timeout, so RUN_TIMEOUT_MS leaves the file. A hung road then hangs the case, which the test runner names, in place of a timer guessing how slow the box is.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- test/contract/runme-road.test.js both cases
- src/doors/index.js index, read by src/scripts/cli-doors.js and every caller of it.index
- src/doors/fake/index.js fakeIndex, read by every case faking the index

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/runme-road.test.js the file names no timer, and waits on the index's ready event
- test/contract/index.test.js ready answers once the door stands, and a box with no binary says why
- test/level0/fakes.test.js or the behaves check holds the fake index to the door's calls

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/doors/index.js
- src/doors/fake/index.js
- test/contract/runme-road.test.js
- test/contract/index.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- runme-road.test.js, src/doors/index.js warm and at, src/doors/fake/index.js, src/index/main.go V1 and the standing call stand opened
- grep finds the index door built in cli-doors.js and its fake in the cases faking it, and ready is new, so nothing calls it yet
- the done_when line on runme-road meets the case reading the file and the ready wait, and the check line its own command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/index.test.js
- test/contract/runme-road.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The three cases fail on their assertions once a stub ready stands on the door: the stub answers no door, and the road names its timer and no ready wait. The case over the road reads its own source, and spells the timer words in pieces, so the pattern never matches itself.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the runme-road line meets the case reading the file for the ready wait and no timer, and the check line waits for tests-green
- the ready call meets its one contract case against the real binary and the no-binary box, and the fake index gains ready beside warm in the change

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

./RUNME.sh lint src/doors test/contract/runme-road.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/doors/index.js, src/doors/fake/index.js and the road test, which the size list and the gate name
the fake index answers ready beside warm
ready, the fake and the before hook link this ticket
the road reads the binary through at() in the door, which owns it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/runme-road.test.js test/contract/index.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The index door gains ready, which runs se-index standing with no span and returns once the door over the root stands, or says why it stands not. The fake index answers ready beside warm. The runme-road contract test waits on ready in a before hook and runs RUNME.sh with no timeout, so a slow box waits and a broken road alone fails. The no-timer case matched its own pattern, so its pattern now splits the word it names, as it splits the others.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the size list names
the fake index answers ready
ready, the fake and the before hook link this ticket
the binary path stays with at() in the door

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
