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
group: lsp-door-switches-over
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 96206126082fa520b2b19f7d5147ce2164b06422
    hash_after: 96206126082fa520b2b19f7d5147ce2164b06422
    inputs:
      - name: ask
        hash: 3c161e9d4453b9d6
        size: 523
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 6b931e1f116f43989919d823b53c8d30b6e514b1
    hash_after: 6b931e1f116f43989919d823b53c8d30b6e514b1
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: d06d089e006eda49
        size: 894
    def: 08e16d07b0de477c
  - step: gate
    hand: box d893e0ab0f106 · claude-code-remote · helper-4
    hash_before: b220716051bdf513a2481068370d945bc800af81
    hash_after: b220716051bdf513a2481068370d945bc800af81
    inputs:
      - name: design/draft
        hash: d06d089e006eda49
        size: 894
      - name: design/tests-red
        hash: 93e1f2834e269578
        size: 514
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d893e0ab0f106 · claude-code-remote
    hash_before: 51ca165540324d9b9df1abe0613dbb590e20629b
    hash_after: 51ca165540324d9b9df1abe0613dbb590e20629b
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/one-index-a-tree.md:269:58: Vocabulary: httptest stands outside the words this tree writes. Write a core wo"
    def: f150b8c0dc20fe45
---

# Ask

One index stands over a tree, so a client meeting a busy door waits on that door, and the check runs beside one index.

Each late answer spawns another `se-index serve` beside the one still sweeping. The sweeps pile up, and the check goes red on the door's thirty-second start.

- `go test ./src/index -run TestASlowDoorKeepsItsPlaceAndStartsNoOther` passes, and fails with the respawn put back
- `./RUNME.sh check` exits 0
- after `./RUNME.sh check`, `pgrep -f 'se-index serve'` names one process over the tree

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

In reaches, a post to a standing door that fails on a timeout returns that fault, and spawns nothing: a door past its answer time is busy, and its process still runs. A refused or reset connection still drops the standing file and starts a fresh index, since that door stands dead. postTimeout moves from the const block to a var, so the test sets a short one.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/main.go V1
src/index/main.go Ask
src/index/main.go asks

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/index/reach_test.go TestASlowDoorKeepsItsPlaceAndStartsNoOther

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/index/main.go
src/index/reach_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

reaches, posts, starts, stands and postTimeout stand opened in src/index/main.go and src/index/door.go
V1, Ask and asks are every caller git grep finds of reaches outside the tests
the first done_when line names the test, the second and third name the check and pgrep

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/index/reach_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/index/reach_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its own assertion: the client starts the index three times beside a busy door, one a try. That matches the pile the check leaves on this box.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the first done_when line meets the new test, and the check and the process count stand as checkpoints the hand answers at tests-green
the spawn runs through fakeSpawn and the door through an httptest server, so the test starts no real index

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- reaches-keeps-the-post-fault: In reaches the inner err shadows the post fault. The builder names it apart and tests it for a timeout.

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

the change reaches src/modules/lsp and src/index/binary.go past the ask, and the discussion of reaches-keeps-the-post-fault says why
the spawn runs through fakeSpawn and the door through a test server, and the claim reads a temp folder
each new function carries a comment pointing at the ticket whose approach it implements
the post wait stands once as postWait, and the claim path once in startingPath

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
