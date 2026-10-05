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
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box c2e39844c8bf · claude-code-remote
    hash_before: 3c05e588f08def88e3ffc388266f5845fd68c603
    hash_after: 3c05e588f08def88e3ffc388266f5845fd68c603
    inputs:
      - name: ask
        hash: ec76b8a6a166f988
        size: 630
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box c2e39844c8bf · claude-code-remote
    hash_before: cced801e38062d9087fdc7f4290e7326945cfa81
    hash_after: cced801e38062d9087fdc7f4290e7326945cfa81
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 53572332c8a87c0e
        size: 2335
      - name: [[spec/design_output/pull]]
        hash: e166577ac49d2d0c
        size: 46768
    def: 08e16d07b0de477c
  - step: gate
    hand: box c2e39844c8bf · claude-code-remote · helper-4
    hash_before: 55a5ef8dfe508afc52873df39436fe4321f7fc8e
    hash_after: 55a5ef8dfe508afc52873df39436fe4321f7fc8e
    inputs:
      - name: design/draft
        hash: 53572332c8a87c0e
        size: 2335
      - name: design/tests-red
        hash: b7595d42c22ced71
        size: 715
      - name: [[spec/design_output/pull]]
        hash: e166577ac49d2d0c
        size: 46768
    def: dc4904ab364efa10
  - step: implement/change
    hand: box c2e39844c8bf · claude-code-remote
    hash_before: 1dd245016b7f632b71bd2a7b3dc6985b5ae5842b
    hash_after: 1dd245016b7f632b71bd2a7b3dc6985b5ae5842b
    answered:
      - name: lint
        exit: 0
        said: "spec/rationales/pull.md:27:63: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    def: f150b8c0dc20fe45
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/pull]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/pull]]
  - step: design/tests-red
    skipped: true
    kept: 55a5ef8dfe508afc52873df39436fe4321f7fc8e
    why: its red tests stand as 55a5ef8df landed them, and a later leaf passed since
  - step: gate
    hand: box c2e39844c8bf · claude-code-remote · helper-9
    hash_before: 5c1db73f3cc5ca378f40cfc44ed08b265b3a5b65
    hash_after: 1b90e017199edb8c00503299238746a4828a4391
    inputs:
      - name: design/draft
        hash: 53572332c8a87c0e
        size: 2335
      - name: design/tests-red
        hash: b7595d42c22ced71
        size: 715
      - name: [[spec/design_output/pull]]
        hash: fd1fcf10ffdd07e8
        size: 47269
    def: dc4904ab364efa10
  - step: gate
    hand: the engine
    stale: [[spec/design_output/pull]]
  - step: gate
    hand: box c2e39844c8bf · claude-code-remote · helper-11
    hash_before: ff6b0a4076cf45acc1deca6c760931b541328355
    hash_after: ff6b0a4076cf45acc1deca6c760931b541328355
    inputs:
      - name: design/draft
        hash: 53572332c8a87c0e
        size: 2335
      - name: design/tests-red
        hash: b7595d42c22ced71
        size: 715
      - name: [[spec/design_output/pull]]
        hash: 6176d05ebcbd9b2a
        size: 47283
    def: dc4904ab364efa10
  - step: implement/change
    hand: box c2e39844c8bf · claude-code-remote
    hash_before: 2709ff8fc1cda6160bcac52b597c86b87de6d1e9
    hash_after: 2709ff8fc1cda6160bcac52b597c86b87de6d1e9
    answered:
      - name: lint
        exit: 0
        said: "spec/rationales/pull.md:27:63: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    def: f150b8c0dc20fe45
---

# Ask

every ticket naming a group reaches a hand, because no ticket lands under a group that already stands closed

a child minted under a closed group reaches no hand: the closed branch hands nothing out, a bare pull on trunk takes groups, and a named pull waits behind the queue, so the child stands open until somebody finishes it by hand, as `lint-twins-reads-a-standing-finding` stood

