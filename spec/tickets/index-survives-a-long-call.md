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
group: failures-stand-registered
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: a45f4a162f7d0293e7a66db3e13dcf50012f1b65
    hash_after: a45f4a162f7d0293e7a66db3e13dcf50012f1b65
    inputs:
      - name: ask
        hash: 707753c399639aa5
        size: 709
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: b7cced14437eb849a728989a9917f95fe6a0b04a
    hash_after: b7cced14437eb849a728989a9917f95fe6a0b04a
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: abce73f782ebab81
        size: 2173
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-6
    hash_before: 5a2875c06e0b7a33305bcf15836eab613988cec7
    hash_after: 5a2875c06e0b7a33305bcf15836eab613988cec7
    inputs:
      - name: design/draft
        hash: abce73f782ebab81
        size: 2173
      - name: design/tests-red
        hash: ed08e844123f91a5
        size: 861
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: c662450b4b8c6acdd20230be9d65b91da5624cab
    hash_after: 276643172ce4141b8c88e2d96d590568949d6536
    answered:
      - name: lint
        exit: 0
        said: green
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 67b57503a183e57777b6854f2893244aced5294c
    hash_after: 8b8c4aa71d9f12b8b1dd684a3f92788073a768db
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: green
    inputs:
      - name: design/tests-red
        hash: ed08e844123f91a5
        size: 861
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

A leaf holding `./RUNME.sh check` hands back through the pull tool call, and the hand keeps the index it stands on. No hand then needs the shell workaround.

The tests-green hand-back through the tool call answers connection refused on every try. The index restarts on a new port each time. The same hand-back from the shell lands. The watchdog lease in src/modules/index/manager.go holds far shorter than the check runs, and stays the suspect.

- a test under src/modules/index runs a call outlasting the lease, and go test ./src/modules/index/... passes with the index left running
- a hand-back of a leaf holding `./RUNME.sh check` through the pull tool call lands, and ./RUNME.sh check exits 0

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

The cause is the environment, not the lease. The index starts its door with QUACKITECT_ROOT set to the real root, in spawns in src/index/door.go, and every child of the index inherits it. A pull run through the tool call runs ./RUNME.sh check as such a child. The contract case in test/contract/index.test.js then runs se-index over a temp work folder through the JS door in src/doors/index.js, which sets cwd and no env. rootHere in src/index/main.go reads QUACKITECT_ROOT before the working folder, so the case's stop reaches the real index, which restarts on a new port, and the hand-back meets connection refused. A run proves it: the contract test with the variable unset leaves the index at its port and pid, and with it set to the root moves both, and three cases fail. The fix: run in src/doors/index.js hands the binary env QUACKITECT_ROOT set to its work root, so the door names its own root and no inherited value redirects it. The done_when lines named a test under src/modules/index, since the ask suspected the lease. The approach departs there: the tests sit beside the door the fix changes.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/cli-doors.js: the index door built over roots.method and roots.work
- test/level0/search-door.test.js: doorAnswering
- test/contract/index.test.js: every case building index(files, proc(), clock(), root, work)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/search-door.test.js: the door hands the index its work root, so an inherited root names no other index
- test/contract/index.test.js: a door over one work folder leaves the index an inherited QUACKITECT_ROOT names standing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/doors/index.js
- test/level0/search-door.test.js
- test/contract/index.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened: spawns and rootHere in src/index, run in src/doors/index.js, and the fake proc's ran record
the callers list names every importer of src/doors/index.js, which a grep over src, test and .claude finds
each done_when line meets its test: the contract case decides the index left running, and the hand-back through the tool call decides the second line at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/search-door.test.js test/contract/index.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/search-door.test.js
- test/contract/index.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both fail on their own assertion. The contract case finds no standing file in its work folder, since the door's call went to the index the inherited root names. The unit case finds the door hands no QUACKITECT_ROOT. A surprise: the contract case under the old door stops the other folder's index, the very drop the tool call met, so the case stops nothing real.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets the contract case, which fails today, and the unit case beside it; the second line is a checkpoint the tests-green hand-back answers through the pull tool call
the fake proc stands for the process door in the unit case, and the contract case alone reaches the real binary

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers the ask by its cause: spawns in src/index/door.go hands every child of the index QUACKITECT_ROOT, rootHere in src/index/main.go reads it before the working folder, and run in src/doors/index.js sets cwd alone, so the fix there (env QUACKITECT_ROOT = work, which proc.js merges over process.env) names the door's own root; the departure from a test under src/modules/index stands argued in the draft
- the first done_when line meets the contract case in test/contract/index.test.js and the unit case in test/level0/search-door.test.js, both red on their own assertion; the second is a checkpoint the tests-green hand-back answers through the pull tool call
- the draft's tests list names the contract case 'leaves the index an inherited QUACKITECT_ROOT names standing', and the file carries it as 'a door over one work folder starts its own index, whatever root the environment names'; the builder aligns the name at tests-green
- the callers list names every importer of src/doors/index.js: src/scripts/cli-doors.js and the two test files

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/doors/index.js alone, which the size names; the reviewer's point on src/index/main.go stands as the note the-index-keeps-its-root
- the door reaches proc, whose fake records the env, and test/level0/search-door.test.js reads it there
- a comment over ROOT_VAR names the approach by its ticket
- the variable's name stands once in the door, as ROOT_VAR, and no JS module held it before

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/search-door.test.js test/contract/index.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The index door in src/doors/index.js hands the index binary QUACKITECT_ROOT set to its own work root. Before, a check run as a child of the index inherited the real root there, and rootHere in src/index/main.go reads that variable before the working folder. So the contract case over a temp folder stopped the real index, which came back on a new port, and the pull tool call met connection refused. This hand-back runs through the pull tool call and holds the check, so it proves the ask's second line. The contract case now carries the name the draft lists, as the gate asked.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/doors/index.js and the two test files the size names, and the reviewer's point on src/index/main.go stands as the note the-index-keeps-its-root
- the door reaches proc, and its fake records the env the unit case reads
- a comment over ROOT_VAR names the approach by its ticket
- the variable's name stands once in the door, as ROOT_VAR

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
