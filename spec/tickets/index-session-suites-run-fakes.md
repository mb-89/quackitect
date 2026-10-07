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
group: tests-meet-the-doors-once
depends_on: ["each-door-meets-one-test"]
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 5a96fd03098fe0a0d4d3906c834971c9f3c13a3d
    hash_after: 5a96fd03098fe0a0d4d3906c834971c9f3c13a3d
    inputs:
      - name: ask
        hash: d7ed6f3f3b972aaa
        size: 523
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 85e31731a5c2e341cac460c3f8048014c29ab888
    hash_after: 85e31731a5c2e341cac460c3f8048014c29ab888
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 2c579a37ad74ef60
        size: 1851
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-4
    hash_before: 1fc5e6091d6f391f37ee9778081cc7391adab461
    hash_after: 90770c50e08005f967e3480abeb23f58aa7f3212
    inputs:
      - name: design/draft
        hash: 2c579a37ad74ef60
        size: 1851
      - name: design/tests-red
        hash: 7aa476c87847d0d7
        size: 750
    def: dc4904ab364efa10
  - step: implement/change
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 582932b5539db474c761b90602f0dff3e37237a0
    hash_after: 582932b5539db474c761b90602f0dff3e37237a0
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 10f921d0d674ecbc80c306df7527a5a38e987acd
    hash_after: 10f921d0d674ecbc80c306df7527a5a38e987acd
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "  103.8  in all"
    inputs:
      - name: design/tests-red
        hash: 7aa476c87847d0d7
        size: 750
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

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The index and session doors hold their fakes to the real thing, so a case on either fake proves what the real door does.

<!-- breaks, as text: what breaks if it is never done -->
The index and session contract suites drive the real door alone, so their fakes drift from the real thing with no case to catch it.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/index.test.js` and `test/contract/session.test.js` run each case against the fake and the real door
- the contract suites row of the family table in `spec/design_output/doors.md` names them as running both
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

Each suite runs its shared cases over a table of doors, the real one and the fake, as test/contract/clock.test.js does.

1. test/contract/session.test.js runs its two cases over the real session door and fakeSession. The real door reads its records off the disk, so each call opens a new door. The fake holds them in memory, so the cases open one fake and hand it back on each call.
2. test/contract/index.test.js adds one case run both ways: a work tree holding one note, asked for hashes of that note with a head size and of a path standing nowhere. The real index answers off its database, and fakeIndex off the disk, and both answer hash, size and head for the note and nothing for the missing path. The real half runs where the binary is built, as the other real cases do.
3. The contract suites row of the family table names both suites as running both doors.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- test/contract/session.test.js, its two cases
- test/contract/index.test.js, one new case
- spec/design_output/doors.md, the contract suites row

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/session.test.js records survive process adapters and isolate session IDs, over both doors
- test/contract/session.test.js a crash retains the saved handover and releases the lock, over both doors
- test/contract/index.test.js the fake and the real index answer the same hashes

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- test/contract/session.test.js
- test/contract/index.test.js
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- src/doors/session.js, src/doors/fake/session.js, src/doors/fake/index.js, src/index/answers.go and Hashes in src/index/files.go stand opened, and both indexes answer hash, size and head per path, skipping a missing one
- the callers are the two suites and the table row
- the first done_when line meets the three cases, the second the row, the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/session.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/session.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The shared cases pass both ways at once: the fakes already behave on what the old cases asked. So a third session case holds both doors to refusing a missing path and a missing session ID, and the fake fails it on its own assertion: its path answers the root for an empty name, where the real door refuses. That drift is what running both ways exists to catch. The hashes case passes over both indexes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done_when line meets the session cases over both doors and the hashes case, the second the row, the third the check
- the cases reach the real door as the one door test of each, and the fake beside it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the index suite runs both doors on the hashes case alone, since fakeIndex answers hashes and null to glob, tickets and changes, and the one other user of the fake, test/level0/pull-stale.test.js, asks hashes alone; implement words the family row and the suite's head comment as the fake running beside the real door on every answer the fake gives
- the red session case fails on fakeSession's path, which answers the root for an empty name where src/doors/session.js refuses with Missing file path; implement makes the fake refuse an empty or non-string name, and the other session cases pass both ways
- both suites failed biome format under spec/config/biome.json, so this gate formats them in its own commit, and the check answers green on it

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/doors/fake/session.js, the index suite's head comment and the doors chapter row, each named by the gate
- the doors the suites reach are the index and the session, and each fake now runs beside its real door
- the index suite's head comment names the approach: the fake runs beside the real door on every answer the fake gives
- the refusal text stands in the real door and its fake alike, and the contract case holds the two to it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/session.test.js test/contract/index.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The index and session contract suites run each case on the fake beside the real door, wherever the fake gives that answer, so a case on either fake proves what the real door does. The first run caught real drift: the session fake answered the root for an empty name, where the real door refuses with Missing file path. The fake now refuses the same way. The index fake answers hashes alone, so the index suite runs both doors on the hashes case, and its head comment and the doors chapter row say so.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the session fake, the index suite's head comment and the doors chapter row
- each door the suites reach has its fake running beside it
- the index suite's head comment names the approach
- the refusal text stands in the real door and its fake alike, held together by the contract case

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