- `go test ./src/quack -run TestMintVerb` covers a mint naming a closed group, refused with the road out
- `go test ./src/quack -run TestMintVerb` covers a mint on a closed group's branch, standing free
- `./RUNME.sh check` answers 0

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

The mint refuses a new child under a closed group, and the pull stays as it stands. `pull.GroupClosed` reads whether a group stands closed, and the pull's closed-branch answer and the new `pull.ClosedGroup` refusal both read it. The mint verb refuses `--group=X` where X stands closed, and names the two roads out: mint the ticket standalone, or reopen X with `ticket pull X --back <leaf>`. On a closed group's own branch the auto-join skips X, so the ticket stands free and the mint says so. Otherwise no hand on that branch mints a standalone ticket at all. `OpensDraft` refuses a draft naming a closed group beside its `EmptyGroup` refusal, so a draft off any other mint road meets the same refusal at its open. Why the mint and not the pull: [[spec/design_output/pull#a-closed-group-hands-nothing]] keeps a closed branch from handing work out, since that work merges unread. A free ticket on trunk reaches a desk alone, because a cloud pull on trunk takes groups. Handing the child out as a free ticket therefore leaves a cloud box where it stood, while a refusal at the mint stops the stray child before it exists.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verb_mint.go mintVerb, which calls the new pull.ClosedGroup and pull.GroupClosed
- src/pull/pull.go (*It).Pull, the closed-branch answer, which reads pull.GroupClosed in place of the closedGroup method
- src/pull/pull_ticket.go (*It).OpensDraft, which calls pull.ClosedGroup
- src/quack ticket open and the pull's trivial draft, both through OpensDraft

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_mint_test.go TestMintVerb: a ticket naming a closed group comes back refused
- src/quack/verb_mint_test.go TestMintVerb: a ticket on a closed group's branch stands free
- src/pull/process_test.go: a ticket naming a closed group stands refused

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/pull/tickets.go
- src/pull/pull.go
- src/pull/pull_ticket.go
- src/quack/verb_mint.go
- src/quack/verb_mint_test.go
- src/pull/process_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files: I opened verb_mint.go, tickets.go JoinsGroup and EmptyGroup, pull.go closedGroup and pull_ticket.go OpensDraft, and each claim stands there
- the callers: grep over src for JoinsGroup, EmptyGroup and closedGroup names every caller listed
- the done_when lines: the first two name TestMintVerb cases, and the third names the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/process_test.go src/quack/verb_mint_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/pull/process_test.go
- src/quack/verb_mint_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion: the stub ClosedGroup answers nothing, the mint writes a child under the closed group named, and on the closed branch the auto-join files the ticket under it. No case fails on a compile error, because the stub stands in tickets.go.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the done_when lines: the first two meet the two TestMintVerb cases, both red, and the check line stands for implement to answer
- the doors: the mint cases run on a temp tree with git, the same fake mintTree the other cases use, and the pull case reads FakeDisk

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
The approach answers the ask: the mint, the open and `ticket set` refuse a child naming a closed group.
The refusal names both roads out, and `takeBack` writes `state: open`, so the reopen road holds.
A red test decides each `done_when` line under `TestMintVerb`: the refused mint and the free mint on `work/shut`.
TestTicketSet and TestTicketOpen cover the other two doors, and `go test ./src/pull` covers `ClosedGroup`.
The tests named pass, and `./RUNME.sh check` answers 0.
The sidebar set-field runs through `ticket set`, so it meets the same refusal.
Nothing in the phase contradicts the ask.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./... && ./RUNME.sh lint src/pull src/quack/verb_mint.go src/quack/ticket_set.go spec/design_output/pull.md spec/rationales/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the files: the four sources, the set verb, their tests, pull.md, its rationale and the size golden
- the doors: the mint, open and set cases run on temp trees, and ClosedGroup reads FakeDisk in TestGroups
- the comments: ClosedGroup, the freed branch in mintVerb and the set guard link the pull note chapter a-closed-group-takes-no-child
- one place: GroupClosed holds the closed read, and the pull, the mint, the open and the set call it

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
